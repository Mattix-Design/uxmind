/**
 * UXMind Link Fixer
 *
 * Reads link-check-report.json and applies URL fixes to the database.
 * Also updates redirected URLs to their final destination.
 *
 * Run with: npx tsx scripts/fix-links.ts
 *
 * Options:
 *   --dry-run  Show what would be updated without making changes
 *   --redirects-only  Only update redirected URLs (skip broken)
 */

import { supabase } from "./supabase-client.js";
import { readFileSync } from "fs";

interface Report {
  broken: Array<{
    id: string;
    slug: string;
    title: string;
    source_url: string;
    replacement_url: string;
  }>;
  redirected: Array<{
    id: string;
    slug: string;
    title: string;
    old_url: string;
    new_url: string;
  }>;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const redirectsOnly = process.argv.includes("--redirects-only");

  let report: Report;
  try {
    report = JSON.parse(readFileSync("scripts/link-check-report.json", "utf-8"));
  } catch {
    console.error("No report file found. Run check-links.ts first.");
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  // Fix broken links (only those with a replacement_url filled in)
  if (!redirectsOnly) {
    for (const entry of report.broken) {
      if (!entry.replacement_url) {
        console.log(`  SKIP (no replacement): ${entry.title}`);
        skipped++;
        continue;
      }

      console.log(`  FIX: ${entry.title}`);
      console.log(`    Old: ${entry.source_url}`);
      console.log(`    New: ${entry.replacement_url}`);

      if (!dryRun) {
        const { error } = await supabase
          .from("research_entries")
          .update({ source_url: entry.replacement_url })
          .eq("id", entry.id);

        if (error) {
          console.error(`    ERROR: ${error.message}`);
          continue;
        }
      }
      updated++;
    }
  }

  // Update redirected URLs to their final destination
  for (const entry of report.redirected) {
    console.log(`  REDIRECT: ${entry.title}`);
    console.log(`    Old: ${entry.old_url}`);
    console.log(`    New: ${entry.new_url}`);

    if (!dryRun) {
      const { error } = await supabase
        .from("research_entries")
        .update({ source_url: entry.new_url })
        .eq("id", entry.id);

      if (error) {
        console.error(`    ERROR: ${error.message}`);
        continue;
      }
    }
    updated++;
  }

  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Updated: ${updated}, Skipped: ${skipped}`);
}

main();
