/**
 * Backfill impact scores for existing research entries using Claude AI.
 * Impact score measures how actionable and impactful the research findings
 * are for design decisions, complementing the existing quality_score.
 */

import { supabase } from "./supabase-client.js";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env"), override: true });

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY in .env");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

// --- Impact criteria with weights ---

interface ImpactCriterion {
  name: string;
  key: string;
  weight: number;
  description: string;
}

const IMPACT_CRITERIA: ImpactCriterion[] = [
  {
    name: "Effect size / magnitude",
    key: "effect_size",
    weight: 0.25,
    description: "How large is the measured effect? Strong, meaningful differences vs marginal or unclear effects.",
  },
  {
    name: "Actionability",
    key: "actionability",
    weight: 0.20,
    description: "Does the research provide clear, specific, implementable design recommendations?",
  },
  {
    name: "Generalizability",
    key: "generalizability",
    weight: 0.20,
    description: "Are the findings broadly applicable across different contexts, products, and user populations?",
  },
  {
    name: "Consistency of findings",
    key: "consistency",
    weight: 0.15,
    description: "Are the findings consistent across conditions, sub-groups, or replications within the study?",
  },
  {
    name: "Real-world validation",
    key: "real_world_validation",
    weight: 0.10,
    description: "Were findings validated in real production environments, not just lab or controlled settings?",
  },
  {
    name: "User outcome clarity",
    key: "user_outcome_clarity",
    weight: 0.10,
    description: "Is there a clear, measurable user outcome (e.g., conversion lift, task completion, error reduction)?",
  },
];

// --- Claude API helper with retries ---

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
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

// --- Impact scoring ---

interface ImpactScoreResult {
  scores: Record<string, number>;
  justifications: Record<string, string>;
}

function buildImpactPrompt(entry: {
  title: string;
  attributed_summary: string | null;
  key_findings: string[] | null;
  methodology_summary: string | null;
  sample_size: string | null;
}): string {
  const findings = entry.key_findings?.length
    ? entry.key_findings.map((f, i) => `  ${i + 1}. ${f}`).join("\n")
    : "  (none available)";

  return `You are a UX research impact analyst for UXMind.ai. Your job is to assess how actionable and impactful a piece of UX research is for design decisions.

RESEARCH ENTRY:
Title: ${entry.title}
Summary: ${entry.attributed_summary || "(none)"}
Key Findings:
${findings}
Methodology: ${entry.methodology_summary || "(none)"}
Sample Size: ${entry.sample_size || "(not reported)"}

Score each of the following impact criteria from 0-10. Return ONLY valid JSON (no markdown, no code blocks).

Criteria:
${IMPACT_CRITERIA.map((c) => `- "${c.key}": ${c.description}`).join("\n")}

Return this exact JSON structure:
{
  "scores": {
    "effect_size": <0-10>,
    "actionability": <0-10>,
    "generalizability": <0-10>,
    "consistency": <0-10>,
    "real_world_validation": <0-10>,
    "user_outcome_clarity": <0-10>
  },
  "justifications": {
    "effect_size": "1 sentence justification",
    "actionability": "1 sentence justification",
    "generalizability": "1 sentence justification",
    "consistency": "1 sentence justification",
    "real_world_validation": "1 sentence justification",
    "user_outcome_clarity": "1 sentence justification"
  }
}

Be rigorous. Research with vague findings or no clear effect sizes should score low. Research with specific, measurable design recommendations backed by strong data should score high.`;
}

function calculateImpactScore(scores: Record<string, number>): {
  weighted_total: number;
  breakdown: Record<string, { score: number; weight: number; weighted: number }>;
} {
  const breakdown: Record<string, { score: number; weight: number; weighted: number }> = {};
  let weightedTotal = 0;

  for (const criterion of IMPACT_CRITERIA) {
    const raw = Math.min(10, Math.max(0, scores[criterion.key] || 0));
    const weighted = (raw / 10) * criterion.weight * 100;
    weightedTotal += weighted;
    breakdown[criterion.key] = {
      score: raw,
      weight: criterion.weight,
      weighted: Math.round(weighted * 100) / 100,
    };
  }

  return {
    weighted_total: Math.round(weightedTotal * 100) / 100,
    breakdown,
  };
}

// --- Main ---

async function main() {
  console.log("=== Backfill Impact Scores ===\n");

  // Fetch entries missing impact_score
  const { data: entries, error } = await supabase
    .from("research_entries")
    .select("id, title, attributed_summary, key_findings, methodology_summary, sample_size")
    .is("impact_score", null)
    .eq("status", "published")
    .order("date_ingested", { ascending: true });

  if (error) {
    console.error("Failed to fetch entries:", error.message);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log("No entries need impact scoring. All done!");
    return;
  }

  console.log(`Found ${entries.length} entries to score.\n`);

  let scored = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`[${i + 1}/${entries.length}] ${entry.title}`);

    try {
      const prompt = buildImpactPrompt(entry);
      const responseText = await callClaude(prompt, 768);

      let result: ImpactScoreResult;
      try {
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, "").trim();
        result = JSON.parse(jsonStr);
      } catch {
        console.error(`  [parse-error] Could not parse Claude response for: ${entry.title}`);
        failed++;
        continue;
      }

      // Validate we got all expected keys
      const missingKeys = IMPACT_CRITERIA.filter((c) => result.scores[c.key] === undefined);
      if (missingKeys.length > 0) {
        console.error(`  [validation-error] Missing scores for: ${missingKeys.map((c) => c.key).join(", ")}`);
        failed++;
        continue;
      }

      const { weighted_total, breakdown } = calculateImpactScore(result.scores);

      // Build impact_breakdown with justifications
      const impactBreakdown: Record<string, unknown> = {
        weighted_total,
        criteria: {},
      };
      for (const criterion of IMPACT_CRITERIA) {
        (impactBreakdown.criteria as Record<string, unknown>)[criterion.key] = {
          name: criterion.name,
          ...breakdown[criterion.key],
          justification: result.justifications?.[criterion.key] || null,
        };
      }

      // Update the entry
      const { error: updateError } = await supabase
        .from("research_entries")
        .update({
          impact_score: weighted_total,
          impact_breakdown: impactBreakdown,
        })
        .eq("id", entry.id);

      if (updateError) {
        console.error(`  [db-error] ${updateError.message}`);
        failed++;
        continue;
      }

      console.log(`  -> Impact score: ${weighted_total}`);
      scored++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] ${msg}`);
      failed++;
    }

    // Rate limiting: 1 second between requests
    if (i < entries.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Scored: ${scored} | Failed: ${failed} | Total: ${entries.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
