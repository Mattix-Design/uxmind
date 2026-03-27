-- UXMind.ai Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enums
CREATE TYPE research_type_enum AS ENUM (
  'user_testing',
  'analytics_based',
  'survey',
  'academic',
  'mixed_methods'
);

CREATE TYPE site_context_enum AS ENUM (
  'ecommerce_general',
  'ecommerce_checkout',
  'ecommerce_discovery',
  'lead_generation',
  'saas',
  'news_media',
  'content_publishing',
  'mobile_app',
  'landing_pages',
  'onboarding',
  'forms_data_entry',
  'accessibility',
  'navigation_ia',
  'search_filtering'
);

CREATE TYPE entry_status_enum AS ENUM (
  'draft',
  'scoring',
  'published',
  'archived'
);

CREATE TYPE confidence_flag_enum AS ENUM (
  'proven',
  'well_supported',
  'contested',
  'debunked'
);

-- Research Entries (main table)
CREATE TABLE research_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  attributed_summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  publication_date DATE,
  date_ingested TIMESTAMPTZ DEFAULT now(),
  research_type research_type_enum NOT NULL,
  site_contexts site_context_enum[] DEFAULT '{}',
  quality_score NUMERIC(5,2) NOT NULL CHECK (quality_score >= 65),
  scoring_track research_type_enum NOT NULL,
  scoring_breakdown JSONB NOT NULL,
  key_findings TEXT[] DEFAULT '{}',
  methodology_summary TEXT,
  sample_size TEXT,
  limitations TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status entry_status_enum DEFAULT 'draft',
  search_vector TSVECTOR
);

-- UX Laws & Principles
CREATE TABLE ux_laws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  detailed_explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence_flag confidence_flag_enum NOT NULL DEFAULT 'well_supported',
  examples JSONB DEFAULT '[]',
  related_research_ids UUID[] DEFAULT '{}',
  source_attribution TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Debunked Myths
CREATE TABLE debunked_myths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  myth TEXT NOT NULL,
  reality TEXT NOT NULL,
  source_attribution TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Scoring Rubrics (config table)
CREATE TABLE scoring_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track research_type_enum UNIQUE NOT NULL,
  criteria JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingestion Log (audit trail)
CREATE TABLE ingestion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL,
  raw_data JSONB,
  quality_score NUMERIC(5,2),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  cited_research_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_research_search ON research_entries USING GIN (search_vector);
CREATE INDEX idx_research_tags ON research_entries USING GIN (tags);
CREATE INDEX idx_research_contexts ON research_entries USING GIN (site_contexts);
CREATE INDEX idx_research_type ON research_entries (research_type);
CREATE INDEX idx_research_score ON research_entries (quality_score DESC);
CREATE INDEX idx_research_date ON research_entries (publication_date DESC);
CREATE INDEX idx_research_status ON research_entries (status);
CREATE INDEX idx_chat_messages_session ON chat_messages (session_id, created_at);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.attributed_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.key_findings, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.source_name, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_search_vector_trigger
  BEFORE INSERT OR UPDATE ON research_entries
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
