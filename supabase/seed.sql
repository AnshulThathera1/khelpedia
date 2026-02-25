-- ============================================================
-- KhelPediA — Seed Data
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ===================== GAMES =====================
INSERT INTO games (name, slug, icon_url, genre, description) VALUES
('Valorant', 'valorant', 'https://cdn2.unrealengine.com/valorant-logo-2x-100-2-1920x1080-78aa89e5ddd9.jpg', 'Tactical FPS', 'Riot Games'' 5v5 character-based tactical shooter.'),
('CS2', 'cs2', 'https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react/social/cs2.jpg', 'Tactical FPS', 'Counter-Strike 2 by Valve. The definitive competitive FPS.'),
('BGMI', 'bgmi', 'https://staticg.sportskeeda.com/editor/2023/05/b4973-16849010997012-1920.jpg', 'Battle Royale', 'Battlegrounds Mobile India — the premier mobile battle royale in India.'),
('PUBG Mobile', 'pubg-mobile', 'https://cdn.mobilesyrup.com/wp-content/uploads/2020/05/pubg-mobile-logo.jpg', 'Battle Royale', 'The original mobile battle royale phenomenon.'),
('Free Fire', 'free-fire', 'https://staticg.sportskeeda.com/editor/2022/12/5e5e4-16709990816588-1920.jpg', 'Battle Royale', 'Garena Free Fire — fast-paced mobile battle royale.'),
('Dota 2', 'dota-2', 'https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo.png', 'MOBA', 'Valve''s iconic multiplayer online battle arena.')
ON CONFLICT (slug) DO NOTHING;

-- ===================== TEAMS =====================
INSERT INTO teams (name, slug, logo_url, region, country, founded_year, description) VALUES
('Team Liquid', 'team-liquid', 'https://upload.wikimedia.org/wikipedia/en/f/fd/Team_Liquid_logo.svg', 'NA', 'US', 2000, 'One of the most successful esports organizations worldwide.'),
('Fnatic', 'fnatic', 'https://upload.wikimedia.org/wikipedia/en/4/43/Fnatic_Logo.svg', 'EU', 'GB', 2004, 'European esports powerhouse across multiple titles.'),
('Sentinels', 'sentinels', 'https://upload.wikimedia.org/wikipedia/en/6/6c/Sentinels_logo.svg', 'NA', 'US', 2016, 'North American champions, dominant in Valorant.'),
('LOUD', 'loud', 'https://upload.wikimedia.org/wikipedia/commons/1/18/LOUD_logo.svg', 'SA', 'BR', 2019, 'Brazilian esports organisation, Valorant world champions.'),
('DRX', 'drx', 'https://upload.wikimedia.org/wikipedia/en/f/f3/DRX_logo.svg', 'APAC', 'KR', 2012, 'Korean esports powerhouse.'),
('NAVI', 'navi', 'https://upload.wikimedia.org/wikipedia/en/a/ac/NaVi_logo.svg', 'EU', 'UA', 2009, 'Natus Vincere — one of the most iconic CS orgs ever.'),
('Cloud9', 'cloud9', 'https://upload.wikimedia.org/wikipedia/en/8/88/Cloud9_logo.svg', 'NA', 'US', 2013, 'Multi-title NA esports organization.'),
('GodLike Esports', 'godlike-esports', 'https://staticg.sportskeeda.com/editor/2022/07/3f7e4-16571587789684-1920.jpg', 'South Asia', 'IN', 2018, 'India''s premier BGMI and mobile esports team.'),
('Soul', 'soul', 'https://staticg.sportskeeda.com/editor/2022/05/25f9c-16515458133855-1920.jpg', 'South Asia', 'IN', 2019, 'Team SouL — iconic Indian BGMI roster.'),
('Global Esports', 'global-esports', 'https://upload.wikimedia.org/wikipedia/en/5/50/Global_Esports_logo.png', 'South Asia', 'IN', 2017, 'Leading Indian Valorant team.'),
('FaZe Clan', 'faze-clan', 'https://upload.wikimedia.org/wikipedia/en/5/5b/FaZe_Clan_logo.svg', 'NA', 'US', 2010, 'Multi-game esports and entertainment org.'),
('Paper Rex', 'paper-rex', 'https://upload.wikimedia.org/wikipedia/en/a/a0/Paper_Rex_logo.svg', 'APAC', 'SG', 2020, 'Southeast Asian Valorant champions known for aggressive play.'),
('Team Spirit', 'team-spirit', 'https://upload.wikimedia.org/wikipedia/en/7/7e/Team_Spirit_logo.svg', 'EU', 'RU', 2015, 'Dota 2 TI champions with strong CS2 presence.'),
('OG', 'og', 'https://upload.wikimedia.org/wikipedia/en/e/e8/OG_logo.svg', 'EU', 'EU', 2015, 'Two-time Dota 2 TI champions.')
ON CONFLICT (slug) DO NOTHING;

