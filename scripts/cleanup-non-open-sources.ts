/**
 * Cleanup script: removes all research entries from non-open-access sources.
 *
 * UXMind only ingests research that is:
 * - Published under open access licenses (CC-BY, CC0, CC-BY-SA)
 * - From academic conferences/journals (standard citation practice)
 * - From government/standards bodies (public domain / open license)
 *
 * This script removes entries from copyrighted practitioner/corporate sources
 * that do not permit republishing, summarising, or derivative works.
 */

import { supabase } from "./supabase-client.js";

// ── Sources that are ALLOWED (open access, academic, government) ──────────
// Everything NOT matching these patterns will be removed.
const ALLOWED_SOURCE_PATTERNS = [
  // Academic conferences (standard academic citation)
  "ACM",           // ACM CHI, CSCW, SIGIR, ASSETS, etc.
  "IEEE",          // IEEE conferences and journals
  "Proceedings",   // Conference proceedings

  // Academic journals (standard academic citation)
  "International Journal of Human-Computer",
  "Computers in Human Behavior",
  "Behaviour & Information Technology",
  "Journal of Retailing",
  "Journal of Business Research",
  "Journal of Marketing Research",
  "Journal of the Academy of Marketing Science",
  "Journal of the American Statistical Association",
  "Journal of Personality and Social Psychology",
  "Journal of Empirical Legal Studies",
  "Electronic Commerce Research and Applications",
  "Educational Psychology Review",
  "Management Decision",
  "User Modeling and User-Adapted Interaction",
  "Universal Access in the Information Society",

  // Government & standards bodies (public domain / open license)
  "W3C",
  "WAI",
  "WebAIM",        // WebAIM survey data is openly published
  "Federal Trade Commission",
  "European Commission",
  "Norwegian Consumer Council",
  "International Organization for Standardization",
  "Overlay Fact Sheet",
  "International Longevity Centre",

  // University research (academic)
  "MIT",
  "Princeton",
  "Northwestern",
  "Spiegel Research",

  // Open data sources
  "HTTP Archive",  // CC-BY licensed open data
  "WPO Stats",     // Community-curated open data

  // API-ingested academic sources (license-filtered)
  "arXiv",
  "PubMed",
  "Semantic Scholar",
  "OpenAlex",
];

// ── Sources to EXPLICITLY REMOVE ──────────────────────────────────────────
// These sources have terms that prohibit republishing/summarising.
const BLOCKED_SOURCES_LOG = [
  "Nielsen Norman Group",
  "NNGroup",
  "Baymard Institute",
  "CXL Institute",
  "Smashing Magazine",
  "Forrester Research",
  "McKinsey & Company",
  "Deloitte Digital",
  "Google Web Dev",
  "Google Web.dev",
  "Google Web Fundamentals",
  "Google Material Design",
  "Google Research",
  "Google / Ipsos",
  "Google / Think with Google",
  "Think with Google",
  "V8 Blog",
  "Android Developers",
  "Adobe",
  "Microsoft Design",
  "Microsoft Clarity",
  "Contentsquare",
  "Hotjar",
  "Amplitude",
  "Mixpanel",
  "Appcues",
  "Intercom",
  "Pendo",
  "UserZoom",
  "UserPilot",
  "Userpilot",
  "UserTesting",
  "User Interviews",
  "Gainsight",
  "LaunchDarkly",
  "ProductBoard",
  "Maze",
  "Shopify",
  "Unbounce",
  "Algolia",
  "Constructor.io",
  "Syte",
  "Narvar",
  "Search Engine Land",
  "Reforge",
  "MeasuringU",
  "Steve Krug",
  "CRC Press",
  "UX Collective",
  "UX Matters",
  "Portent",
  "Price Intelligently",
  "ProfitWell",
  "Ponemon Institute",
  "Cloudflare",
  "Akamai",
  "Sparkbox",
  "Statista",
  "GWI",
  "GlobalWebIndex",
];

function isAllowed(sourceName: string): boolean {
  return ALLOWED_SOURCE_PATTERNS.some(
    (pattern) => sourceName.toLowerCase().includes(pattern.toLowerCase())
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  UXMind: Non-Open-Source Content Cleanup`);
  console.log(`  Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE — will delete entries"}`);
  console.log(`${"=".repeat(60)}\n`);

  // Fetch all entries
  const { data: entries, error } = await supabase
    .from("research_entries")
    .select("id, title, source_name, source_url")
    .order("source_name");

  if (error) {
    console.error("Failed to fetch entries:", error.message);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("No entries found in database.");
    return;
  }

  console.log(`Total entries in database: ${entries.length}\n`);

  const toKeep: typeof entries = [];
  const toRemove: typeof entries = [];

  for (const entry of entries) {
    if (isAllowed(entry.source_name)) {
      toKeep.push(entry);
    } else {
      toRemove.push(entry);
    }
  }

  // Report what will be removed
  console.log(`── ENTRIES TO REMOVE (${toRemove.length}) ──\n`);
  const removeBySrc = new Map<string, number>();
  for (const entry of toRemove) {
    removeBySrc.set(entry.source_name, (removeBySrc.get(entry.source_name) || 0) + 1);
  }
  for (const [src, count] of [...removeBySrc.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ✗ ${src}: ${count} entries`);
  }

  console.log(`\n── ENTRIES TO KEEP (${toKeep.length}) ──\n`);
  const keepBySrc = new Map<string, number>();
  for (const entry of toKeep) {
    keepBySrc.set(entry.source_name, (keepBySrc.get(entry.source_name) || 0) + 1);
  }
  for (const [src, count] of [...keepBySrc.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ✓ ${src}: ${count} entries`);
  }

  console.log(`\n── SUMMARY ──\n`);
  console.log(`  Removing: ${toRemove.length} entries from ${removeBySrc.size} sources`);
  console.log(`  Keeping:  ${toKeep.length} entries from ${keepBySrc.size} sources`);

  if (dryRun) {
    console.log(`\n  [DRY RUN] No changes made. Run without --dry-run to delete.\n`);
    return;
  }

  // Delete in batches
  console.log(`\n  Deleting ${toRemove.length} entries...`);

  const idsToRemove = toRemove.map((e) => e.id);
  const BATCH_SIZE = 50;

  for (let i = 0; i < idsToRemove.length; i += BATCH_SIZE) {
    const batch = idsToRemove.slice(i, i + BATCH_SIZE);
    const { error: deleteError } = await supabase
      .from("research_entries")
      .delete()
      .in("id", batch);

    if (deleteError) {
      console.error(`  [error] Batch delete failed: ${deleteError.message}`);
    } else {
      console.log(`  [deleted] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} entries`);
    }
  }

  // Also clean up ingestion_log for removed sources
  console.log(`\n  Cleaning ingestion_log...`);
  for (const src of BLOCKED_SOURCES_LOG) {
    await supabase
      .from("ingestion_log")
      .delete()
      .ilike("source_name", `%${src}%`);
  }

  // Verify final count
  const { count } = await supabase
    .from("research_entries")
    .select("*", { count: "exact", head: true });

  console.log(`\n  ✓ Cleanup complete. ${count} entries remaining in database.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
