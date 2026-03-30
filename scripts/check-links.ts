/**
 * UXMind Source Link Checker
 *
 * Validates all source_url values in research_entries to catch 404s and broken links.
 * Run with: npx tsx scripts/check-links.ts
 *
 * Options:
 *   --fix     Write a report file with broken links and suggested replacements
 *   --update  Apply fixes from the report (updates database rows)
 */

import { supabase } from "./supabase-client.js";

interface LinkResult {
  id: string;
  title: string;
  slug: string;
  source_url: string;
  source_name: string;
  status: number | "error";
  ok: boolean;
  error?: string;
  redirectedTo?: string;
}

const CONCURRENCY = 5;
const TIMEOUT_MS = 15_000;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function checkUrl(url: string): Promise<{ status: number | "error"; ok: boolean; error?: string; redirectedTo?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Use HEAD first, fall back to GET if HEAD is rejected
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
    });

    // Some sites reject HEAD — retry with GET
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": USER_AGENT },
      });
    }

    const redirectedTo = res.redirected ? res.url : undefined;

    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      redirectedTo,
    };
  } catch (err: any) {
    return {
      status: "error",
      ok: false,
      error: err.code ?? err.message ?? String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function runBatch<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  console.log("Fetching all published research entries...\n");

  const { data: entries, error } = await supabase
    .from("research_entries")
    .select("id, title, slug, source_url, source_name")
    .eq("status", "published")
    .order("title", { ascending: true });

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("No published entries found.");
    return;
  }

  console.log(`Found ${entries.length} entries. Checking URLs (${CONCURRENCY} at a time)...\n`);

  let checked = 0;
  const results: LinkResult[] = await runBatch(entries, CONCURRENCY, async (entry) => {
    const result = await checkUrl(entry.source_url);
    checked++;

    const icon = result.ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
    const statusStr = result.status === "error" ? `ERR: ${result.error}` : `${result.status}`;
    process.stdout.write(`  ${icon} [${checked}/${entries.length}] ${statusStr} — ${entry.title.slice(0, 60)}\n`);

    return {
      id: entry.id,
      title: entry.title,
      slug: entry.slug,
      source_url: entry.source_url,
      source_name: entry.source_name,
      ...result,
    };
  });

  // Summary
  const broken = results.filter((r) => !r.ok);
  const redirected = results.filter((r) => r.ok && r.redirectedTo);

  console.log("\n" + "=".repeat(70));
  console.log(`RESULTS: ${results.length} total, ${results.length - broken.length} OK, ${broken.length} broken`);
  if (redirected.length > 0) {
    console.log(`         ${redirected.length} redirected (still reachable)`);
  }
  console.log("=".repeat(70));

  if (broken.length > 0) {
    console.log("\n\x1b[31mBROKEN LINKS:\x1b[0m\n");
    for (const r of broken) {
      console.log(`  Title:  ${r.title}`);
      console.log(`  URL:    ${r.source_url}`);
      console.log(`  Status: ${r.status}${r.error ? ` (${r.error})` : ""}`);
      console.log(`  Slug:   ${r.slug}`);
      console.log();
    }
  }

  if (redirected.length > 0) {
    console.log("\n\x1b[33mREDIRECTED (consider updating):\x1b[0m\n");
    for (const r of redirected) {
      console.log(`  Title:    ${r.title}`);
      console.log(`  Old URL:  ${r.source_url}`);
      console.log(`  New URL:  ${r.redirectedTo}`);
      console.log();
    }
  }

  // Write report file
  if (broken.length > 0 || redirected.length > 0) {
    const report = {
      checkedAt: new Date().toISOString(),
      totalEntries: results.length,
      okCount: results.length - broken.length,
      brokenCount: broken.length,
      redirectedCount: redirected.length,
      broken: broken.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        source_url: r.source_url,
        source_name: r.source_name,
        status: r.status,
        error: r.error,
        replacement_url: "", // fill in manually
      })),
      redirected: redirected.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        old_url: r.source_url,
        new_url: r.redirectedTo,
      })),
    };

    const reportPath = "scripts/link-check-report.json";
    const { writeFileSync } = await import("fs");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to ${reportPath}`);
    console.log("Fill in replacement_url for broken links, then run: npx tsx scripts/fix-links.ts");
  }

  process.exit(broken.length > 0 ? 1 : 0);
}

main();
