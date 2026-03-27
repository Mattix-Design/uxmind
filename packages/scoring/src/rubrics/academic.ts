import type { ScoringRubric } from "@uxmind/types";

export const academicRubric: ScoringRubric = {
  track: "academic",
  version: 1,
  criteria: [
    { name: "Journal impact factor", weight: 0.15, max_score: 10, description: "Journal ranking and reputation" },
    { name: "Peer review process documented", weight: 0.15, max_score: 10, description: "Review process transparency" },
    { name: "Methodology reproducibility", weight: 0.12, max_score: 10, description: "Can the study be replicated" },
    { name: "Ethics approval documented", weight: 0.08, max_score: 10, description: "IRB or ethics board approval" },
    { name: "Citation count", weight: 0.12, max_score: 10, description: "Number of citing papers" },
    { name: "Author institutional affiliation", weight: 0.08, max_score: 10, description: "Research institution credibility" },
    { name: "Funding source transparency", weight: 0.08, max_score: 10, description: "Who funded the research" },
    { name: "Sample size and statistical power", weight: 0.12, max_score: 10, description: "Adequate sample for conclusions drawn" },
    { name: "Replication status", weight: 0.06, max_score: 10, description: "Has the study been independently replicated" },
    { name: "Publication date", weight: 0.04, max_score: 10, description: "Recency of publication" },
  ],
};
