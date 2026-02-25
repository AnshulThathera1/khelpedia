-- Run this in your Supabase SQL Editor to allow the scraper to insert data
-- We are granting INSERT permissions to the anon role so the REST API works

-- 1. Allow inserts on tournaments
CREATE POLICY "Allow anon insert tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update tournaments" ON tournaments FOR UPDATE USING (true);

-- 2. Allow inserts on teams
CREATE POLICY "Allow anon insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update teams" ON teams FOR UPDATE USING (true);

-- 3. Allow inserts on matches
CREATE POLICY "Allow anon insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update matches" ON matches FOR UPDATE USING (true);
