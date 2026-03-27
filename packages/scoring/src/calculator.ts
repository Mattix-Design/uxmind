import type {
  ResearchType,
  ScoringBreakdown,
  ScoringCriterionResult,
} from "@uxmind/types";
import { MINIMUM_QUALITY_SCORE } from "@uxmind/types";
import { getRubric } from "./rubrics";

export interface ScoreInput {
  criterion_name: string;
  score: number;
}

export interface ScoreResult {
  breakdown: ScoringBreakdown;
  passed: boolean;
}

export function calculateScore(
  track: ResearchType,
  scores: ScoreInput[]
): ScoreResult {
  const rubric = getRubric(track);

  const criteria: ScoringCriterionResult[] = rubric.criteria.map((criterion) => {
    const input = scores.find((s) => s.criterion_name === criterion.name);
    const score = input ? Math.min(input.score, criterion.max_score) : 0;

    return {
      name: criterion.name,
      score,
      max: criterion.max_score,
      weight: criterion.weight,
    };
  });

  const weighted_total = criteria.reduce(
    (sum, c) => sum + (c.score / c.max) * c.weight * 100,
    0
  );

  const rounded_total = Math.round(weighted_total * 100) / 100;

  return {
    breakdown: { criteria, weighted_total: rounded_total },
    passed: rounded_total >= MINIMUM_QUALITY_SCORE,
  };
}
