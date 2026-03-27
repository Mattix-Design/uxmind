import type { ScoringRubric } from "@uxmind/types";

export const mixedMethodsRubric: ScoringRubric = {
  track: "mixed_methods",
  version: 1,
  criteria: [
    { name: "Qualitative and quantitative combination clearly defined", weight: 0.15, max_score: 10, description: "Both methods explicitly stated" },
    { name: "Whether methods corroborate each other", weight: 0.15, max_score: 10, description: "Triangulation of findings" },
    { name: "Sample sizes meet thresholds for both components", weight: 0.15, max_score: 10, description: "Adequate sample for each method" },
    { name: "Integration methodology explained", weight: 0.12, max_score: 10, description: "How qual and quant data were combined" },
    { name: "Peer review status", weight: 0.10, max_score: 10, description: "Published in peer-reviewed venue" },
    { name: "Author credentials", weight: 0.08, max_score: 10, description: "Relevant expertise and affiliation" },
    { name: "Limitations of each method disclosed", weight: 0.10, max_score: 10, description: "Known limitations per method acknowledged" },
    { name: "Publication date", weight: 0.08, max_score: 10, description: "Recency of publication" },
    { name: "Citation count", weight: 0.07, max_score: 10, description: "Number of citing papers" },
  ],
};
