-- Run this in your Supabase SQL Editor to support Custom and Edited Players

-- 1. Add the is_custom flag to the players table
-- When true, it means an Admin has manually created or edited this player.
-- Your PandaScore Python scraper should be updated to skip overwriting players where is_custom = true.
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;

-- 2. Create the Admin policies for the players table
-- (Right now players only has a public read policy)

-- Allow admins to insert new players
CREATE POLICY "Admins can insert players"
  ON players FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to update existing players
CREATE POLICY "Admins can update players"
  ON players FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to delete players (optional, but good for custom ones)
CREATE POLICY "Admins can delete players"
  ON players FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