-- ===================== PLAYERS =====================
-- We'll use DO NOTHING on conflict to make re-runs safe
INSERT INTO players (name, ign, slug, country, role, team_id, earnings) VALUES
('Tyson Ngo', 'TenZ', 'tenz', 'CA', 'Duelist', (SELECT id FROM teams WHERE slug='sentinels'), 215000),
('Nikita Buyanov', 's1mple', 's1mple', 'UA', 'Rifler', (SELECT id FROM teams WHERE slug='navi'), 1850000),
('Jaccob Slavik', 'yay', 'yay', 'US', 'Sentinel', (SELECT id FROM teams WHERE slug='cloud9'), 185000),
('Adil Benrlitom', 'ScreaM', 'scream', 'BE', 'Duelist', NULL, 320000),
('Aspas', 'aspas', 'aspas', 'BR', 'Duelist', (SELECT id FROM teams WHERE slug='loud'), 275000),
('Shyam Thapa', 'Classy ff', 'classyff', 'IN', 'IGL', (SELECT id FROM teams WHERE slug='godlike-esports'), 42000),
('Naman Mathur', 'MortaL', 'mortal', 'IN', 'IGL', (SELECT id FROM teams WHERE slug='soul'), 95000),
('Ganesh Gangadhar', 'SkRossi', 'skrossi', 'IN', 'Duelist', (SELECT id FROM teams WHERE slug='global-esports'), 35000),
('Wang Jing', 'Jinggg', 'jinggg', 'SG', 'Duelist', (SELECT id FROM teams WHERE slug='paper-rex'), 145000),
('Ilya Mulyarchik', 'Yatoro', 'yatoro', 'UA', 'Carry', (SELECT id FROM teams WHERE slug='team-spirit'), 9200000),
('Jonathan Amaral', 'JoNy', 'jony', 'IN', 'Assaulter', (SELECT id FROM teams WHERE slug='godlike-esports'), 65000),
('Mathieu Herbaut', 'ZywOo', 'zywoo', 'FR', 'AWPer', (SELECT id FROM teams WHERE slug='team-liquid'), 1100000),
('Robin Kool', 'ropz', 'ropz', 'EE', 'Rifler', (SELECT id FROM teams WHERE slug='faze-clan'), 980000),
('Oleksandr Kostyliev', 'Niko', 'niko', 'BA', 'Rifler', (SELECT id FROM teams WHERE slug='faze-clan'), 850000),
('Johan Sundstein', 'N0tail', 'n0tail', 'DK', 'Support', (SELECT id FROM teams WHERE slug='og'), 7200000),
('Bowen Playfair', 'BuZz', 'buzz', 'KR', 'Flex', (SELECT id FROM teams WHERE slug='drx'), 195000)
ON CONFLICT (slug) DO NOTHING;

