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
CREATE TABLE IF NOT EXISTS public.valorant_matches (
    match_id TEXT PRIMARY KEY,
    puuid TEXT NOT NULL REFERENCES public.valorant_accounts(puuid) ON DELETE CASCADE,
    match_info_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fetching matches for a specific player quickly
CREATE INDEX IF NOT EXISTS idx_valorant_matches_puuid 
ON public.valorant_matches (puuid);

-- RLS Policies
-- We only want the server to insert data, but public can read. 
-- Assuming standard public access for reading stats.

ALTER TABLE public.valorant_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valorant_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow public read access to valorant_accounts" 
    ON public.valorant_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to valorant_matches" ON public.valorant_matches;
CREATE POLICY "Allow public read access to valorant_matches" 
    ON public.valorant_matches FOR SELECT USING (true);

-- Allow service role (Next.js server with service key) to insert/update, or anon if using anon key.
-- Since this is caching, we can allow anon to insert/update for simplicity, but tracking who inserted it is better done via backend.
DROP POLICY IF EXISTS "Allow anon insert to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow anon insert to valorant_accounts" 
    ON public.valorant_accounts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update to valorant_accounts" ON public.valorant_accounts;
CREATE POLICY "Allow anon update to valorant_accounts" 
    ON public.valorant_accounts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon insert to valorant_matches" ON public.valorant_matches;
CREATE POLICY "Allow anon insert to valorant_matches" 
    ON public.valorant_matches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update to valorant_matches" ON public.valorant_matches;
CREATE POLICY "Allow anon update to valorant_matches" 
    ON public.valorant_matches FOR UPDATE USING (true);

-- Update 2026-05-17: RSO Compliance
ALTER TABLE public.valorant_accounts 
ADD COLUMN IF NOT EXISTS is_opted_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for user_id to find a player's linked Riot account quickly
CREATE INDEX IF NOT EXISTS idx_valorant_accounts_user_id ON public.valorant_accounts(user_id);
