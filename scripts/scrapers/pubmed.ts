/**
 * PubMed API scraper — targets cognitive/behavioural science relevant to UX
 * Uses NCBI E-utilities API (free, no key required for <3 req/sec)
 */

import * as cheerio from "cheerio";
import { supabase } from "../supabase-client.js";
import { scoreWithAI } from "../ai-scorer.js";

// Tightly scoped queries — cognitive/behavioural science that applies to UX
// Avoids clinical, pharmaceutical, and unrelated medical research
const SEARCH_QUERIES = [
  '"cognitive load" AND ("user interface" OR "web" OR "digital")',
  '"visual attention" AND ("screen" OR "web page" OR "interface" OR "display")',
  '"decision making" AND ("online" OR "digital" OR "interface" OR "web")',
  '"eye tracking" AND ("website" OR "user interface" OR "usability")',
  '"reading comprehension" AND ("screen" OR "digital" OR "web")',
  '"human computer interaction" AND ("usability" OR "user experience")',
  '"working memory" AND ("interface" OR "display" OR "screen" OR "digital")',
  '"choice overload" AND ("online" OR "digital" OR "consumer")',
  '"banner blindness" OR "inattentional blindness" AND "web"',
  '"touch screen" AND ("usability" OR "interaction" OR "interface design")',
];

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
const RESULTS_PER_QUERY = 20;

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  abstract: string;
  journal: string;
  publication_date: string | null;
  doi: string | null;
  url: string;
}

async function searchPubMed(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: String(RESULTS_PER_QUERY),
    sort: "relevance",
    retmode: "json",
  });

  const response = await fetch(`${ESEARCH_URL}?${params}`);
  if (!response.ok) throw new Error(`PubMed search failed: ${response.status}`);

  const data = await response.json();
  return data.esearchresult?.idlist || [];
}

async function fetchPubMedDetails(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];

  const params = new URLSearchParams({
    db: "pubmed",
    id: pmids.join(","),
    retmode: "xml",
    rettype: "abstract",
  });

  const response = await fetch(`${EFETCH_URL}?${params}`);
  if (!response.ok) throw new Error(`PubMed fetch failed: ${response.status}`);

  const xml = await response.text();
  const $ = cheerio.load(xml, { xml: true });
  const articles: PubMedArticle[] = [];

  $("PubmedArticle").each((_, el) => {
    const $article = $(el);

    const pmid = $article.find("PMID").first().text();
    const title = $article.find("ArticleTitle").text().trim();

    const authors: string[] = [];
    $article.find("Author").each((_, auth) => {
      const last = $(auth).find("LastName").text();
      const first = $(auth).find("ForeName").text();
      if (last) authors.push(`${first} ${last}`.trim());
    });

    const abstractParts: string[] = [];
    $article.find("AbstractText").each((_, abs) => {
      abstractParts.push($(abs).text().trim());
    });
    const abstract = abstractParts.join(" ");

    const journal = $article.find("Journal Title").text() ||
      $article.find("ISOAbbreviation").text() || "";

    // Publication date
    const year = $article.find("PubDate Year").text();
    const month = $article.find("PubDate Month").text();
    let publication_date: string | null = null;
    if (year) {
      const monthNum = month
        ? String(new Date(`${month} 1`).getMonth() + 1).padStart(2, "0")
        : "01";
      publication_date = `${year}-${monthNum}-01`;
    }

    // DOI
    let doi: string | null = null;
    $article.find("ArticleId").each((_, id) => {
      if ($(id).attr("IdType") === "doi") {
        doi = $(id).text();
      }
    });

    const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

    if (title && abstract.length > 50) {
      articles.push({ pmid, title, authors, abstract, journal, publication_date, doi, url });
    }
  });

  return articles;
}

export async function ingestPubMed(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;
  const allArticles: PubMedArticle[] = [];
  const seenIds = new Set<string>();

  console.log(`\n[PubMed] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`);

  for (const query of SEARCH_QUERIES) {
    try {
      const pmids = await searchPubMed(query);
      console.log(`  [query] "${query.slice(0, 55)}..." → ${pmids.length} results`);

      if (pmids.length > 0) {
        const articles = await fetchPubMedDetails(pmids);
        for (const article of articles) {
          if (!seenIds.has(article.pmid)) {
            seenIds.add(article.pmid);
            allArticles.push(article);
          }
        }
      }

      // PubMed rate limit: 3 requests/sec without API key
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  [warn] Query error: ${msg}`);
    }
  }

  const toProcess = limit ? allArticles.slice(0, limit) : allArticles;
  console.log(`[PubMed] Found ${allArticles.length} unique articles, processing ${toProcess.length}\n`);

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

      console.log(`  [scoring] ${article.title.slice(0, 70)}...`);

      const entry = await scoreWithAI({
        title: article.title,
        url: article.url,
        authors: article.authors,
        publication_date: article.publication_date,
        abstract: article.abstract,
        source_name: "PubMed",
        journal: article.journal,
        doi: article.doi || undefined,
      });

      if (!entry) {
        irrelevant++;
        console.log(`    [irrelevant] Not UX-relevant or scoring failed`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: article.url,
            source_name: "PubMed",
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
            source_name: "PubMed",
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
          console.error(`    [error] Insert failed: ${insertError.message}`);
          errors++;
          continue;
        }

        await supabase.from("ingestion_log").insert({
          source_url: article.url,
          source_name: "PubMed",
          status: "accepted",
          quality_score: entry.quality_score,
        });
      }

      // Rate limit AI calls
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${article.title.slice(0, 50)}: ${msg}`);
      errors++;
    }
  }

  console.log(`\n[PubMed] Complete:`);
  console.log(`  Accepted:   ${accepted}`);
  console.log(`  Rejected:   ${rejected}`);
  console.log(`  Irrelevant: ${irrelevant}`);
  console.log(`  Errors:     ${errors}`);
}
