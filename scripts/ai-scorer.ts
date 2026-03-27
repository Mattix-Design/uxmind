/**
 * AI-assisted research scoring using Claude API.
 * Takes raw article data and returns structured, scored entries.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getRubric } from "../packages/scoring/src/rubrics/index.js";
import { calculateScore, type ScoreInput } from "../packages/scoring/src/calculator.js";
import type { ResearchType, SiteContext } from "../packages/types/src/research.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env"), override: true });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      // Brief pause between calls
      await new Promise((r) => setTimeout(r, 2000));
      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("overloaded") || msg.includes("529") || msg.includes("rate_limit") || msg.includes("429")) {
        const delay = (attempt + 1) * 15000;
        console.log(`    [retry] Rate limited, waiting ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

interface RawArticle {
  title: string;
  url: string;
  authors: string[];
  publication_date: string | null;
  abstract: string;
  full_text?: string;
  source_name: string;
  journal?: string;
  citation_count?: number;
  doi?: string;
}

interface ScoredEntry {
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
  scoring_breakdown: ReturnType<typeof calculateScore>["breakdown"];
  key_findings: string[];
  methodology_summary: string | null;
  sample_size: string | null;
  limitations: string[];
  tags: string[];
  status: "published";
}

const VALID_RESEARCH_TYPES: ResearchType[] = [
  "user_testing", "analytics_based", "survey", "academic", "mixed_methods",
];

const VALID_SITE_CONTEXTS: SiteContext[] = [
  "ecommerce_general", "ecommerce_checkout", "ecommerce_discovery",
  "lead_generation", "saas", "news_media", "content_publishing",
  "mobile_app", "landing_pages", "onboarding", "forms_data_entry",
  "accessibility", "navigation_ia", "search_filtering",
];

export async function scoreWithAI(article: RawArticle): Promise<ScoredEntry | null> {
  const contentForAnalysis = article.full_text
    ? article.abstract + "\n\n" + article.full_text.slice(0, 3000)
    : article.abstract;

  // First: classify and extract structured data
  const classificationPrompt = `You are a UX research analyst for UXMind.ai. Analyse this research article and return ONLY valid JSON (no markdown, no code blocks).

ARTICLE:
Title: ${article.title}
Authors: ${article.authors.join(", ")}
Source: ${article.source_name}
${article.journal ? `Journal: ${article.journal}` : ""}
${article.doi ? `DOI: ${article.doi}` : ""}
${article.citation_count !== undefined ? `Citations: ${article.citation_count}` : ""}
Date: ${article.publication_date || "Unknown"}

Content:
${contentForAnalysis}

Return this exact JSON structure:
{
  "research_type": "one of: user_testing, analytics_based, survey, academic, mixed_methods",
  "site_contexts": ["array of applicable contexts from: ecommerce_general, ecommerce_checkout, ecommerce_discovery, lead_generation, saas, news_media, content_publishing, mobile_app, landing_pages, onboarding, forms_data_entry, accessibility, navigation_ia, search_filtering"],
  "attributed_summary": "2-4 sentence summary of the research findings and their significance for UX practitioners. Do NOT reproduce the original text — write an original attributed summary.",
  "key_findings": ["3-5 specific, actionable findings from the research"],
  "methodology_summary": "Brief description of the research methodology used",
  "sample_size": "Sample size or data volume as described in the paper, or null",
  "limitations": ["1-3 known limitations"],
  "tags": ["5-8 relevant topic tags like: usability, mobile, ecommerce, cognitive-load, accessibility, forms, navigation, etc"],
  "is_relevant_to_ux": true or false
}

IMPORTANT:
- is_relevant_to_ux should be false if this is NOT about user experience, interface design, human-computer interaction, web/app usability, cognitive psychology as applied to interfaces, or digital product design
- site_contexts must only contain values from the list above
- research_type must be exactly one of the 5 options listed
- attributed_summary must be YOUR original summary, not copied text`;

  try {
    const classificationText = await callClaude(classificationPrompt, 1024);

    let classification;
    try {
      // Strip any markdown code blocks if present
      const jsonStr = classificationText.replace(/```json\n?|\n?```/g, "").trim();
      classification = JSON.parse(jsonStr);
    } catch {
      console.error(`  [ai-error] Failed to parse classification JSON for: ${article.title}`);
      return null;
    }

    // Reject non-UX research
    if (!classification.is_relevant_to_ux) {
      return null;
    }

    // Validate research type
    const researchType: ResearchType = VALID_RESEARCH_TYPES.includes(classification.research_type)
      ? classification.research_type
      : "academic";

    // Validate site contexts
    const siteContexts: SiteContext[] = (classification.site_contexts || [])
      .filter((c: string) => VALID_SITE_CONTEXTS.includes(c as SiteContext)) as SiteContext[];

    // Now score it
    const rubric = getRubric(researchType);
    const scoringPrompt = `You are scoring a UX research article for quality. Score each criterion from 0-10 based on the article content. Return ONLY valid JSON (no markdown, no code blocks).

ARTICLE:
Title: ${article.title}
Source: ${article.source_name}
${article.citation_count !== undefined ? `Citations: ${article.citation_count}` : ""}
${article.journal ? `Journal: ${article.journal}` : ""}

Content:
${contentForAnalysis}

Score each criterion (0 = not met at all, 10 = fully met):
${rubric.criteria.map((c) => `- "${c.name}": ${c.description}`).join("\n")}

Return JSON: { "scores": { "criterion name": score_number, ... } }

Be rigorous and honest. NNGroup and Baymard are high-authority but not peer-reviewed. Academic papers from top venues (CHI, CSCW) score higher on peer review. Score recency: 0-2 years = 8-10, 2-5 years = 5-7, 5+ years = 2-4.`;

    const scoringText = await callClaude(scoringPrompt, 512);

    let scoring;
    try {
      const jsonStr = scoringText.replace(/```json\n?|\n?```/g, "").trim();
      scoring = JSON.parse(jsonStr);
    } catch {
      console.error(`  [ai-error] Failed to parse scoring JSON for: ${article.title}`);
      return null;
    }

    // Build score inputs from AI scores
    const scoreInputs: ScoreInput[] = rubric.criteria.map((criterion) => ({
      criterion_name: criterion.name,
      score: Math.min(10, Math.max(0, scoring.scores[criterion.name] || 0)),
    }));

    const result = calculateScore(researchType, scoreInputs);

    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    return {
      title: article.title,
      slug,
      attributed_summary: classification.attributed_summary,
      source_url: article.url,
      source_name: article.source_name,
      authors: article.authors,
      publication_date: article.publication_date,
      research_type: researchType,
      site_contexts: siteContexts.length > 0 ? siteContexts : ["ecommerce_general"],
      quality_score: result.breakdown.weighted_total,
      scoring_track: researchType,
      scoring_breakdown: result.breakdown,
      key_findings: classification.key_findings || [],
      methodology_summary: classification.methodology_summary || null,
      sample_size: classification.sample_size || null,
      limitations: classification.limitations || [],
      tags: classification.tags || [],
      status: "published",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  [ai-error] ${article.title}: ${msg}`);
    return null;
  }
}
