/**
 * Baymard Institute scraper — targets e-commerce UX research articles
 * Uses their RSS feed for discovery, then scrapes article pages for content.
 * Baymard is one of the most authoritative sources for e-commerce UX research.
 */

import * as cheerio from "cheerio";
import { supabase } from "../supabase-client.js";
import { scoreWithAI } from "../ai-scorer.js";

const RSS_URL = "https://baymard.com/blog.rss";
const SITE_URL = "https://baymard.com";

interface BaymardArticle {
  title: string;
  url: string;
  authors: string[];
  publication_date: string | null;
  description: string;
  content: string;
}

async function fetchRSS(): Promise<BaymardArticle[]> {
  const response = await fetch(RSS_URL, {
    headers: {
      "User-Agent": "UXMind Research Bot (uxmind.ai) - Academic research aggregator",
    },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xml: true });
  const articles: BaymardArticle[] = [];

  $("item").each((_, el) => {
    const $item = $(el);

    const title = $item.find("title").text().trim();
    const url = $item.find("link").text().trim();
    const pubDate = $item.find("pubDate").text().trim();
    const description = $item.find("description").text().trim();
    const content = $item.find("content\\:encoded").text().trim() || description;

    // Extract author from dc:creator or default
    const author = $item.find("dc\\:creator").text().trim() || "Baymard Institute";

    let publication_date: string | null = null;
    if (pubDate) {
      try {
        const d = new Date(pubDate);
        publication_date = d.toISOString().split("T")[0];
      } catch {
        // ignore parse failures
      }
    }

    if (title && url) {
      articles.push({
        title,
        url,
        authors: [author],
        publication_date,
        description,
        content,
      });
    }
  });

  return articles;
}

interface ScrapedPageData {
  content: string;
  date: string | null;
  authors: string[];
}

async function scrapeArticlePage(url: string): Promise<ScrapedPageData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "UXMind Research Bot (uxmind.ai) - Academic research aggregator",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Baymard is a Next.js site — content is often in __NEXT_DATA__ or meta tags
    const parts: string[] = [];

    // Meta description (always present and high-quality)
    const metaDesc = $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") || "";
    if (metaDesc) parts.push(metaDesc);

    // Try __NEXT_DATA__ JSON for article content
    const nextData = $('script#__NEXT_DATA__').text();
    if (nextData) {
      try {
        const parsed = JSON.parse(nextData);
        const pageProps = parsed?.props?.pageProps;
        // Look for article body text in various possible locations
        const possibleContent = [
          pageProps?.article?.body,
          pageProps?.article?.content,
          pageProps?.article?.excerpt,
          pageProps?.post?.body,
          pageProps?.post?.content,
          pageProps?.blogPost?.body,
          pageProps?.blogPost?.content,
        ].filter(Boolean);

        for (const c of possibleContent) {
          if (typeof c === "string" && c.length > 50) {
            // Strip HTML tags from rich text
            parts.push(c.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
          }
        }
      } catch {
        // Ignore parse failures
      }
    }

    // Remove nav, footer etc. and try for any rendered text
    $("nav, footer, aside, header, script, style, .sidebar, .newsletter").remove();
    const bodyText = ($("article").text() || $("main").text() || "").replace(/\s+/g, " ").trim();
    if (bodyText.length > 200) parts.push(bodyText);

    // Extract date from meta or structured data
    let date: string | null = null;
    const metaDate = $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="date"]').attr("content") || "";
    if (metaDate) {
      try {
        date = new Date(metaDate).toISOString().split("T")[0];
      } catch { /* ignore */ }
    }

    // Extract author
    const authors: string[] = [];
    const metaAuthor = $('meta[name="author"]').attr("content") ||
      $('meta[property="article:author"]').attr("content") || "";
    if (metaAuthor) authors.push(metaAuthor);

    const content = parts.join(" ").trim();
    return content.length > 50 ? { content, date, authors } : null;
  } catch {
    return null;
  }
}

