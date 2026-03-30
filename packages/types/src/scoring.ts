import type { ResearchType } from "./research";

export interface ScoringCriterion {
  name: string;
  weight: number;
  max_score: number;
  description: string;
}

export interface ScoringRubric {
  track: ResearchType;
  criteria: ScoringCriterion[];
  version: number;
}

export const MINIMUM_QUALITY_SCORE = 65;
export const MINIMUM_IMPACT_SCORE = 0;
