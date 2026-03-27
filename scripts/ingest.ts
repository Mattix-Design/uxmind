import { NNGroupScraper } from "./scrapers/nngroup.js";
import { ingestArxiv } from "./scrapers/arxiv.js";
import { ingestPubMed } from "./scrapers/pubmed.js";
import { ingestSemanticScholar } from "./scrapers/semantic-scholar.js";

type SourceName = "nngroup" | "arxiv" | "pubmed" | "semantic-scholar" | "all";

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
    console.log("Available sources:");
    console.log("  - nngroup           NNGroup articles (keyword-scored)");
    console.log("  - arxiv             arXiv cs.HC papers (AI-scored)");
    console.log("  - pubmed            PubMed cognitive/behavioural research (AI-scored)");
    console.log("  - semantic-scholar  Semantic Scholar HCI papers (AI-scored)");
    console.log("  - all               Run all sources sequentially");
    console.log("\nFlags:");
    console.log("  --dry-run   Preview what would be ingested without writing to DB");
    console.log("  --limit=N   Only process the first N articles per source");
    process.exit(1);
  }

  const sources: SourceName[] = source === "all"
    ? ["arxiv", "pubmed", "semantic-scholar", "nngroup"]
    : [source];

  for (const src of sources) {
    switch (src) {
      case "nngroup": {
        const scraper = new NNGroupScraper();
        await scraper.ingest({ dryRun, limit });
        break;
      }
      case "arxiv":
        await ingestArxiv({ dryRun, limit });
        break;
      case "pubmed":
        await ingestPubMed({ dryRun, limit });
        break;
      case "semantic-scholar":
        await ingestSemanticScholar({ dryRun, limit });
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
