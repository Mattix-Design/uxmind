/**
 * Semantic Scholar API scraper — targets HCI/UX papers with citation data
 * API: https://api.semanticscholar.org/ (free, 100 req/5 min without key)
 */

import { supabase } from "../supabase-client.js";
import { scoreWithAI } from "../ai-scorer.js";

const API_BASE = "https://api.semanticscholar.org/graph/v1";

// Tightly scoped UX/HCI search queries
const SEARCH_QUERIES = [
  "usability testing user interface web",
  "eye tracking web page reading pattern",
  "cognitive load user interface design",
  "mobile usability touch screen interaction",
  "e-commerce checkout abandonment user experience",
  "form design usability completion rate",
  "navigation menu information architecture usability",
  "accessibility web WCAG usability",
  "A/B testing web design user behavior",
  "visual hierarchy web page attention",
  "color contrast readability user interface",
  "responsive design mobile desktop usability",
  "search interface usability filtering",
  "onboarding user experience retention",
  "microinteraction animation user engagement",
  "dark pattern deceptive design user",
  "Fitts law target size touch interface",
  "banner blindness web advertising attention",
  "scrolling behavior web page engagement",
  "error message design user recovery",
];

const RESULTS_PER_QUERY = 20;
const FIELDS = "paperId,title,abstract,authors,year,citationCount,journal,externalIds,url,fieldsOfStudy";

interface SemanticPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: { name: string }[];
  year: number | null;
  citationCount: number | null;
  journal: { name: string } | null;
  externalIds: { DOI?: string } | null;
  url: string;
  fieldsOfStudy: string[] | null;
}

async function searchPapers(query: string): Promise<SemanticPaper[]> {
  const params = new URLSearchParams({
    query,
    limit: String(RESULTS_PER_QUERY),
    fields: FIELDS,
    fieldsOfStudy: "Computer Science,Psychology",
  });

  const response = await fetch(`${API_BASE}/paper/search?${params}`, {
    headers: { "User-Agent": "UXMind Research Bot (uxmind.ai)" },
  });

  if (response.status === 429) {
    console.log("    [rate-limit] Waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    return searchPapers(query);
  }

  if (!response.ok) {
    throw new Error(`Semantic Scholar API ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

export async function ingestSemanticScholar(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;
  const allPapers: SemanticPaper[] = [];
  const seenIds = new Set<string>();

  console.log(`\n[Semantic Scholar] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`);

  for (const query of SEARCH_QUERIES) {
    try {
      const papers = await searchPapers(query);
      let added = 0;

      for (const paper of papers) {
        // Filter: must have abstract and be CS/Psychology
        if (
          !paper.abstract ||
          paper.abstract.length < 100 ||
          seenIds.has(paper.paperId)
        ) {
          continue;
        }

        seenIds.add(paper.paperId);
        allPapers.push(paper);
        added++;
      }

      console.log(`  [query] "${query.slice(0, 50)}..." → ${added} new papers`);

      // Rate limit: ~100 req / 5 min = 1 req / 3 sec
      await new Promise((r) => setTimeout(r, 3500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  [warn] Query error: ${msg}`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  // Sort by citation count (highest first) — prioritise impactful research
  allPapers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));

  const toProcess = limit ? allPapers.slice(0, limit) : allPapers;
  console.log(`[Semantic Scholar] Found ${allPapers.length} unique papers, processing ${toProcess.length}\n`);

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

      console.log(`  [scoring] (${paper.citationCount || 0} cites) ${paper.title.slice(0, 65)}...`);

      const entry = await scoreWithAI({
        title: paper.title,
        url: paper.url,
        authors: paper.authors.map((a) => a.name),
        publication_date: paper.year ? `${paper.year}-01-01` : null,
        abstract: paper.abstract!,
        source_name: "Semantic Scholar",
        journal: paper.journal?.name,
        citation_count: paper.citationCount || undefined,
        doi: paper.externalIds?.DOI,
      });

      if (!entry) {
        irrelevant++;
        console.log(`    [irrelevant] Not UX-relevant or scoring failed`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: paper.url,
            source_name: "Semantic Scholar",
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
            source_name: "Semantic Scholar",
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
          // Handle duplicate slug conflicts gracefully
          if (insertError.message.includes("duplicate")) {
            console.log(`    [skip] Duplicate entry`);
          } else {
            console.error(`    [error] Insert failed: ${insertError.message}`);
            errors++;
          }
          continue;
        }

        await supabase.from("ingestion_log").insert({
          source_url: paper.url,
          source_name: "Semantic Scholar",
          status: "accepted",
          quality_score: entry.quality_score,
        });
      }

      // Rate limit AI calls
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${paper.title.slice(0, 50)}: ${msg}`);
      errors++;
    }
  }

  console.log(`\n[Semantic Scholar] Complete:`);
  console.log(`  Accepted:   ${accepted}`);
  console.log(`  Rejected:   ${rejected}`);
  console.log(`  Irrelevant: ${irrelevant}`);
  console.log(`  Errors:     ${errors}`);
}
