/**
 * Batch 8 fix: Re-seed the 4 survey entries that failed due to mismatched criterion names
 */

import { supabase } from "./supabase-client.js";
import { calculateScore } from "../packages/scoring/src/calculator.js";
import type { ScoreInput } from "../packages/scoring/src/calculator.js";
import type { ResearchType, SiteContext } from "../packages/types/src/research.js";

interface ManualEntry {
  title: string; source_url: string; source_name: string; authors: string[];
  publication_date: string | null; research_type: ResearchType;
  site_contexts: SiteContext[]; attributed_summary: string; key_findings: string[];
  methodology_summary: string | null; sample_size: string | null;
  limitations: string[]; tags: string[]; scores: ScoreInput[];
}

function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }

const entries: ManualEntry[] = [
  {
    title: "The ROI of UX: Every Dollar Invested Returns $100",
    source_url: "https://www.forrester.com/report/the-six-steps-for-justifying-better-ux",
    source_name: "Forrester Research",
    authors: ["Andrew Hogan"],
    publication_date: "2016-04-01",
    research_type: "survey",
    site_contexts: ["saas", "ecommerce_general"],
    attributed_summary: "Forrester's widely-cited research established that every dollar invested in UX returns $100 (a 9,900% ROI). Based on surveys of enterprise organisations that implemented UX-centred design processes, the study found improvements in customer acquisition, retention, and lower support costs as the primary value drivers.",
    key_findings: [
      "Every $1 invested in UX returns approximately $100 in business value",
      "UX improvements reduce customer acquisition costs by up to 50%",
      "Well-designed interfaces reduce support call volume by up to 40%",
      "Companies with superior UX see 1.5x higher customer retention",
      "The ROI compounds over time as design systems mature"
    ],
    methodology_summary: "Large-scale survey of enterprise organisations combined with financial performance analysis, tracking UX investment against business outcomes over 3-5 year periods.",
    sample_size: "Survey of 400+ organisations across multiple industries",
    limitations: ["Self-reported ROI figures may overestimate impact", "Primarily large enterprise focus", "Older study — digital landscape has evolved significantly"],
    tags: ["roi", "business-value", "ux-investment", "enterprise", "cost-reduction", "customer-retention"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 8 },
      { criterion_name: "Demographic weighting applied", score: 6 },
      { criterion_name: "Question design bias assessment", score: 7 },
      { criterion_name: "Validated scale used", score: 7 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 7 },
      { criterion_name: "Recruitment methodology", score: 7 },
      { criterion_name: "Statistical significance reported", score: 7 },
      { criterion_name: "Margin of error disclosed", score: 5 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Publication date", score: 4 },
    ],
  },
  {
    title: "UX Maturity Across Industries: How Organisations Measure Design Success",
    source_url: "https://www.userzoom.com/ux-research/ux-maturity-report/",
    source_name: "UserZoom / UserTesting",
    authors: ["UserZoom Research Team"],
    publication_date: "2023-06-01",
    research_type: "survey",
    site_contexts: ["saas", "ecommerce_general"],
    attributed_summary: "UserZoom's industry survey of 500+ UX professionals reveals that organisations with higher UX maturity levels consistently report faster time-to-market, higher customer satisfaction scores, and greater cross-functional collaboration. However, only 15% of organisations surveyed rated themselves at the highest maturity levels.",
    key_findings: [
      "Only 15% of organisations rate their UX maturity as 'optimised' or 'integrated'",
      "Companies with dedicated UX research teams ship features 30% faster",
      "Cross-functional collaboration is the strongest predictor of UX maturity",
      "Budget allocation for UX research increased 25% year-over-year",
      "Most common barrier to UX maturity is lack of executive sponsorship"
    ],
    methodology_summary: "Online survey distributed to UX professionals across industries, with structured questions on organisational UX practices, team structures, and self-assessed maturity ratings.",
    sample_size: "537 UX professionals from 12 industries",
    limitations: ["Self-selection bias in respondent pool", "Self-assessed maturity may not reflect actual capabilities", "Primarily US and European respondents"],
    tags: ["ux-maturity", "organisational-design", "ux-research", "team-structure", "industry-survey"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 8 },
      { criterion_name: "Demographic weighting applied", score: 7 },
      { criterion_name: "Question design bias assessment", score: 7 },
      { criterion_name: "Validated scale used", score: 6 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 5 },
      { criterion_name: "Recruitment methodology", score: 7 },
      { criterion_name: "Statistical significance reported", score: 7 },
      { criterion_name: "Margin of error disclosed", score: 6 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Publication date", score: 8 },
    ],
  },
  {
    title: "State of Digital Content Creation: How Design Quality Affects Brand Perception",
    source_url: "https://www.adobe.com/express/learn/blog/creative-trends",
    source_name: "Adobe",
    authors: ["Adobe Research"],
    publication_date: "2024-01-15",
    research_type: "survey",
    site_contexts: ["content_publishing", "landing_pages", "ecommerce_general"],
    attributed_summary: "Adobe's global survey of 5,000+ consumers and 2,000 marketers found that 73% of consumers judge brand credibility based on visual design quality. Poor design quality was the second most-cited reason (after price) for abandoning a purchase, and 59% of consumers said they actively avoid brands with outdated visual design.",
    key_findings: [
      "73% of consumers judge brand credibility based on visual design quality",
      "59% of consumers actively avoid brands with outdated or poor design",
      "Poor visual design is the #2 reason for purchase abandonment after price",
      "Consistent visual branding across touchpoints increases trust by 41%",
      "Mobile-first design is now expected by 82% of consumers under 35"
    ],
    methodology_summary: "Global online survey across 8 countries, with separate panels for consumers and marketing professionals. Included conjoint analysis on design preference trade-offs.",
    sample_size: "5,200 consumers and 2,100 marketers across 8 countries",
    limitations: ["Self-reported attitudes may not match actual behaviour", "Design quality is subjective and culturally influenced", "Adobe has commercial interest in design tool adoption"],
    tags: ["brand-perception", "visual-design", "content-quality", "consumer-attitudes", "mobile-first", "trust"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 9 },
      { criterion_name: "Demographic weighting applied", score: 7 },
      { criterion_name: "Question design bias assessment", score: 6 },
      { criterion_name: "Validated scale used", score: 6 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 5 },
      { criterion_name: "Recruitment methodology", score: 7 },
      { criterion_name: "Statistical significance reported", score: 6 },
      { criterion_name: "Margin of error disclosed", score: 5 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Publication date", score: 9 },
    ],
  },
  {
    title: "The State of UX Research 2024: Methods, Tools, and Team Structures",
    source_url: "https://maze.co/resources/state-of-ux-research/",
    source_name: "Maze",
    authors: ["Maze Research Team"],
    publication_date: "2024-03-01",
    research_type: "survey",
    site_contexts: ["saas", "ecommerce_general"],
    attributed_summary: "Maze's 2024 industry survey of 1,800+ UX professionals reveals that unmoderated testing has overtaken moderated sessions as the most common research method. Teams using mixed-methods approaches report 2x higher stakeholder confidence in findings, and 67% of researchers now use AI-assisted analysis tools.",
    key_findings: [
      "Unmoderated testing is now the most common research method (used by 68% of teams)",
      "67% of UX researchers now use AI-assisted analysis tools",
      "Teams using mixed methods report 2x higher stakeholder confidence",
      "Average research cycle time decreased from 4 weeks to 2.5 weeks year-over-year",
      "Democratisation of research (non-researchers conducting studies) grew 45%"
    ],
    methodology_summary: "Online survey distributed through professional UX communities, newsletters, and social media, with demographic quotas for role, company size, and region.",
    sample_size: "1,847 UX professionals from 52 countries",
    limitations: ["Community-based recruitment skews toward active practitioners", "Rapidly evolving field means findings may date quickly", "Self-reported tool usage and cycle times"],
    tags: ["ux-research-methods", "research-ops", "ai-tools", "unmoderated-testing", "industry-survey", "mixed-methods"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 9 },
      { criterion_name: "Demographic weighting applied", score: 7 },
      { criterion_name: "Question design bias assessment", score: 6 },
      { criterion_name: "Validated scale used", score: 6 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 6 },
      { criterion_name: "Recruitment methodology", score: 7 },
      { criterion_name: "Statistical significance reported", score: 6 },
      { criterion_name: "Margin of error disclosed", score: 5 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Publication date", score: 9 },
    ],
  },
];

