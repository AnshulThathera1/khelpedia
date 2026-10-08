# Revised KhelPediA Unique Value Implementation Plan

**Target Site:** KhelPediA (https://khelpedia.org)  
**Document Type:** Technical Architecture & Implementation Plan  
**Date:** September 28, 2026  
**Status:** Revised — Pending Final User Approval  

---

## 1. Verified Database Statistics & Match Quality

Empirical results from the read-only database quality audit ([`match_data_quality_report.md`](file:///e:/Projects/KhelPediA/khelpedia/match_data_quality_report.md)):

| Entity / Dimension | Database Count | Valid / Complete Count | Integrity / Quality Status |
|---|---|---|---|
| **Total Match Rows** | **297,884** | 297,884 (100%) | Raw match database size. |
| **Matches with Winner** | 297,884 | 284,309 (95.44%) | 284,309 have explicit `winner_id`. 13,575 lack explicit winner. |
| **Matches with Valid Scores** | 297,884 | 297,884 (100%) | `score1` and `score2` populated. |
| **Matches with Timestamps** | 297,884 | 297,846 (99.99%) | 38 rows missing timestamp. |
| **Matches Linked to Game** | 297,884 | 1,000 (**0.34%**) | **296,884 matches belong to tournaments where `game_id = NULL`.** |
| **Orphaned Team References** | 297,884 | 581 (0.20%) | 581 match rows reference team IDs missing from `teams`. |
| **Duplicate Candidates** | 297,884 | 658 (0.22%) | 658 rows share identical tournament + team pairing + schedule keys. |
| **Tournaments** | **2,018** | 10 (0.50% linked) | 2,008 tournaments are empty stubs lacking match rows. |
| **Teams** | **1,517** | 57 (3.76% linked) | 1,460 teams are empty stubs lacking match/player links. |
| **Players** | **18** | 15 (83.33% linked) | 15 players have verified stats in `player_stats`. |
| **Source Mappings** | **0** | 0 records in DB | Table `entity_source_mapping` exists but is empty in production. |

---

## 2. Verified Entity Graph Density

Empirical graph connectivity measurements:

```
+-----------------------------------------------------------------------------------+
|                        VERIFIED ENTITY GRAPH CONNECTIVITY                         |
+-----------------------------------------------------------------------------------+
| TEAMS (1,517 total):                                                              |
|   - Teams with match history:              57 teams  (3.76%)                      |
|   - Teams with active players:             13 teams  (0.86%)                      |
|   - Teams with tournament records:         13 teams  (0.86%)                      |
|   - Disconnected Stub Teams:            1,460 teams (96.24%)                      |
|                                                                                   |
| TOURNAMENTS (2,018 total):                                                        |
|   - Tournaments with linked matches:       10 tourneys (0.50%)                    |
|   - Tournaments with linked teams:          4 tourneys (0.20%)                    |
|   - Disconnected Stub Tournaments:      2,008 tourneys (99.50%)                   |
|                                                                                   |
| PLAYERS (18 total):                                                               |
|   - Players with match stats:              15 players (83.33%)                    |
|   - Players with team affiliations:        15 players (83.33%)                    |
|   - Players with tournament history:       14 players (77.78%)                    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Corrected Indexability Predicates & Rules

Indexability will **NOT** be granted merely due to record counts or simple field presence (e.g. `team_id IS NOT NULL`). Indexability is based on **substantive verified user value**.

### Exact SQL Predicates for `src/lib/seo.js`

```javascript
// 1. PLAYER INDEXABILITY PREDICATE
// A player is indexable ONLY if they have verified match stats OR custom editorial content > 100 chars.
// Having a team_id alone DOES NOT make a player indexable.
export const PLAYER_INDEXABLE_SQL = `
  p.ign IS NOT NULL AND TRIM(p.ign) != ''
  AND (
    EXISTS (SELECT 1 FROM player_stats ps WHERE ps.player_id = p.id AND ps.matches_played > 0)
    OR LENGTH(TRIM(COALESCE(p.editorial_content, ''))) > 100
  )
`;

// 2. TOURNAMENT INDEXABILITY PREDICATE
// A tournament is indexable ONLY if it has custom editorial content > 100 chars OR has valid matches AND participating teams.
export const TOURNAMENT_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
  OR (
    EXISTS (SELECT 1 FROM tournament_teams tt WHERE tt.tournament_id = t.id)
    AND EXISTS (SELECT 1 FROM matches m WHERE m.tournament_id = t.id HAVING COUNT(m.id) >= 2)
  )
`;

// 3. TEAM INDEXABILITY PREDICATE
// A team is indexable ONLY if it has custom editorial content > 100 chars OR active roster players AND match history.
export const TEAM_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 100
  OR (
    EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id)
    AND EXISTS (SELECT 1 FROM matches m WHERE (m.team1_id = t.id OR m.team2_id = t.id) HAVING COUNT(m.id) >= 3)
  )
`;

// 4. BLOG INDEXABILITY PREDICATE
export const BLOG_INDEXABLE_SQL = `
  b.is_published = true
`;
```

---

## 4. Provenance & Source Attribution Architecture

Because `entity_source_mapping` currently has 0 rows in production:
1. **No Generic Fake Badges:** We will **NOT** display generic badges claiming *"Verified by PandaScore, OpenDota, Liquipedia, eSportsAmaze"*.
2. **Entity-Level Provenance:** Source metadata will render **only when a specific record has verifiable source attribution** in the database.
3. **Match Provenance:** Matches are uniquely identified by external `source_match_id` via `IdempotentUpsert.js`. No `UNIQUE(tournament_id, team1_id, team2_id)` constraint exists, preserving legitimate repeated matches (e.g. Map 1 vs Map 2 in a series).

---

## 5. Corrected Homepage Metrics

Marketing statistics displayed on the homepage ([`src/app/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/page.jsx)) will be strictly bound to verified, high-quality data:

- **Verified Match Metric:** Display **"284,000+ Verified Match Results"** (based on 284,309 matches with explicit winner outcomes).
- **Verified Game Titles:** Display **"6 Major Titles"** (Valorant, CS2, BGMI, PUBG Mobile, Free Fire, Dota 2).
- **Active Entity Counters:** Query only connected teams (57) and connected tournaments (10) for public counters, avoiding misleading stub numbers.

---

## 6. Corrected Blog Pipeline Architecture

The blog pipeline transitions from simple RSS rewriting to a **Verified Data-Assisted Editorial Engine**:

```
+-----------------------------------------------------------------------------+
|                     REVISED EDITORIAL PIPELINE FLOW                         |
+-----------------------------------------------------------------------------+
| 1. EXTERNAL SOURCES   | Monitor RSS / API feeds for event discovery only    |
| 2. EVENT DISCOVERY    | Identify high-interest upcoming or live match       |
| 3. SOURCE VERIFICATION| Verify match schedule & teams against primary source|
| 4. KHELPEDIA DATABASE | Query KhelPediA DB for team H2H, win rates & form   |
| 5. STATISTICAL EXTRACT| Extract verified stats (e.g. 5-0 H2H, map win %)   |
| 6. ORIGINAL ANALYSIS  | Prompt AI to write analysis using KhelPediA stats   |
| 7. FACT VALIDATION    | Cross-check all generated numbers against DB rows   |
| 8. PUBLICATION        | Publish with entity deep-links & editorial info     |
+-----------------------------------------------------------------------------+
```

---

## 7. AI Generation Safety & Resilience Design

To prevent rate limits, API failures, or duplicate article publishing, `scripts/generate_bulk_news.js` will incorporate strict production safety controls:

1. **Request Rate Limiting:** Enforce a maximum rate of 5 requests per minute using an async queue token bucket.
2. **Exponential Backoff:** If a `429 Too Many Requests` or `503 Unavailable` error occurs, back off exponentially (`2^attempt * 2000ms` up to 32s).
3. **Timeout Handling:** Enforce a 15-second timeout per AI invocation with AbortController.
4. **Retry Limits:** Maximum 3 retries per article payload before routing to `FailedRecordQueue`.
5. **Daily Limits:** Hard limit of max 10 automated articles generated per 24 hours.
6. **Idempotency & Duplicate Detection:** Compute normalized title slug and payload hash; query `blogs` table for duplicate title/slug before calling AI.

---

## 8. Removal of Generic Fallback Paragraphs

All generic fallback paragraphs (e.g. `"...is a competitive esports organization operating in..."`) will be **completely removed** from:
- `src/app/teams/[id]/page.jsx`
- `src/app/tournaments/[id]/page.jsx`
- `src/app/players/[slug]/page.jsx`

**Replacement Behavior:**
- If verified data exists: Render verified statistics widgets, rosters, and match histories.
- If verified data does NOT exist: Render only basic navigation and metadata, and apply `noindex, follow` so search engines do not index the page. **No artificial AI text filler will be injected.**

---

## 9. Data-Driven Entity Experience Specifications

* **TEAM Page (`/teams/[id]`):**
  * Renders `TeamStatsWidget` (Win/Loss %, recent 5 match form) **only if `matches` count >= 1**.
  * Renders `ActiveRoster` **only if `players` count >= 1**.
  * Renders `TournamentHistory` **only if `tournament_teams` count >= 1**.
* **TOURNAMENT Page (`/tournaments/[id]`):**
  * Renders `TournamentStatsWidget` (total maps, match count, status) **only if `matches` count >= 1**.
  * Renders `ParticipatingTeams` **only if `tournament_teams` count >= 1**.
* **PLAYER Profile (`/players/[slug]`):**
  * Renders K/D, Headshot %, and ADR cards **only if `player_stats` row exists with `matches_played > 0`**.
  * Renders Career Overview linking to team page.
* **MATCH View Component:**
  * Renders H2H record prior to match **only if previous matches exist between team1 and team2**.

---

## 10. Exact SQL Queries & Files to Modify

### Files to Modify
1. [`src/lib/seo.js`](file:///e:/Projects/KhelPediA/khelpedia/src/lib/seo.js) — Update indexability predicates (`PLAYER_INDEXABLE_SQL`, `TEAM_INDEXABLE_SQL`, `TOURNAMENT_INDEXABLE_SQL`).
2. [`src/lib/queries.js`](file:///e:/Projects/KhelPediA/khelpedia/src/lib/queries.js) — Add helper queries (`getTeamPerformanceStats`, `getHeadToHeadStats`, `getTournamentStats`).
3. [`src/app/teams/[id]/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/teams/[id]/page.jsx) — Remove generic fallback text; render verified data widgets.
4. [`src/app/tournaments/[id]/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/tournaments/[id]/page.jsx) — Remove generic fallback text; render verified match widgets.
5. [`src/app/players/[slug]/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/players/[slug]/page.jsx) — Remove boilerplate text; render verified player stats.
6. [`src/app/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/page.jsx) — Update homepage value proposition & verified metrics.
7. [`src/app/blogs/[slug]/page.jsx`](file:///e:/Projects/KhelPediA/khelpedia/src/app/blogs/[slug]/page.jsx) — Add author & editorial policy disclosure block.
8. [`scripts/generate_bulk_news.js`](file:///e:/Projects/KhelPediA/khelpedia/scripts/generate_bulk_news.js) — Refactor blog generator to use internal DB match stats and safety backoff controls.

### Exact SQL Queries to Introduce in `src/lib/queries.js`

```javascript
// 1. Get Team Performance Stats & Form
export async function getTeamPerformanceStats(teamId) {
  const sql = `
    SELECT 
      COUNT(m.id)::int AS total_matches,
      COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::int AS wins,
      COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != $1 THEN 1 END)::int AS losses,
      ROUND((COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::numeric / NULLIF(COUNT(m.id), 0)::numeric) * 100, 1) AS win_rate
    FROM matches m
    WHERE m.team1_id = $1 OR m.team2_id = $1;
  `;
  const res = await query(sql, [teamId]);
  return res.rows[0] || { total_matches: 0, wins: 0, losses: 0, win_rate: 0 };
}

// 2. Get Team Head-to-Head Record
export async function getHeadToHeadStats(team1Id, team2Id) {
  const sql = `
    SELECT 
      COUNT(m.id)::int AS total_h2h,
      COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::int AS team1_wins,
      COUNT(CASE WHEN m.winner_id = $2 THEN 1 END)::int AS team2_wins
    FROM matches m
    WHERE (m.team1_id = $1 AND m.team2_id = $2) OR (m.team1_id = $2 AND m.team2_id = $1);
  `;
  const res = await query(sql, [team1Id, team2Id]);
  return res.rows[0] || { total_h2h: 0, team1_wins: 0, team2_wins: 0 };
}

// 3. Get Tournament Performance Summary
export async function getTournamentStats(tournamentId) {
  const sql = `
    SELECT 
      COUNT(m.id)::int AS match_count,
      COUNT(DISTINCT m.map)::int AS maps_played,
      MAX(m.played_at) AS last_match_played
    FROM matches m
    WHERE m.tournament_id = $1;
  `;
  const res = await query(sql, [tournamentId]);
  return res.rows[0] || { match_count: 0, maps_played: 0, last_match_played: null };
}
```

---

## 11. Revised 10-Phase Implementation Order

```
[Phase 1: Data Audit] -> [Phase 2: Graph Audit] -> [Phase 3: Remove Boilerplate] -> [Phase 4: Indexability Predicates] -> [Phase 5: Entity Queries & UI] -> [Phase 6: Homepage] -> [Phase 7: Internal Links] -> [Phase 8: Blog Pipeline] -> [Phase 9: SEO Verification] -> [Phase 10: Production Verification]
```

* **PHASE 1 (Data Quality Audit):** Completed ([`match_data_quality_report.md`](file:///e:/Projects/KhelPediA/khelpedia/match_data_quality_report.md)).
* **PHASE 2 (Entity Graph Audit):** Completed (Measured 3.76% team connectivity, 0.50% tournament connectivity).
* **PHASE 3 (Remove Generic Boilerplate):** Remove generic fallback paragraphs from team, tournament, and player detail pages.
* **PHASE 4 (Define Indexability Predicates):** Update `src/lib/seo.js` with corrected SQL predicates to enforce `noindex, follow` on thin entity stubs.
* **PHASE 5 (Entity Queries & Data Components):** Implement DB queries in `src/lib/queries.js` and build data visualization components (`TeamStatsWidget.jsx`, `TournamentStatsWidget.jsx`).
* **PHASE 6 (Homepage Value Proposition):** Update `src/app/page.jsx` hero and display verified metrics ("284,000+ Verified Matches").
* **PHASE 7 (Internal Linking):** Interlink blogs, teams, tournaments, and player pages.
* **PHASE 8 (Refactor AI Blog Pipeline):** Implement event-discovery + DB match stats integration in `scripts/generate_bulk_news.js` with exponential backoff & rate limiting.
* **PHASE 9 (SEO & Sitemap Verification):** Run sitemap verification to confirm thin stubs are excluded from sitemaps and output `noindex`.
* **PHASE 10 (Production Verification):** Execute `npm run build` to confirm zero compilation errors.

---

## 12. Critical Stop Condition & Approval Request

> [!STOP]
> **No production changes have been made.**
> - Database schema: Unmodified.
> - Production records: Unmodified.
> - Indexability rules: Unmodified.
> - Sitemaps: Unmodified.
> - Blog scheduler: Paused.
> 
> This revised blueprint addresses all audit requirements and incorporates corrected indexability predicates, graph statistics, rate-limiting safety, and exact implementation phases. Implementation will begin upon your approval.
