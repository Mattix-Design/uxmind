/**
 * arXiv API scraper — targets cs.HC (Human-Computer Interaction) papers
 * API docs: https://info.arxiv.org/help/api/basics.html
 */

import * as cheerio from "cheerio";
import { supabase } from "../supabase-client.js";
import { scoreWithAI } from "../ai-scorer.js";

// Focused HCI/UX search queries
const SEARCH_QUERIES = [
  'cat:cs.HC AND (usability OR "user experience" OR "user interface")',
  'cat:cs.HC AND ("interaction design" OR "web design" OR "mobile usability")',
  'cat:cs.HC AND ("cognitive load" OR "visual attention" OR "eye tracking")',
  'cat:cs.HC AND ("accessibility" OR "inclusive design" OR WCAG)',
  'cat:cs.HC AND ("information architecture" OR navigation OR "search interface")',
  'cat:cs.HC AND ("form design" OR "checkout" OR "e-commerce")',
  'cat:cs.HC AND ("A/B test" OR "user testing" OR "usability study")',
  'cat:cs.HC AND ("heuristic evaluation" OR "user research" OR "task completion")',
];

const ARXIV_API = "http://export.arxiv.org/api/query";
const RESULTS_PER_QUERY = 30;

interface ArxivPaper {
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  arxivId: string;
  url: string;
  categories: string[];
}

function parseArxivResponse(xml: string): ArxivPaper[] {
  const $ = cheerio.load(xml, { xml: true });
  const papers: ArxivPaper[] = [];

  $("entry").each((_, entry) => {
    const $entry = $(entry);

    const title = $entry.find("title").text().replace(/\s+/g, " ").trim();
    const abstract = $entry.find("summary").text().replace(/\s+/g, " ").trim();
    const published = $entry.find("published").text().split("T")[0];
    const arxivId = $entry.find("id").text().split("/abs/").pop() || "";

    const authors: string[] = [];
    $entry.find("author name").each((_, el) => {
      authors.push($(el).text().trim());
    });

    const categories: string[] = [];
    $entry.find("category").each((_, el) => {
      const term = $(el).attr("term");
      if (term) categories.push(term);
    });

    const url = `https://arxiv.org/abs/${arxivId}`;

    if (title && abstract) {
      papers.push({ title, authors, abstract, published, arxivId, url, categories });
    }
  });

  return papers;
}

export async function ingestArxiv(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;
  const allPapers: ArxivPaper[] = [];
  const seenIds = new Set<string>();

  console.log(`\n[arXiv] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`);

  // Fetch papers from each query
  for (const query of SEARCH_QUERIES) {
    try {
      const params = new URLSearchParams({
        search_query: query,
        start: "0",
        max_results: String(RESULTS_PER_QUERY),
        sortBy: "relevance",
        sortOrder: "descending",
      });

      const response = await fetch(`${ARXIV_API}?${params}`);
      if (!response.ok) {
        console.log(`  [warn] Query failed: ${query}`);
        continue;
      }

      const xml = await response.text();
      const papers = parseArxivResponse(xml);

      for (const paper of papers) {
        if (!seenIds.has(paper.arxivId)) {
          seenIds.add(paper.arxivId);
          allPapers.push(paper);
        }
      }

      console.log(`  [query] "${query.slice(0, 60)}..." → ${papers.length} papers`);

      // arXiv rate limit: 1 request per 3 seconds
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  [warn] Query error: ${msg}`);
    }
  }

  const toProcess = limit ? allPapers.slice(0, limit) : allPapers;
  console.log(`[arXiv] Found ${allPapers.length} unique papers, processing ${toProcess.length}\n`);

  let accepted = 0;
  let rejected = 0;
  let irrelevant = 0;
  let errors = 0;

  for (const paper of toProcess) {
    try {
      // Check if already ingested
      const { data: existing } = await supabase
        .from("ingestion_log")
        .select("id")
        .eq("source_url", paper.url)
        .limit(1);

      if (existing && existing.length > 0) {
        continue;
      }

      // Also check by slug
      const slug = paper.title
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

      console.log(`  [scoring] ${paper.title.slice(0, 70)}...`);

      const entry = await scoreWithAI({
        title: paper.title,
        url: paper.url,
        authors: paper.authors,
        publication_date: paper.published,
        abstract: paper.abstract,
        source_name: "arXiv",
        doi: paper.arxivId,
      });

      if (!entry) {
        irrelevant++;
        console.log(`    [irrelevant] Not UX-relevant or scoring failed`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: paper.url,
            source_name: "arXiv",
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
            source_url: paper.url,
            source_name: "arXiv",
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
          source_url: paper.url,
          source_name: "arXiv",
          status: "accepted",
          quality_score: entry.quality_score,
        });
      }

      // Rate limit AI calls
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${paper.title.slice(0, 50)}: ${msg}`);
      errors++;
    }
  }

  console.log(`\n[arXiv] Complete:`);
  console.log(`  Accepted:   ${accepted}`);
  console.log(`  Rejected:   ${rejected}`);
  console.log(`  Irrelevant: ${irrelevant}`);
  console.log(`  Errors:     ${errors}`);
}