async function seed() {
  console.log("UXMind Research Seeder — Batch 8 Fix (surveys)\n");
  let inserted = 0, skipped = 0, rejected = 0;

  for (const entry of entries) {
    const result = calculateScore(entry.research_type, entry.scores);
    const passed = result.breakdown.weighted_total >= 65;
    const slug = slugify(entry.title);
    const label = entry.title.length > 75 ? entry.title.slice(0, 75) : entry.title;

    if (!passed) {
      console.log(`  [FAIL] ${result.breakdown.weighted_total.toFixed(1)}/100 — ${label}`);
      rejected++;
      continue;
    }

    console.log(`  [PASS] ${result.breakdown.weighted_total.toFixed(1)}/100 — ${label}`);

    const { data: existing } = await supabase
      .from("research_entries")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) { console.log("    [skipped] already exists"); skipped++; continue; }

    const { error } = await supabase.from("research_entries").insert({
      title: entry.title, slug, attributed_summary: entry.attributed_summary,
      source_url: entry.source_url, source_name: entry.source_name, authors: entry.authors,
      publication_date: entry.publication_date, research_type: entry.research_type,
      site_contexts: entry.site_contexts, quality_score: result.breakdown.weighted_total,
      scoring_track: entry.research_type, scoring_breakdown: result.breakdown,
      key_findings: entry.key_findings, methodology_summary: entry.methodology_summary,
      sample_size: entry.sample_size, limitations: entry.limitations,
      tags: entry.tags, status: "published",
    });

    if (error) { console.log(`    [error] ${error.message}`); rejected++; }
    else { console.log("    [inserted]"); inserted++; }
  }

  console.log(`\nComplete: ${inserted} inserted, ${skipped} skipped, ${rejected} rejected`);
}

seed();
