import type { ScoringRubric } from "@uxmind/types";

export const userTestingRubric: ScoringRubric = {
  track: "user_testing",
  version: 1,
  criteria: [
    { name: "Sample size", weight: 0.20, max_score: 10, description: "Minimum: 5-10 qualitative, 40+ quantitative" },
    { name: "Participant recruitment methodology", weight: 0.08, max_score: 10, description: "How participants were sourced and screened" },
    { name: "Demographic diversity and representation", weight: 0.07, max_score: 10, description: "Range of participant demographics" },
    { name: "Control variables documented", weight: 0.10, max_score: 10, description: "Variables held constant are clearly stated" },
    { name: "Variant / treatment clearly defined", weight: 0.08, max_score: 10, description: "What was tested is unambiguous" },
    { name: "Moderated vs unmoderated", weight: 0.05, max_score: 10, description: "Moderated scores higher" },
    { name: "Task success rate reported", weight: 0.08, max_score: 10, description: "Completion rates documented" },
    { name: "Error rate documented", weight: 0.06, max_score: 10, description: "Error frequency and types recorded" },
    { name: "Time-on-task measured", weight: 0.06, max_score: 10, description: "Duration metrics captured" },
    { name: "Peer review status", weight: 0.08, max_score: 10, description: "Published in peer-reviewed venue" },
    { name: "Author credentials", weight: 0.04, max_score: 10, description: "Relevant expertise and affiliation" },
    { name: "Publication date (recency)", weight: 0.06, max_score: 10, description: "2 yrs = full, 2-5 = partial, 5+ = flagged" },
    { name: "Limitations and bias disclosed", weight: 0.08, max_score: 10, description: "Known limitations acknowledged" },
    { name: "Replication or citation count", weight: 0.06, max_score: 10, description: "Independent replication or citation frequency" },
  ],
};
