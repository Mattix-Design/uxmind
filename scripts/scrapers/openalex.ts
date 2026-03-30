/**
 * OpenAlex API scraper — targets HCI/UX research from the open academic graph
 * API: https://docs.openalex.org/ (free, no key required, polite pool with email)
 * Covers 250M+ works, successor to Microsoft Academic Graph
 */

import { supabase } from "../supabase-client.js";
import { scoreWithAI } from "../ai-scorer.js";

const API_BASE = "https://api.openalex.org";

// Email for polite pool (faster rate limits)
const MAILTO = "hello@uxmind.ai";

// OpenAlex concept IDs for HCI-related topics
// These are stable OpenAlex concept identifiers
const SEARCH_QUERIES = [
  // Core HCI & usability
  "usability testing user interface",
  "user experience design evaluation",
  "human computer interaction study",
  // Specific UX topics
  "eye tracking web interface gaze",
  "cognitive load interface design",
  "mobile usability touch screen",
  "accessibility web WCAG disability",
  "information architecture navigation",
  "e-commerce user experience conversion",
  "form design usability error",
  "A/B testing user behavior web",
  "visual hierarchy attention interface",
  // Data viz & dashboards
  "data visualization comprehension chart",
  "dashboard design user performance",
  // Trust & credibility
  "website credibility trust perception",
  "dark pattern deceptive design",
  "privacy user experience consent",
  // Typography & readability
  "typography readability screen font",
  "text comprehension digital reading",
  // Loading & performance
  "page load time user experience",
  "perceived performance waiting",
  // Emotion & aesthetics
  "aesthetic usability effect design",
  "emotional design user satisfaction",
  // Voice & conversational
  "voice user interface conversational",
  "chatbot usability interaction",
  // Notifications & engagement
  "notification fatigue user engagement",
  "gamification user motivation",
  // Older adults & inclusive design
  "older adults technology usability",
  "inclusive design accessibility interaction",
];

const RESULTS_PER_QUERY = 25;

// Only ingest papers with these permissive open access licenses
const ALLOWED_LICENSES = [
  "cc-by",
  "cc-by-sa",
  "cc0",
  "public-domain",
];

interface OpenAlexWork {
  id: string;
  title: string;
  abstract_inverted_index: Record<string, number[]> | null;
  authorships: { author: { display_name: string } }[];
  publication_year: number | null;
  publication_date: string | null;
  cited_by_count: number;
  primary_location: {
    source: { display_name: string } | null;
    landing_page_url: string | null;
    license: string | null;
  } | null;
  doi: string | null;
  open_access: { is_oa: boolean; oa_url: string | null } | null;
  best_oa_location: { license: string | null } | null;
}

/** OpenAlex stores abstracts as inverted indexes — reconstruct to plain text */
function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
  if (!invertedIndex) return "";
  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }
  words.sort((a, b) => a[1] - b[1]);
  return words.map(([word]) => word).join(" ");
}

function getWorkUrl(work: OpenAlexWork): string {
  // Prefer DOI, then landing page, then OpenAlex URL
  if (work.doi) return work.doi.startsWith("http") ? work.doi : `https://doi.org/${work.doi}`;
  if (work.primary_location?.landing_page_url) return work.primary_location.landing_page_url;
  if (work.open_access?.oa_url) return work.open_access.oa_url;
  // OpenAlex ID as fallback (e.g. https://openalex.org/W1234567890)
  return work.id;
}

async function searchWorks(query: string): Promise<OpenAlexWork[]> {
  const params = new URLSearchParams({
    search: query,
    per_page: String(RESULTS_PER_QUERY),
    sort: "cited_by_count:desc",
    // Only open access articles with permissive licenses
    filter: "has_abstract:true,type:article,open_access.is_oa:true",
    select: "id,title,abstract_inverted_index,authorships,publication_year,publication_date,cited_by_count,primary_location,doi,open_access,best_oa_location",
    mailto: MAILTO,
  });

  const response = await fetch(`${API_BASE}/works?${params}`, {
    headers: { "User-Agent": "UXMind Research Bot (uxmind.ai)" },
  });

  if (response.status === 429) {
    console.log("    [rate-limit] Waiting 10s...");
    await new Promise((r) => setTimeout(r, 10000));
    return searchWorks(query);
  }

  if (!response.ok) {
    throw new Error(`OpenAlex API ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function ingestOpenAlex(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;
  const allWorks: OpenAlexWork[] = [];
  const seenIds = new Set<string>();

  console.log(`\n[OpenAlex] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`);

  for (const query of SEARCH_QUERIES) {
    try {
      const works = await searchWorks(query);
      let added = 0;

      for (const work of works) {
        if (!work.title || seenIds.has(work.id)) continue;

        const abstract = reconstructAbstract(work.abstract_inverted_index);
        if (abstract.length < 100) continue;

        // Only ingest papers with permissive open access licenses
        const license = work.best_oa_location?.license ||
          work.primary_location?.license || "";
        if (!ALLOWED_LICENSES.some((l) => license.toLowerCase().includes(l))) {
          continue;
        }

        seenIds.add(work.id);
        allWorks.push(work);
        added++;
      }

      console.log(`  [query] "${query.slice(0, 50)}..." → ${added} new works`);

      // Polite pool: ~10 req/sec allowed with mailto, but be conservative
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  [warn] Query error: ${msg}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // Sort by citation count — most impactful first
  allWorks.sort((a, b) => (b.cited_by_count || 0) - (a.cited_by_count || 0));

  const toProcess = limit ? allWorks.slice(0, limit) : allWorks;
  console.log(`[OpenAlex] Found ${allWorks.length} unique works, processing ${toProcess.length}\n`);

  let accepted = 0;
  let rejected = 0;
  let irrelevant = 0;
  let errors = 0;

  for (const work of toProcess) {
    try {
      const url = getWorkUrl(work);

      // Check if already ingested
      const { data: existing } = await supabase
        .from("ingestion_log")
        .select("id")
        .eq("source_url", url)
        .limit(1);

      if (existing && existing.length > 0) {
        continue;
      }

      const slug = work.title
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

      const abstract = reconstructAbstract(work.abstract_inverted_index);
      const journal = work.primary_location?.source?.display_name || undefined;

      console.log(`  [scoring] (${work.cited_by_count} cites) ${work.title.slice(0, 65)}...`);

      const entry = await scoreWithAI({
        title: work.title,
        url,
        authors: work.authorships.map((a) => a.author.display_name),
        publication_date: work.publication_date || (work.publication_year ? `${work.publication_year}-01-01` : null),
        abstract,
        source_name: "OpenAlex",
        journal,
        citation_count: work.cited_by_count || undefined,
        doi: work.doi?.replace("https://doi.org/", "") || undefined,
      });

      if (!entry) {
        irrelevant++;
        console.log(`    [irrelevant] Not UX-relevant or scoring failed`);
        if (!dryRun) {
          await supabase.from("ingestion_log").insert({
            source_url: url,
            source_name: "OpenAlex",
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
            source_url: url,
            source_name: "OpenAlex",
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
          source_url: url,
          source_name: "OpenAlex",
          status: "accepted",
          quality_score: entry.quality_score,
        });
      }

      // Rate limit AI calls
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${work.title.slice(0, 50)}: ${msg}`);
      errors++;
    }
  }

  console.log(`\n[OpenAlex] Complete:`);
  console.log(`  Accepted:   ${accepted}`);
  console.log(`  Rejected:   ${rejected}`);
  console.log(`  Irrelevant: ${irrelevant}`);
  console.log(`  Errors:     ${errors}`);
}