-- ===================== TOURNAMENTS =====================
INSERT INTO tournaments (game_id, name, slug, region, status, prize_pool, currency, start_date, end_date, format, tier, description) VALUES
((SELECT id FROM games WHERE slug='valorant'), 'VCT Masters Shanghai 2026', 'vct-masters-shanghai-2026', 'Global', 'live', 1000000, 'USD', '2026-02-20', '2026-03-10', 'Double Elimination', 'S', 'The premier Valorant international tournament.'),
((SELECT id FROM games WHERE slug='valorant'), 'VCT Champions 2026', 'vct-champions-2026', 'Global', 'upcoming', 2250000, 'USD', '2026-08-01', '2026-08-25', 'Swiss + Bracket', 'S', 'The Valorant world championship.'),
((SELECT id FROM games WHERE slug='cs2'), 'IEM Katowice 2026', 'iem-katowice-2026', 'Global', 'completed', 1000000, 'USD', '2026-01-29', '2026-02-09', 'GSL Groups + Playoffs', 'S', 'The legendary IEM Katowice returns.'),
((SELECT id FROM games WHERE slug='cs2'), 'BLAST Premier Spring Finals 2026', 'blast-spring-finals-2026', 'Global', 'live', 425000, 'USD', '2026-02-18', '2026-02-28', 'Double Elimination', 'A', 'Top CS2 teams clash in the BLAST Spring Finals.'),
((SELECT id FROM games WHERE slug='bgmi'), 'BGMI Masters Series Season 3', 'bgmi-masters-s3', 'South Asia', 'live', 200000, 'USD', '2026-02-10', '2026-03-15', 'League + Finals', 'A', 'India''s biggest BGMI tournament.'),
((SELECT id FROM games WHERE slug='bgmi'), 'BMOC 2026', 'bmoc-2026', 'South Asia', 'upcoming', 100000, 'USD', '2026-04-01', '2026-04-30', 'Open Qualifier', 'B', 'Battlegrounds Mobile Open Challenge 2026.'),
((SELECT id FROM games WHERE slug='pubg-mobile'), 'PMWC 2026', 'pmwc-2026', 'Global', 'upcoming', 3000000, 'USD', '2026-06-15', '2026-07-10', 'Group Stage + Finals', 'S', 'PUBG Mobile World Cup 2026.'),
((SELECT id FROM games WHERE slug='free-fire'), 'Free Fire World Series 2026', 'ffws-2026', 'Global', 'upcoming', 1500000, 'USD', '2026-05-20', '2026-06-05', 'Play-ins + Finals', 'S', 'The biggest Free Fire event of the year.'),
((SELECT id FROM games WHERE slug='dota-2'), 'The International 2026', 'ti-2026', 'Global', 'upcoming', 15000000, 'USD', '2026-10-10', '2026-10-28', 'Group Stage + Main Event', 'S', 'Dota 2''s ultimate championship.'),
((SELECT id FROM games WHERE slug='dota-2'), 'DreamLeague Season 24', 'dreamleague-s24', 'EU', 'live', 500000, 'USD', '2026-02-15', '2026-03-05', 'Round Robin + Playoffs', 'A', 'Major DPC qualifying event.'),
((SELECT id FROM games WHERE slug='valorant'), 'VCT APAC League 2026', 'vct-apac-2026', 'APAC', 'live', 300000, 'USD', '2026-02-01', '2026-03-20', 'Round Robin', 'A', 'Pacific league featuring top APAC teams.'),
((SELECT id FROM games WHERE slug='cs2'), 'ESL Pro League S23', 'esl-pro-s23', 'Global', 'upcoming', 850000, 'USD', '2026-03-10', '2026-04-06', 'GSL Groups + Playoffs', 'S', 'One of the most prestigious CS2 leagues.')
ON CONFLICT (slug) DO NOTHING;

-- ===================== TOURNAMENT TEAMS =====================
-- VCT Masters Shanghai
INSERT INTO tournament_teams (tournament_id, team_id) VALUES
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='sentinels')),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='loud')),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='fnatic')),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='paper-rex')),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='drx'))
ON CONFLICT (tournament_id, team_id) DO NOTHING;

-- BGMI Masters Series S3
INSERT INTO tournament_teams (tournament_id, team_id) VALUES
((SELECT id FROM tournaments WHERE slug='bgmi-masters-s3'), (SELECT id FROM teams WHERE slug='godlike-esports')),
((SELECT id FROM tournaments WHERE slug='bgmi-masters-s3'), (SELECT id FROM teams WHERE slug='soul'))
ON CONFLICT (tournament_id, team_id) DO NOTHING;

-- IEM Katowice 2026
INSERT INTO tournament_teams (tournament_id, team_id, placement, prize_won) VALUES
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='navi'), 1, 400000),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='faze-clan'), 2, 180000),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='team-liquid'), 3, 80000),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='team-spirit'), 4, 60000),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='cloud9'), 5, 40000)
ON CONFLICT (tournament_id, team_id) DO NOTHING;

-- DreamLeague S24
INSERT INTO tournament_teams (tournament_id, team_id) VALUES
((SELECT id FROM tournaments WHERE slug='dreamleague-s24'), (SELECT id FROM teams WHERE slug='team-spirit')),
((SELECT id FROM tournaments WHERE slug='dreamleague-s24'), (SELECT id FROM teams WHERE slug='og'))
ON CONFLICT (tournament_id, team_id) DO NOTHING;

