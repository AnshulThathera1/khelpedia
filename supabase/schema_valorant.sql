-- Valorant Tracker Cache Schema

-- 1. valorant_accounts table (caching PUUIDs to save /riot/account/v1 calls)
CREATE TABLE IF NOT EXISTS public.valorant_accounts (
    puuid TEXT PRIMARY KEY, -- From Riot Account API
    game_name TEXT NOT NULL,
    tag_line TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure unique constraint on Game Name + Tag Line combination (case insensitive ideally, but Riot ID is unique)
    UNIQUE(game_name, tag_line)
);

-- Index for fast lookup by gameName and tagLine
CREATE INDEX IF NOT EXISTS idx_valorant_accounts_riot_id 
ON public.valorant_accounts (lower(game_name), lower(tag_line));

-- 2. valorant_matches table (caching Match Details to save /val/match/v1 calls)
DROP TABLE IF EXISTS public.valorant_matches CASCADE;

CREATE TABLE public.valorant_matches (
    match_id TEXT PRIMARY KEY,
    map_id TEXT NOT NULL,
    region TEXT NOT NULL,
    queue_id TEXT NOT NULL,
    season_id TEXT,
    game_start_millis BIGINT NOT NULL,
    game_length_millis BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.match_teams (
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    team_id TEXT NOT NULL,
    won BOOLEAN NOT NULL,
    rounds_won INT NOT NULL,
    rounds_played INT NOT NULL,
    num_points INT NOT NULL,
    PRIMARY KEY (match_id, team_id)
);

CREATE TABLE public.match_players (
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    puuid TEXT NOT NULL,
    team_id TEXT NOT NULL,
    character_id TEXT NOT NULL,
    competitive_tier INT,
    player_card TEXT,
    party_id TEXT,
    kills INT NOT NULL DEFAULT 0,
    deaths INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    rounds_played INT NOT NULL DEFAULT 0,
    PRIMARY KEY (match_id, puuid)
);

CREATE TABLE public.match_rounds (
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    round_num INT NOT NULL,
    winning_team TEXT,
    PRIMARY KEY (match_id, round_num)
);

CREATE TABLE public.match_round_player_stats (
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    round_num INT NOT NULL,
    puuid TEXT NOT NULL,
    weapon_id TEXT,
    PRIMARY KEY (match_id, round_num, puuid)
);

CREATE TABLE public.match_round_kills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    round_num INT NOT NULL,
    killer_puuid TEXT,
    victim_puuid TEXT,
    time_in_round_millis BIGINT,
    assistants TEXT[] -- Array of puuids
);

CREATE TABLE public.match_round_damage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT REFERENCES public.valorant_matches(match_id) ON DELETE CASCADE,
    round_num INT NOT NULL,
    attacker_puuid TEXT NOT NULL,
    receiver_puuid TEXT NOT NULL,
    damage INT NOT NULL DEFAULT 0,
    headshots INT NOT NULL DEFAULT 0,
    bodyshots INT NOT NULL DEFAULT 0,
    legshots INT NOT NULL DEFAULT 0
);

-- Index for fetching matches for a specific player quickly
CREATE INDEX IF NOT EXISTS idx_match_players_puuid 
ON public.match_players (puuid);

-- RLS Policies
ALTER TABLE public.valorant_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valorant_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_round_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_round_kills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_round_damage ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow public read access to valorant_accounts" ON public.valorant_accounts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to valorant_matches" ON public.valorant_matches;
CREATE POLICY "Allow public read access to valorant_matches" ON public.valorant_matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_teams" ON public.match_teams;
CREATE POLICY "Allow public read access to match_teams" ON public.match_teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_players" ON public.match_players;
CREATE POLICY "Allow public read access to match_players" ON public.match_players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_rounds" ON public.match_rounds;
CREATE POLICY "Allow public read access to match_rounds" ON public.match_rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_round_player_stats" ON public.match_round_player_stats;
CREATE POLICY "Allow public read access to match_round_player_stats" ON public.match_round_player_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_round_kills" ON public.match_round_kills;
CREATE POLICY "Allow public read access to match_round_kills" ON public.match_round_kills FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read access to match_round_damage" ON public.match_round_damage;
CREATE POLICY "Allow public read access to match_round_damage" ON public.match_round_damage FOR SELECT USING (true);

-- Allow anon insert to all (since it's caching)
DROP POLICY IF EXISTS "Allow anon insert to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow anon insert to valorant_accounts" ON public.valorant_accounts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow anon update to valorant_accounts" ON public.valorant_accounts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon insert to valorant_matches" ON public.valorant_matches;
CREATE POLICY "Allow anon insert to valorant_matches" ON public.valorant_matches FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_teams" ON public.match_teams;
CREATE POLICY "Allow anon insert to match_teams" ON public.match_teams FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_players" ON public.match_players;
CREATE POLICY "Allow anon insert to match_players" ON public.match_players FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_rounds" ON public.match_rounds;
CREATE POLICY "Allow anon insert to match_rounds" ON public.match_rounds FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_round_player_stats" ON public.match_round_player_stats;
CREATE POLICY "Allow anon insert to match_round_player_stats" ON public.match_round_player_stats FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_round_kills" ON public.match_round_kills;
CREATE POLICY "Allow anon insert to match_round_kills" ON public.match_round_kills FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon insert to match_round_damage" ON public.match_round_damage;
CREATE POLICY "Allow anon insert to match_round_damage" ON public.match_round_damage FOR INSERT WITH CHECK (true);

-- Update 2026-05-17: RSO Compliance
ALTER TABLE public.valorant_accounts 
ADD COLUMN IF NOT EXISTS is_opted_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for user_id to find a player's linked Riot account quickly
CREATE INDEX IF NOT EXISTS idx_valorant_accounts_user_id ON public.valorant_accounts(user_id);
