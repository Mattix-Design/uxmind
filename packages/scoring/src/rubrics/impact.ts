import type { ScoringRubric } from "@uxmind/types";

/**
 * Universal Impact Rubric
 *
 * Measures how actionable and impactful research findings are for design
 * decisions. Unlike quality/evidence rubrics which vary by research type,
 * impact is assessed identically for all entries since it measures practical
 * outcome rather than methodology.
 *
 * The track is set to "academic" as a placeholder — this rubric is not
 * keyed by track. Use `impactRubric` directly via `getImpactRubric()`.
 */
export const impactRubric: ScoringRubric = {
  track: "academic", // universal — not used for lookup
  version: 1,
  criteria: [
    {
      name: "Effect size / magnitude",
      weight: 0.25,
      max_score: 10,
      description:
        "How large is the measured effect? (e.g., '30% conversion increase' scores high; 'marginal difference' scores low)",
    },
    {
      name: "Actionability",
      weight: 0.20,
      max_score: 10,
      description:
        "Does the research provide clear, specific design recommendations that can be directly implemented?",
    },
    {
      name: "Generalizability",
      weight: 0.20,
      max_score: 10,
      description:
        "How broadly applicable are the findings across different contexts, industries, and user populations?",
    },
    {
      name: "Consistency of findings",
      weight: 0.15,
      max_score: 10,
      description:
        "Are results consistent across conditions, replications, or similar studies?",
    },
    {
      name: "Real-world validation",
      weight: 0.10,
      max_score: 10,
      description:
        "Were findings validated in production/real-world settings vs. lab-only?",
    },
    {
      name: "User outcome clarity",
      weight: 0.10,
      max_score: 10,
      description:
        "Is there a clear, measurable user outcome (conversion rate, task completion time, error rate, satisfaction score)?",
    },
  ],
};