-- ===================== PLAYER STATS =====================
INSERT INTO player_stats (player_id, game_id, kills, deaths, assists, win_rate, matches_played, rating, headshot_pct, avg_damage) VALUES
((SELECT id FROM players WHERE slug='tenz'), (SELECT id FROM games WHERE slug='valorant'), 14500, 10800, 5200, 58.5, 480, 1.28, 28.3, 152.4),
((SELECT id FROM players WHERE slug='s1mple'), (SELECT id FROM games WHERE slug='cs2'), 82000, 52000, 15000, 63.2, 1800, 1.35, 42.1, 88.6),
((SELECT id FROM players WHERE slug='yay'), (SELECT id FROM games WHERE slug='valorant'), 11200, 8900, 3800, 55.8, 390, 1.21, 31.2, 148.7),
((SELECT id FROM players WHERE slug='aspas'), (SELECT id FROM games WHERE slug='valorant'), 13800, 10200, 4600, 60.1, 450, 1.31, 26.8, 163.2),
((SELECT id FROM players WHERE slug='classyff'), (SELECT id FROM games WHERE slug='bgmi'), 28000, 12000, 8500, 52.3, 650, 1.15, 18.5, 245.0),
((SELECT id FROM players WHERE slug='mortal'), (SELECT id FROM games WHERE slug='bgmi'), 35000, 15000, 11000, 55.0, 820, 1.18, 20.1, 232.6),
((SELECT id FROM players WHERE slug='skrossi'), (SELECT id FROM games WHERE slug='valorant'), 9500, 7800, 3200, 53.2, 310, 1.16, 25.4, 139.8),
((SELECT id FROM players WHERE slug='jinggg'), (SELECT id FROM games WHERE slug='valorant'), 12600, 9100, 4100, 59.4, 420, 1.30, 27.5, 157.3),
((SELECT id FROM players WHERE slug='yatoro'), (SELECT id FROM games WHERE slug='dota-2'), 24000, 11500, 18000, 61.8, 1200, 1.42, 0, 0),
((SELECT id FROM players WHERE slug='zywoo'), (SELECT id FROM games WHERE slug='cs2'), 68000, 43000, 12500, 61.5, 1500, 1.33, 40.6, 85.2),
((SELECT id FROM players WHERE slug='ropz'), (SELECT id FROM games WHERE slug='cs2'), 55000, 38000, 10500, 59.8, 1350, 1.25, 38.2, 78.5),
((SELECT id FROM players WHERE slug='niko'), (SELECT id FROM games WHERE slug='cs2'), 72000, 48000, 14000, 58.9, 1650, 1.27, 45.3, 82.1),
((SELECT id FROM players WHERE slug='n0tail'), (SELECT id FROM games WHERE slug='dota-2'), 18000, 14000, 28000, 57.2, 2100, 1.08, 0, 0),
((SELECT id FROM players WHERE slug='buzz'), (SELECT id FROM games WHERE slug='valorant'), 10800, 8600, 4500, 56.3, 380, 1.19, 24.1, 142.5),
((SELECT id FROM players WHERE slug='jony'), (SELECT id FROM games WHERE slug='bgmi'), 22000, 10500, 7800, 54.1, 580, 1.20, 19.8, 238.4)
ON CONFLICT (player_id, game_id) DO NOTHING;

-- ===================== MATCHES =====================
-- IEM Katowice Grand Final
INSERT INTO matches (tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map, played_at) VALUES
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='navi'), (SELECT id FROM teams WHERE slug='faze-clan'), 16, 12, (SELECT id FROM teams WHERE slug='navi'), 'Grand Final', 'Mirage', '2026-02-09 18:00:00+00'),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='navi'), (SELECT id FROM teams WHERE slug='faze-clan'), 13, 8, (SELECT id FROM teams WHERE slug='navi'), 'Grand Final', 'Inferno', '2026-02-09 19:30:00+00'),
((SELECT id FROM tournaments WHERE slug='iem-katowice-2026'), (SELECT id FROM teams WHERE slug='navi'), (SELECT id FROM teams WHERE slug='faze-clan'), 14, 16, (SELECT id FROM teams WHERE slug='faze-clan'), 'Grand Final', 'Nuke', '2026-02-09 21:00:00+00');

-- VCT Masters Shanghai (ongoing)
INSERT INTO matches (tournament_id, team1_id, team2_id, score1, score2, winner_id, round, map, played_at) VALUES
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='sentinels'), (SELECT id FROM teams WHERE slug='fnatic'), 13, 9, (SELECT id FROM teams WHERE slug='sentinels'), 'Group A', 'Ascent', '2026-02-22 14:00:00+00'),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='loud'), (SELECT id FROM teams WHERE slug='paper-rex'), 13, 11, (SELECT id FROM teams WHERE slug='loud'), 'Group B', 'Lotus', '2026-02-22 16:00:00+00'),
((SELECT id FROM tournaments WHERE slug='vct-masters-shanghai-2026'), (SELECT id FROM teams WHERE slug='drx'), (SELECT id FROM teams WHERE slug='sentinels'), 7, 13, (SELECT id FROM teams WHERE slug='sentinels'), 'Group A', 'Haven', '2026-02-24 14:00:00+00');
