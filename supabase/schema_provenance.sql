-- ============================================================
-- KhelPediA — Stage 1 Migration: Entity Source Mapping & Provenance
-- ============================================================

-- 1. ENTITY SOURCE MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.entity_source_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('tournament', 'team', 'player', 'match', 'game')),
  internal_entity_id UUID NOT NULL,
  source TEXT NOT NULL,                -- e.g., 'pandascore', 'riot', 'opendota', 'tracker_gg'
  source_entity_id TEXT NOT NULL,       -- Native ID from the upstream API
  source_url TEXT,                     -- Canonical web link at source
  metadata JSONB DEFAULT '{}'::jsonb,  -- Store unparsed source metadata
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_source_entity UNIQUE(source, source_entity_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_entity_source_internal 
ON public.entity_source_mapping (internal_entity_id, entity_type);

CREATE INDEX IF NOT EXISTS idx_entity_source_lookup 
ON public.entity_source_mapping (source, source_entity_id, entity_type);

-- 2. PROVISIONAL MATCHES TABLE (For matches missing reliable source IDs)
CREATE TABLE IF NOT EXISTS public.provisional_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  raw_identifier TEXT,
  tournament_name_raw TEXT,
  team1_name_raw TEXT,
  team2_name_raw TEXT,
  score1 INT,
  score2 INT,
  round_raw TEXT,
  scheduled_at TIMESTAMPTZ,
  payload JSONB,
  status TEXT DEFAULT 'pending_reconciliation' CHECK (status IN ('pending_reconciliation', 'resolved', 'rejected')),
  resolved_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provisional_matches_status 
ON public.provisional_matches (status);

-- 3. MATCH INDEXES
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches (team1_id, team2_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON public.matches (played_at DESC NULLS LAST);

-- 5. FAILED INGESTION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.failed_ingestion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  endpoint TEXT,
  source_entity_id TEXT,
  error_message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  attempt_count INT DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_ingestion_logs_source 
ON public.failed_ingestion_logs (source, created_at DESC);

ALTER TABLE public.failed_ingestion_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read failed_ingestion_logs" ON public.failed_ingestion_logs;
CREATE POLICY "Public read failed_ingestion_logs" ON public.failed_ingestion_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access failed_ingestion_logs" ON public.failed_ingestion_logs;
CREATE POLICY "Service role full access failed_ingestion_logs" ON public.failed_ingestion_logs FOR ALL USING (true);

