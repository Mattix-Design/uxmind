import type { ScoringRubric } from "@uxmind/types";

export const analyticsBasedRubric: ScoringRubric = {
  track: "analytics_based",
  version: 1,
  criteria: [
    { name: "Total data volume", weight: 0.20, max_score: 10, description: "Page views, sessions, events volume" },
    { name: "Time period covered", weight: 0.10, max_score: 10, description: "Duration of data collection" },
    { name: "Industry vertical relevance", weight: 0.08, max_score: 10, description: "Applicability to specific verticals" },
    { name: "Measurement methodology transparency", weight: 0.15, max_score: 10, description: "How data was collected and processed" },
    { name: "Filtering and noise reduction explained", weight: 0.10, max_score: 10, description: "Data cleaning methodology" },
    { name: "Sample representativeness across device types", weight: 0.08, max_score: 10, description: "Desktop, mobile, tablet coverage" },
    { name: "Geographic spread of data", weight: 0.05, max_score: 10, description: "Regional diversity of dataset" },
    { name: "Data collection tool credibility", weight: 0.08, max_score: 10, description: "Reliability of analytics platform" },
    { name: "Segmentation depth", weight: 0.07, max_score: 10, description: "Granularity of data segments" },
    { name: "Publication date and data freshness", weight: 0.05, max_score: 10, description: "How recent the data is" },
    { name: "Conflict of interest disclosure", weight: 0.04, max_score: 10, description: "Vendor bias or funding transparency" },
  ],
};
