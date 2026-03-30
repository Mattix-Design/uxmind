-- UXMind.ai Migration 002: Impact Score
-- Adds a second scoring dimension measuring practical design impact

-- Add impact_score column (nullable initially so existing rows don't break)
ALTER TABLE research_entries ADD COLUMN impact_score NUMERIC(5,2);
ALTER TABLE research_entries ADD COLUMN impact_breakdown JSONB;

-- Index for sorting
CREATE INDEX idx_research_impact ON research_entries (impact_score DESC);
