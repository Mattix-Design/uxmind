export type ResearchType =
  | "user_testing"
  | "analytics_based"
  | "survey"
  | "academic"
  | "mixed_methods";

export type SiteContext =
  | "ecommerce_general"
  | "ecommerce_checkout"
  | "ecommerce_discovery"
  | "lead_generation"
  | "saas"
  | "news_media"
  | "content_publishing"
  | "mobile_app"
  | "landing_pages"
  | "onboarding"
  | "forms_data_entry"
  | "accessibility"
  | "navigation_ia"
  | "search_filtering";

export type EntryStatus = "draft" | "scoring" | "published" | "archived";

export type ConfidenceFlag =
  | "proven"
  | "well_supported"
  | "contested"
  | "debunked";

export interface ResearchEntry {
  id: string;
  title: string;
  slug: string;
  attributed_summary: string;
  source_url: string;
  source_name: string;
  authors: string[];
  publication_date: string | null;
  date_ingested: string;
  research_type: ResearchType;
  site_contexts: SiteContext[];
  quality_score: number;
  impact_score: number | null;
  scoring_track: ResearchType;
  scoring_breakdown: ScoringBreakdown;
  impact_breakdown: ScoringBreakdown | null;
  key_findings: string[];
  methodology_summary: string | null;
  sample_size: string | null;
  limitations: string[];
  tags: string[];
  status: EntryStatus;
}

export interface ScoringBreakdown {
  criteria: ScoringCriterionResult[];
  weighted_total: number;
}

export interface ScoringCriterionResult {
  name: string;
  score: number;
  max: number;
  weight: number;
}

export interface UxLaw {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailed_explanation: string;
  category: string;
  confidence_flag: ConfidenceFlag;
  examples: UxLawExample[];
  related_research_ids: string[];
  source_attribution: string | null;
  sort_order: number;
}

export interface UxLawExample {
  title: string;
  description: string;
  image_url?: string;
}