export async function ingestBaymard(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;

  console.log(`\n[Baymard] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`);

  let articles: BaymardArticle[];
  try {
    articles = await fetchRSS();
  } catch (err) {
    // If RSS fails, try scraping the blog index
    console.log(`  [warn] RSS failed, trying blog index...`);
    articles = await scrapeBlogIndex();
  }

  const toProcess = limit ? articles.slice(0, limit) : articles;
  console.log(`[Baymard] Found ${articles.length} articles, processing ${toProcess.length}\n`);

  let accepted = 0;
  let rejected = 0;
  let irrelevant = 0;
  let errors = 0;

  for (const article of toProcess) {
    try {
      // Check if already ingested
      const { data: existing } = await supabase
        .from("ingestion_log")
        .select("id")
        .eq("source_url", article.url)
        .limit(1);

      if (existing && existing.length > 0) {
        continue;
      }

      const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100);

      const { data: existingEntry } = await supabase
        .from("research_entries")
        .select("id")
        .eq("slug", slug)
        .limit(1);

      if (existingEntry && existingEntry.length > 0) {
        continue;
      }

      // Always scrape the article page for content + metadata
      console.log(`  [scraping] ${article.url}`);
      const pageData = await scrapeArticlePage(article.url);
      await new Promise((r) => setTimeout(r, 1500)); // Respectful delay

      let fullContent = article.content;
      if (pageData) {
        if (pageData.content.length > fullContent.length) {
          fullContent = pageData.content;
        }
        if (pageData.date && !article.publication_date) {
          article.publication_date = pageData.date;
        }
        if (pageData.authors.length > 0 && article.authors[0] === "Baymard Institute") {
          article.authors = pageData.authors;
        }
      }

      // Clean HTML tags from content for AI analysis
      const cleanContent = fullContent
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanContent.length < 50) {
        console.log(`  [skip] Too short: ${article.title.slice(0, 50)}`);
        continue;
      }

      console.log(`  [scoring] ${article.title.slice(0, 70)}...`);

      const entry = await scoreWithAI({
        title: article.title,
        url: article.url,
        authors: article.authors,
        publication_date: article.publication_date,
        abstract: cleanContent.slice(0, 4000), // Send first 4000 chars
        source_name: "Baymard Institute",
      });

      if (!entry) {
        irrelevant++;
        console.log(`    [irrelevant] Not UX-relevant or scoring failed`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: article.url,
            source_name: "Baymard Institute",
            status: "rejected",
            rejection_reason: "Not relevant to UX or AI scoring failed",
          });
        }
        continue;
      }

      if (entry.quality_score < 65) {
        rejected++;
        console.log(`    [rejected] Score ${entry.quality_score.toFixed(1)}/100`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: article.url,
            source_name: "Baymard Institute",
            status: "rejected",
            quality_score: entry.quality_score,
            rejection_reason: `Below 65 threshold (scored ${entry.quality_score.toFixed(1)})`,
          });
        }
        continue;
      }

      accepted++;
      console.log(`    [accepted] Score ${entry.quality_score.toFixed(1)}/100`);

      if (!dryRun) {
        const { error: insertError } = await supabase
          .from("research_entries")
          .insert(entry);

        if (insertError) {
          if (insertError.message.includes("duplicate")) {
            console.log(`    [skip] Duplicate entry`);
          } else {
            console.error(`    [error] Insert failed: ${insertError.message}`);
            errors++;
          }
          continue;
        }

        await supabase.from("ingestion_log").insert({
          source_url: article.url,
          source_name: "Baymard Institute",
          status: "accepted",
          quality_score: entry.quality_score,
        });
      }

      // Rate limit AI calls
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${article.title.slice(0, 50)}: ${msg}`);
      errors++;
    }
  }

  console.log(`\n[Baymard] Complete:`);
  console.log(`  Accepted:   ${accepted}`);
  console.log(`  Rejected:   ${rejected}`);
  console.log(`  Irrelevant: ${irrelevant}`);
  console.log(`  Errors:     ${errors}`);
}

/** Fallback: scrape Baymard blog archive for article links */
async function scrapeBlogIndex(): Promise<BaymardArticle[]> {
  const articles: BaymardArticle[] = [];
  // Patterns to exclude — these are not articles
  const excludePatterns = ["collections", "archive", "popular", "?page="];

  // Scrape the archive page which lists all articles
  const pagesToScrape = [
    `${SITE_URL}/blog/archive`,
    `${SITE_URL}/blog`,
  ];

  for (const pageUrl of pagesToScrape) {
    try {
      const response = await fetch(pageUrl, {
        headers: {
          "User-Agent": "UXMind Research Bot (uxmind.ai) - Academic research aggregator",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      $("a[href^='/blog/']").each((_, el) => {
        const href = $(el).attr("href") || "";
        const title = $(el).text().trim();

        // Skip non-article links
        if (excludePatterns.some((p) => href.includes(p))) return;
        if (!title || title.length < 10) return;

        const fullUrl = `${SITE_URL}${href}`;
        if (!articles.some((a) => a.url === fullUrl)) {
          articles.push({
            title,
            url: fullUrl,
            authors: ["Baymard Institute"],
            publication_date: null,
            description: "",
            content: "",
          });
        }
      });

      await new Promise((r) => setTimeout(r, 1500));
    } catch {
      continue;
    }
  }

  return articles;
}
