import * as cheerio from "cheerio";
import { supabase } from "../supabase-client.js";
import type {
  ResearchType,
  SiteContext,
  ScoringBreakdown,
} from "../../packages/types/src/research.js";

export interface ScrapedArticle {
  title: string;
  url: string;
  authors: string[];
  publication_date: string | null;
  content_text: string;
  methodology_summary: string | null;
  sample_size: string | null;
}

export interface IngestableEntry {
  title: string;
  slug: string;
  attributed_summary: string;
  source_url: string;
  source_name: string;
  authors: string[];
  publication_date: string | null;
  research_type: ResearchType;
  site_contexts: SiteContext[];
  quality_score: number;
  scoring_track: ResearchType;
  scoring_breakdown: ScoringBreakdown;
  key_findings: string[];
  methodology_summary: string | null;
  sample_size: string | null;
  limitations: string[];
  tags: string[];
  status: "draft" | "published";
}

export abstract class BaseScraper {
  abstract sourceName: string;
  abstract baseUrl: string;

  protected async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "UXMind Research Bot (uxmind.ai) - Academic research aggregator",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`);
    }

    return response.text();
  }

  protected loadHtml(html: string) {
    return cheerio.load(html);
  }

  protected slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);
  }

  abstract discoverArticleUrls(): Promise<string[]>;

  abstract scrapeArticle(url: string): Promise<ScrapedArticle>;

  abstract buildEntry(article: ScrapedArticle): Promise<IngestableEntry | null>;

  async ingest(options: { dryRun?: boolean; limit?: number } = {}) {
    const { dryRun = false, limit } = options;

    console.log(
      `\n[${this.sourceName}] Starting ingestion${dryRun ? " (DRY RUN)" : ""}...`
    );

    const urls = await this.discoverArticleUrls();
    const toProcess = limit ? urls.slice(0, limit) : urls;

    console.log(
      `[${this.sourceName}] Found ${urls.length} articles, processing ${toProcess.length}`
    );

    let accepted = 0;
    let rejected = 0;
    let errors = 0;

    for (const url of toProcess) {
      try {
        // Check if already ingested
        const { data: existing } = await supabase
          .from("ingestion_log")
          .select("id")
          .eq("source_url", url)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`  [skip] Already ingested: ${url}`);
          continue;
        }

        console.log(`  [scraping] ${url}`);
        const article = await this.scrapeArticle(url);
        const entry = await this.buildEntry(article);

        if (!entry) {
          console.log(`  [skip] Could not build entry for: ${url}`);
          continue;
        }

        if (entry.quality_score < 65) {
          console.log(
            `  [rejected] Score ${entry.quality_score}/100: ${entry.title}`
          );
          rejected++;

          if (!dryRun) {
            await supabase.from("ingestion_log").insert({
              source_url: url,
              source_name: this.sourceName,
              status: "rejected",
              quality_score: entry.quality_score,
              rejection_reason: `Below 65 threshold (scored ${entry.quality_score})`,
            });
          }
          continue;
        }

        console.log(
          `  [accepted] Score ${entry.quality_score}/100: ${entry.title}`
        );
        accepted++;

        if (!dryRun) {
          const { error: insertError } = await supabase
            .from("research_entries")
            .insert(entry);

          if (insertError) {
            console.error(`  [error] Insert failed: ${insertError.message}`);
            errors++;
            continue;
          }

          await supabase.from("ingestion_log").insert({
            source_url: url,
            source_name: this.sourceName,
            status: "accepted",
            quality_score: entry.quality_score,
          });
        }

        // Rate limiting — be respectful
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  [error] ${url}: ${message}`);
        errors++;
      }
    }

    console.log(`\n[${this.sourceName}] Complete:`);
    console.log(`  Accepted: ${accepted}`);
    console.log(`  Rejected: ${rejected}`);
    console.log(`  Errors:   ${errors}`);
  }
}
