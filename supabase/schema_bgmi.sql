-- ============================================================
-- KhelPediA — Non-Destructive BGMI Battle Royale Extension
-- ============================================================

-- 1. Extend match_teams with BGMI multi-team metrics & result provenance (Default NULL)
ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS source_result_id TEXT DEFAULT NULL;
ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS placement INT DEFAULT NULL;
ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS kills INT DEFAULT NULL;
ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS placement_points INT DEFAULT NULL;
ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS elimination_points INT DEFAULT NULL;
ALTER TABLE match_teams ALTER COLUMN won DROP NOT NULL;
ALTER TABLE match_teams ALTER COLUMN won SET DEFAULT FALSE;
ALTER TABLE match_teams ALTER COLUMN rounds_won DROP NOT NULL;
ALTER TABLE match_teams ALTER COLUMN rounds_played DROP NOT NULL;
ALTER TABLE match_teams ALTER COLUMN num_points DROP NOT NULL;


-- Source result ID unique index

CREATE UNIQUE INDEX IF NOT EXISTS uq_match_teams_source_result 
ON match_teams(source_result_id) 
WHERE source_result_id IS NOT NULL;

-- Drop legacy Valorant FK constraint on match_teams if present
ALTER TABLE match_teams DROP CONSTRAINT IF EXISTS match_teams_match_id_fkey;

-- Relational constraint on (match_id, team_id)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'match_teams_match_id_team_id_key'
    ) THEN
        ALTER TABLE match_teams ADD CONSTRAINT match_teams_match_id_team_id_key UNIQUE (match_id, team_id);
    END IF;
END $$;


-- 2. New Table: BGMI Stage Standings (No cascading deletes)
CREATE TABLE IF NOT EXISTS bgmi_stage_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    stage_name TEXT NOT NULL DEFAULT 'Overall',
    team_id UUID NOT NULL REFERENCES teams(id),
    rank_position INT NOT NULL,
    matches_played INT DEFAULT NULL,
    wwcd_count INT DEFAULT NULL,
    placement_pts INT DEFAULT NULL,
    elimination_pts INT DEFAULT NULL,
    total_pts INT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT bgmi_stage_standings_unique UNIQUE (tournament_id, stage_name, team_id)
);

-- 3. New Table: Tournament Rosters (No cascading deletes; strict DEFAULT NULL for dates)
CREATE TABLE IF NOT EXISTS tournament_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    player_id UUID NOT NULL REFERENCES players(id),
    role TEXT DEFAULT 'player',
    joined_at DATE DEFAULT NULL,
    left_at DATE DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deterministic Roster Uniqueness (Handles PostgreSQL NULL semantics)
CREATE UNIQUE INDEX IF NOT EXISTS uq_tournament_rosters_no_date 
ON tournament_rosters(tournament_id, team_id, player_id) 
WHERE joined_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tournament_rosters_with_date 
ON tournament_rosters(tournament_id, team_id, player_id, joined_at) 
WHERE joined_at IS NOT NULL;

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_match_teams_match_id ON match_teams(match_id);
CREATE INDEX IF NOT EXISTS idx_match_teams_team_id ON match_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_bgmi_stage_standings_tourney ON bgmi_stage_standings(tournament_id, rank_position);
CREATE INDEX IF NOT EXISTS idx_tournament_rosters_lookup ON tournament_rosters(tournament_id, team_id, player_id);
