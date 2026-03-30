import { ingestArxiv } from "./scrapers/arxiv.js";
import { ingestPubMed } from "./scrapers/pubmed.js";
import { ingestSemanticScholar } from "./scrapers/semantic-scholar.js";
import { ingestOpenAlex } from "./scrapers/openalex.js";

type SourceName = "arxiv" | "pubmed" | "semantic-scholar" | "openalex" | "all";

async function main() {
  const args = process.argv.slice(2);

  const source = args
    .find((a) => a.startsWith("--source="))
    ?.split("=")[1] as SourceName | undefined;
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
  const limit = limitArg ? parseInt(limitArg, 10) : undefined;

  if (!source) {
    console.log("UXMind Ingestion Pipeline\n");
    console.log("Usage:");
    console.log("  npx tsx scripts/ingest.ts --source=<name> [--dry-run] [--limit=N]\n");
    console.log("Available sources (all open access only):");
    console.log("  - arxiv             arXiv cs.HC papers — CC-BY/CC0 only (AI-scored)");
    console.log("  - pubmed            PubMed Central open access research (AI-scored)");
    console.log("  - semantic-scholar  Semantic Scholar open access HCI papers (AI-scored)");
    console.log("  - openalex          OpenAlex — CC-BY/CC0 open access works (AI-scored)");
    console.log("  - all               Run all sources sequentially");
    console.log("\nFlags:");
    console.log("  --dry-run   Preview what would be ingested without writing to DB");
    console.log("  --limit=N   Only process the first N articles per source");
    process.exit(1);
  }

  const sources: SourceName[] = source === "all"
    ? ["openalex", "arxiv", "pubmed", "semantic-scholar"]
    : [source];

  for (const src of sources) {
    switch (src) {
      case "arxiv":
        await ingestArxiv({ dryRun, limit });
        break;
      case "pubmed":
        await ingestPubMed({ dryRun, limit });
        break;
      case "semantic-scholar":
        await ingestSemanticScholar({ dryRun, limit });
        break;
      case "openalex":
        await ingestOpenAlex({ dryRun, limit });
        break;
      default:
        console.error(`Unknown source: ${src}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
