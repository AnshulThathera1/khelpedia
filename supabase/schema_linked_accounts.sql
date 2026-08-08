-- ============================================================
-- KhelPediA — Linked Accounts Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_linked_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL, -- e.g., 'riot', 'steam', 'epic'
    game_name TEXT NOT NULL, -- e.g., 'Faker'
    tag_line TEXT, -- e.g., 'KR1'
    region TEXT, -- e.g., 'kr', 'na1'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider) -- One user can only link one Riot account for now
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_linked_accounts_user_id ON public.user_linked_accounts(user_id);

-- RLS
ALTER TABLE public.user_linked_accounts ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own linked accounts
DROP POLICY IF EXISTS "Users can read own linked accounts" ON public.user_linked_accounts;
CREATE POLICY "Users can read own linked accounts" 
    ON public.user_linked_accounts FOR SELECT USING (auth.uid() = user_id);

-- Allow public to read linked accounts for Passport page (needed to render public profiles)
DROP POLICY IF EXISTS "Public can read linked accounts" ON public.user_linked_accounts;
CREATE POLICY "Public can read linked accounts" 
    ON public.user_linked_accounts FOR SELECT USING (true);

-- Allow users to insert their own linked accounts
DROP POLICY IF EXISTS "Users can insert own linked accounts" ON public.user_linked_accounts;
CREATE POLICY "Users can insert own linked accounts" 
    ON public.user_linked_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own linked accounts
DROP POLICY IF EXISTS "Users can update own linked accounts" ON public.user_linked_accounts;
CREATE POLICY "Users can update own linked accounts" 
    ON public.user_linked_accounts FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own linked accounts
DROP POLICY IF EXISTS "Users can delete own linked accounts" ON public.user_linked_accounts;
CREATE POLICY "Users can delete own linked accounts" 
    ON public.user_linked_accounts FOR DELETE USING (auth.uid() = user_id);
