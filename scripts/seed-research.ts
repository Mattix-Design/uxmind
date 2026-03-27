/**
 * UXMind Manual Research Seeder
 *
 * Phase 1 approach: manually curated research entries with proper scoring.
 * Run with: npx tsx scripts/seed-research.ts
 */

import { supabase } from "./supabase-client.js";
import { calculateScore } from "../packages/scoring/src/calculator.js";
import type { ResearchType, SiteContext } from "../packages/types/src/research.js";
import type { ScoreInput } from "../packages/scoring/src/calculator.js";

interface ManualEntry {
  title: string;
  source_url: string;
  source_name: string;
  authors: string[];
  publication_date: string | null;
  research_type: ResearchType;
  site_contexts: SiteContext[];
  attributed_summary: string;
  key_findings: string[];
  methodology_summary: string | null;
  sample_size: string | null;
  limitations: string[];
  tags: string[];
  scores: ScoreInput[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// ─── Curated Research Entries ────────────────────────────────────────────────

const entries: ManualEntry[] = [
  {
    title: "The Impact of Page Load Time on Bounce Rate and User Engagement",
    source_url: "https://www.nngroup.com/articles/response-times-3-important-limits/",
    source_name: "NNGroup",
    authors: ["Jakob Nielsen"],
    publication_date: "2010-06-21",
    research_type: "user_testing",
    site_contexts: ["ecommerce_general", "saas", "landing_pages"],
    attributed_summary:
      "Research examining the three critical time limits in user interface response times: 0.1 seconds (instantaneous feel), 1.0 seconds (flow maintained), and 10 seconds (attention limit). Studies show users perceive delays above 1 second as the system 'working' and above 10 seconds will leave. These thresholds have been consistently validated across decades of HCI research and remain foundational to web performance optimization.",
    key_findings: [
      "0.1 second is the limit for users feeling that the system is reacting instantaneously",
      "1.0 second is the limit for the user's flow of thought to stay uninterrupted, though they will notice the delay",
      "10 seconds is the limit for keeping the user's attention focused on the dialogue",
      "Response times above 10 seconds cause users to want to perform other tasks while waiting",
      "Progress indicators are needed for any action taking more than 1 second",
    ],
    methodology_summary:
      "Meta-analysis of HCI research on response times, building on original research by Card, Moran, and Newell (1983) and Miller (1968). Validated across multiple lab studies and field observations.",
    sample_size: "Multiple studies aggregated",
    limitations: [
      "Original research conducted in pre-web era, though findings validated on web",
      "Exact thresholds may vary by context and user expectations",
    ],
    tags: ["performance", "response-time", "usability", "nngroup", "web-performance"],
    scores: [
      { criterion_name: "Sample size", score: 7 },
      { criterion_name: "Participant recruitment methodology", score: 6 },
      { criterion_name: "Demographic diversity and representation", score: 5 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 7 },
      { criterion_name: "Task success rate reported", score: 6 },
      { criterion_name: "Error rate documented", score: 5 },
      { criterion_name: "Time-on-task measured", score: 9 },
      { criterion_name: "Peer review status", score: 7 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Publication date (recency)", score: 5 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 9 },
    ],
  },
  {
    title: "Baymard Institute: Cart Abandonment Rate Statistics",
    source_url: "https://baymard.com/lists/cart-abandonment-rate",
    source_name: "Baymard Institute",
    authors: ["Baymard Institute Research Team"],
    publication_date: "2024-01-15",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_checkout", "ecommerce_general"],
    attributed_summary:
      "Comprehensive meta-analysis of 49 different studies on e-commerce cart abandonment rates, finding an average documented online shopping cart abandonment rate of 70.19%. The research aggregates data from multiple independent studies spanning 2012-2024, providing the most widely-cited benchmark for checkout abandonment in e-commerce.",
    key_findings: [
      "The average cart abandonment rate across 49 studies is 70.19%",
      "Extra costs (shipping, tax, fees) are the #1 reason for abandonment at 48%",
      "Being forced to create an account causes 26% of abandonments",
      "Checkout process being too long or complicated causes 22% of abandonments",
      "Not being able to see total order cost upfront causes 21% of abandonments",
    ],
    methodology_summary:
      "Meta-analysis aggregating 49 independent studies on cart abandonment rates from 2012-2024. Studies were weighted by sample size and methodology quality.",
    sample_size: "49 studies aggregated, millions of e-commerce sessions",
    limitations: [
      "Individual study methodologies vary in rigor",
      "Definition of 'abandonment' may differ across studies",
      "Skewed toward English-language e-commerce markets",
    ],
    tags: ["ecommerce", "cart-abandonment", "checkout", "conversion", "baymard"],
    scores: [
      { criterion_name: "Total data volume", score: 9 },
      { criterion_name: "Time period covered", score: 9 },
      { criterion_name: "Industry vertical relevance", score: 10 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 6 },
      { criterion_name: "Geographic spread of data", score: 5 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 10 },
      { criterion_name: "Conflict of interest disclosure", score: 6 },
    ],
  },
  {
    title: "F-Shaped Pattern of Reading on the Web: Misunderstood, But Still Relevant",
    source_url: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/",
    source_name: "NNGroup",
    authors: ["Kara Pernice"],
    publication_date: "2017-11-12",
    research_type: "user_testing",
    site_contexts: ["content_publishing", "news_media", "ecommerce_discovery"],
    attributed_summary:
      "Eye-tracking research with 45 participants showing that users tend to scan web content in an F-shaped pattern — reading horizontally across the top, then moving down the left side. The study found this pattern occurs when content lacks clear visual hierarchy, proper formatting, or when users are scanning rather than committed reading. The research updates earlier NNGroup eye-tracking findings with nuance about when and why the pattern occurs.",
    key_findings: [
      "Users consistently exhibit F-shaped reading patterns on text-heavy pages without clear visual hierarchy",
      "The F-pattern is a symptom of poor content design, not a desirable user behaviour",
      "Proper use of headings, bullet points, and bold keywords reduces F-pattern scanning",
      "Users read more thoroughly when content has strong visual hierarchy and clear information scent",
      "The pattern is more pronounced on desktop than mobile due to wider line lengths",
    ],
    methodology_summary:
      "Eye-tracking study using Tobii eye trackers with 45 participants across multiple websites. Gaze patterns were recorded and analysed for fixation duration and scan paths.",
    sample_size: "45 participants",
    limitations: [
      "Lab-based study may not fully represent natural browsing behaviour",
      "Websites tested may not represent all content types",
    ],
    tags: ["eye-tracking", "reading-patterns", "content-design", "nngroup", "visual-hierarchy"],
    scores: [
      { criterion_name: "Sample size", score: 7 },
      { criterion_name: "Participant recruitment methodology", score: 7 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 8 },
      { criterion_name: "Task success rate reported", score: 5 },
      { criterion_name: "Error rate documented", score: 4 },
      { criterion_name: "Time-on-task measured", score: 7 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 8 },
      { criterion_name: "Publication date (recency)", score: 7 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 8 },
    ],
  },
  {
    title: "Contentsquare 2024 Digital Experience Benchmark Report",
    source_url: "https://contentsquare.com/insights/digital-experience-benchmark/",
    source_name: "Contentsquare",
    authors: ["Contentsquare Research Team"],
    publication_date: "2024-03-01",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "saas", "landing_pages", "mobile_app"],
    attributed_summary:
      "Annual benchmark report analysing 35 billion user sessions across 2,700+ websites globally. Covers bounce rates, session duration, page views per session, and conversion metrics across industries. Key finding: mobile bounce rates are 51% compared to 43% on desktop, and the average page load time is 2.5 seconds across industries.",
    key_findings: [
      "Average bounce rate across all industries is 47%, with mobile at 51% and desktop at 43%",
      "Users view an average of 5.6 pages per session across industries",
      "Average session duration is 5 minutes 52 seconds",
      "Retail e-commerce conversion rate averages 2.3%",
      "Pages loading in under 1 second have 3x the conversion rate of pages loading in 5+ seconds",
      "Mobile traffic now accounts for 66% of all web traffic globally",
    ],
    methodology_summary:
      "Behavioural analytics collected via Contentsquare's platform across 2,700+ websites, 35 billion sessions, covering 2023 data. Segmented by industry vertical, device type, and geography.",
    sample_size: "35 billion sessions across 2,700+ websites",
    limitations: [
      "Data is from Contentsquare customers, which may skew toward larger enterprises",
      "Contentsquare is the vendor, creating potential conflict of interest",
      "Geographic coverage skewed toward North America and Western Europe",
    ],
    tags: ["analytics", "benchmarks", "bounce-rate", "conversion", "mobile", "contentsquare"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 9 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 9 },
      { criterion_name: "Geographic spread of data", score: 7 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 8 },
      { criterion_name: "Publication date and data freshness", score: 10 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },
  {
    title: "How Users Read on the Web: Eye-Tracking Evidence",
    source_url: "https://www.nngroup.com/articles/how-users-read-on-the-web/",
    source_name: "NNGroup",
    authors: ["Jakob Nielsen"],
    publication_date: "1997-10-01",
    research_type: "user_testing",
    site_contexts: ["content_publishing", "news_media", "ecommerce_general"],
    attributed_summary:
      "Foundational eye-tracking and usability research demonstrating that users do not read web pages word-by-word — they scan. The study found that 79% of users scan any new page, with only 16% reading word-by-word. Users pick out individual words, sentences, and key phrases. This finding has been replicated extensively and remains one of the most widely-cited UX research results.",
    key_findings: [
      "79% of users scan web pages rather than reading word-by-word",
      "Only 16% of users read web content word-by-word",
      "Scannable content with highlighted keywords improves usability by 47%",
      "Using bulleted lists improves content comprehension and recall",
      "Concise writing (50% less text) improves usability by 58%",
    ],
    methodology_summary:
      "Usability study combining eye-tracking with task-based testing. Users were asked to find information and complete tasks across multiple websites while eye movements were tracked.",
    sample_size: "51 participants",
    limitations: [
      "Original study conducted in 1997 — web design has evolved significantly",
      "Subsequent studies have validated core findings in modern contexts",
      "Eye-tracking technology in 1997 was less precise than modern systems",
    ],
    tags: ["eye-tracking", "reading-behaviour", "scanning", "content-design", "nngroup", "foundational"],
    scores: [
      { criterion_name: "Sample size", score: 7 },
      { criterion_name: "Participant recruitment methodology", score: 6 },
      { criterion_name: "Demographic diversity and representation", score: 5 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 8 },
      { criterion_name: "Task success rate reported", score: 8 },
      { criterion_name: "Error rate documented", score: 5 },
      { criterion_name: "Time-on-task measured", score: 6 },
      { criterion_name: "Peer review status", score: 6 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Publication date (recency)", score: 3 },
      { criterion_name: "Limitations and bias disclosed", score: 6 },
      { criterion_name: "Replication or citation count", score: 10 },
    ],
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────────────

async function seed() {
  console.log("UXMind Research Seeder\n");

  let inserted = 0;
  let skipped = 0;
  let rejected = 0;

  for (const entry of entries) {
    const result = calculateScore(entry.research_type, entry.scores);
    const slug = slugify(entry.title);

    console.log(
      `  [${result.passed ? "PASS" : "FAIL"}] ${result.breakdown.weighted_total.toFixed(1)}/100 — ${entry.title}`
    );

    if (!result.passed) {
      rejected++;
      continue;
    }

    // Check for duplicates
    const { data: existing } = await supabase
      .from("research_entries")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`    [skip] Already exists`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("research_entries").insert({
      title: entry.title,
      slug,
      attributed_summary: entry.attributed_summary,
      source_url: entry.source_url,
      source_name: entry.source_name,
      authors: entry.authors,
      publication_date: entry.publication_date,
      research_type: entry.research_type,
      site_contexts: entry.site_contexts,
      quality_score: result.breakdown.weighted_total,
      scoring_track: entry.research_type,
      scoring_breakdown: result.breakdown,
      key_findings: entry.key_findings,
      methodology_summary: entry.methodology_summary,
      sample_size: entry.sample_size,
      limitations: entry.limitations,
      tags: entry.tags,
      status: "published",
    });

    if (error) {
      console.error(`    [error] ${error.message}`);
    } else {
      inserted++;
      console.log(`    [inserted]`);
    }
  }

  console.log(`\nComplete: ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`);
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
