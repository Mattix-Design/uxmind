import type { ScoringRubric } from "@uxmind/types";

export const surveyRubric: ScoringRubric = {
  track: "survey",
  version: 1,
  criteria: [
    { name: "Sample size and response rate", weight: 0.20, max_score: 10, description: "Number of respondents and completion rate" },
    { name: "Demographic weighting applied", weight: 0.10, max_score: 10, description: "Statistical weighting for representativeness" },
    { name: "Question design bias assessment", weight: 0.12, max_score: 10, description: "Leading questions, framing effects evaluated" },
    { name: "Validated scale used", weight: 0.12, max_score: 10, description: "e.g. CSAT, NPS, SUS" },
    { name: "Longitudinal vs one-time snapshot", weight: 0.08, max_score: 10, description: "Repeated measurement scores higher" },
    { name: "Recruitment methodology", weight: 0.08, max_score: 10, description: "How respondents were sourced" },
    { name: "Statistical significance reported", weight: 0.12, max_score: 10, description: "p-values or confidence intervals" },
    { name: "Margin of error disclosed", weight: 0.08, max_score: 10, description: "Stated precision of results" },
    { name: "Peer review status", weight: 0.06, max_score: 10, description: "Published in peer-reviewed venue" },
    { name: "Publication date", weight: 0.04, max_score: 10, description: "Recency of publication" },
  ],
};
