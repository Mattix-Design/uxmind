import { NNGroupScraper } from "./scrapers/nngroup.js";

const scrapers = {
  nngroup: NNGroupScraper,
} as const;

type SourceName = keyof typeof scrapers;

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  const source = args
    .find((a) => a.startsWith("--source="))
    ?.split("=")[1] as SourceName | undefined;
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
  const limit = limitArg ? parseInt(limitArg, 10) : undefined;

  if (!source || !(source in scrapers)) {
    console.log("UXMind Ingestion Pipeline\n");
    console.log("Usage:");
    console.log(
      "  npx tsx scripts/ingest.ts --source=<name> [--dry-run] [--limit=N]\n"
    );
    console.log("Available sources:");
    for (const name of Object.keys(scrapers)) {
      console.log(`  - ${name}`);
    }
    console.log("\nFlags:");
    console.log("  --dry-run   Preview what would be ingested without writing to DB");
    console.log("  --limit=N   Only process the first N articles");
    process.exit(1);
  }

  const ScraperClass = scrapers[source];
  const scraper = new ScraperClass();

  await scraper.ingest({ dryRun, limit });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
