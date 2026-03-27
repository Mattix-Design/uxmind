import type { ResearchType, ScoringRubric } from "@uxmind/types";
import { userTestingRubric } from "./user-testing";
import { analyticsBasedRubric } from "./analytics-based";
import { surveyRubric } from "./survey";
import { academicRubric } from "./academic";
import { mixedMethodsRubric } from "./mixed-methods";

const rubrics: Record<ResearchType, ScoringRubric> = {
  user_testing: userTestingRubric,
  analytics_based: analyticsBasedRubric,
  survey: surveyRubric,
  academic: academicRubric,
  mixed_methods: mixedMethodsRubric,
};

export function getRubric(track: ResearchType): ScoringRubric {
  return rubrics[track];
}

export { rubrics };
