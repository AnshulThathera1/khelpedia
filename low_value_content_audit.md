# KhelPediA Low-Value Content Audit

**Target Site:** KhelPediA (https://khelpedia.org)  
**Audit Date:** September 28, 2026  
**Audited By:** Antigravity AI Engineering & SEO Quality Team  
**Objective:** Complete evaluation of indexable routes, database content depth, template repetition, and user value metrics to remediate Google AdSense "Low-Value Content" rejection.

---

## Executive Summary of Audit Findings

| Page Type | Total DB Entities | Indexability Policy | Unique Text Depth | Template / Thin Score | Primary Value Source | Remediation Required |
|---|---|---|---|---|---|---|
| **Homepage (`/`)** | N/A | Index | Medium (~250 words) | Low | Platform overview & top lists | Expand unique value proposition & dynamic stats |
| **Games Hub (`/games`)** | 6 Games | Index | Low (~100 words) | High | Basic game cards | Add meta summary, active tournament counters & game comparisons |
| **Game Detail (`/games/[slug]`)** | 6 Pages | Index | Low-Medium (~150 words) | Medium | Tournament/Team filters | Add game-specific meta breakdown, rule overviews & historical stats |
| **Tournaments Index (`/tournaments`)** | 2,018 Items | Index | Low (~100 words) | High | Filtered list | Add tournament tier explanations & season highlights |
| **Tournament Detail (`/tournaments/[id]`)** | 2,018 Pages | Index (if >50 char ed or teams+matches) | Medium (~300 words, fallback-heavy) | High | Match schedule & participating teams | Replace generic fallbacks with data-driven statistical summaries & match breakdowns |
| **Teams Index (`/teams`)** | 1,517 Items | Index | Low (~80 words) | High | Team search list | Add regional tier lists & win-rate leaderboards |
| **Team Detail (`/teams/[id]`)** | 1,517 Pages | Index (if >50 char ed or players+tourneys) | Medium (~200 words, fallback-heavy) | High | Active roster & tournament history | Integrate win/loss metrics, head-to-head records & roster change timelines |
| **Players Index (`/players`)** | 18 Items | Index | Low (~80 words) | High | Leaderboard table | Expand player roster database & add cross-game earnings statistics |
| **Player Profile (`/players/[slug]`)** | 18 Pages | Index (all with valid `ign`) | Low-Medium (~150 words) | High (if missing stats) | Player stats & roster link | Set `noindex` for players without team/stats; expand real player career summaries |
| **Blogs Index (`/blogs`)** | 119 Articles | Index | Medium (~150 words header) | Low | Editorial list | Add category filters, featured editorial picks & topic clusters |
| **Blog Detail (`/blogs/[slug]`)** | 119 Articles | Index | High (800-1500 words) | Medium (RSS rewrites) | AI-generated RSS articles | Shift AI from RSS rewriter to internal database analyst; add data callouts & verified sources |
| **Search & Discovery (`/sitemap`, modal)** | N/A | Noindex (search), Index (sitemap) | Low | High | Search modal | Enhance multi-entity search results with rich stats previews |
| **Trust & Legal Pages (`/about`, `/contact`, `/privacy-policy`, etc.)** | N/A | Index | High (Static unique text) | Low | Corporate & E-E-A-T | Enhance Editorial & Author transparency sections |

---

## Detailed Page-by-Page Audit

### 1. Homepage (`/`)
- **Unique Textual Content:** ~250 words explaining KhelPediA's name origin ("Khel" + "Pedia") and high-level mission.
- **Database/Template-Generated:** Hero banner, Live Tournaments grid, Featured Tournaments grid, Latest News carousel, Editor's Picks, Top Titles, Site Stats counter, World Rankings, and Full Calendar.
- **External Data Sourcing:** Aggregated match and tournament data from PandaScore, OpenDota, Liquipedia, and eSportsAmaze.
- **Functionality Provided:** Central portal for esports live score monitoring, game navigation, news discovery, and statistical overview.
- **Unique Value to KhelPediA:** Cross-game aggregation (Valorant, CS2, BGMI, PUBG Mobile, Free Fire, Dota 2) and South Asian esports context ("Khel").
- **Thinness / Duplicate Evaluation:** Low thinness. The homepage has solid structural components but requires a sharper value proposition above the fold.
- **Recommendation:** Expand user value proposition. Clearly explain what data KhelPediA offers that single-source sites lack (cross-source historical match archive, team/player relationships across events).

---

### 2. Games Index & Game Detail Pages (`/games`, `/games/[slug]`)
- **Unique Textual Content:** Minimal (~100–150 words per game detail page).
- **Database/Template-Generated:** Game cards, match feed, team list, tournament schedule, map list, and agent roster (for Valorant).
- **External Data Sourcing:** Game logos, agent names, map pools, official match results.
- **Functionality Provided:** Filters tournaments and matches by game title; presents game-specific leaderboards and sub-pages.
- **Unique Value to KhelPediA:** Structured hub linking tournaments, teams, and players under unified title categories.
- **Thinness / Duplicate Evaluation:** Moderate thinness. Pages with few matches or teams rely on basic template layouts.
- **Recommendation:** Add custom game overviews, active competitive circuit breakdowns, current meta summaries, and top team performance tables per game.

---

### 3. Tournaments Index & Tournament Detail Pages (`/tournaments`, `/tournaments/[id]`)
- **Unique Textual Content:** Tournament details use a standard boilerplate text template when `editorial_content` is null (which is true for 2,013 out of 2,018 tournaments).
- **Database/Template-Generated:** Prize pool, date ranges, region badges, participating teams grid, recent matches table, and related articles list.
- **External Data Sourcing:** PandaScore / Liquipedia / eSportsAmaze match results and team brackets.
- **Functionality Provided:** Displays tournament prize money, match scores, head-to-head match results, and participating rosters.
- **Unique Value to KhelPediA:** Aggregated match history (297,884 matches across 2,018 tournaments) with structured links to teams and players.
- **Thinness / Duplicate Evaluation:** **HIGH DUP-RISK.** Because 2,013 out of 2,018 tournament pages use nearly identical fallback sentences ("...is a premier Valorant tournament held in..."), search engines detect hundreds of template-generated duplicate pages.
- **Recommendation:**
  1. Replace generic boilerplate fallbacks with dynamic, data-driven match statistical summaries (e.g., total maps played, win/loss margin distribution, top performing teams).
  2. Strict indexability rule: Apply `noindex` to tournaments with 0 matches and 0 participating teams.

---

### 4. Teams Index & Team Detail Pages (`/teams`, `/teams/[id]`)
- **Unique Textual Content:** 1,516 out of 1,517 teams lack custom editorial content, relying on a 3-paragraph fallback template.
- **Database/Template-Generated:** Team logo, region, establishment year, active roster cards, recent tournament placement list.
- **External Data Sourcing:** External team profiles, roster listings, match outcomes.
- **Functionality Provided:** Displays current active roster, player profiles, and historical tournament placements.
- **Unique Value to KhelPediA:** Links individual players to team rosters and historical tournament performances across multiple years.
- **Thinness / Duplicate Evaluation:** **HIGH DUP-RISK.** 1,516 team pages share the exact same template text format ("...is a competitive esports organization operating in...").
- **Recommendation:**
  1. Replace static text fallbacks with data-backed team analytics (calculated win rate %, total tournaments attended, placement history breakdown, most frequent opponents).
  2. Apply `noindex, follow` to teams with empty rosters AND zero match history.

---

### 5. Players Index & Player Profiles (`/players`, `/players/[slug]`)
- **Unique Textual Content:** Currently, 0 out of 18 players have custom editorial content. Profile pages feature a generic "Career Overview" paragraph built from database fields.
- **Database/Template-Generated:** IGN, real name, avatar, country flag, team badge, earnings, K/D ratio grid, win rate, headshot %, average damage, and player details sidebar.
- **External Data Sourcing:** Verified player statistics from OpenDota / PandaScore / Liquipedia.
- **Functionality Provided:** Performance statistics breakdown (K/D ratio, headshot %, win rate, earnings) and team membership details.
- **Unique Value to KhelPediA:** Centralized player card linking stats across multiple games and historical team rosters.
- **Thinness / Duplicate Evaluation:** High thinness if a player record lacks match stats or team affiliation.
- **Recommendation:**
  1. Strict indexability rule: Only index player profiles that have linked match statistics or active team affiliation. Apply `noindex` to bare player records.
  2. Expand real player profiles with verified career milestones and statistical form trends.

---

### 6. Blogs Index & Blog Detail Pages (`/blogs`, `/blogs/[slug]`)
- **Unique Textual Content:** 119 published articles. Articles range from 800 to 1,500 words.
- **Database/Template-Generated:** Blog grid, category badges, author profile card, related articles component, view counter, social share buttons.
- **External Data Sourcing:** Content pipeline currently pulls RSS feeds from `vlr.gg` and uses Gemini AI to rewrite news stories.
- **Functionality Provided:** Esports news, match analysis, tournament previews, and meta guides.
- **Unique Value to KhelPediA:** Editorial context bridging database statistics with esports storytelling.
- **Thinness / Duplicate Evaluation:** **CRITICAL RISK AREA.** Simple AI rewriting of external RSS feeds without internal database integration directly triggers Google's "Low-Value Content" policy.
- **Recommendation:**
  1. Overhaul the blog pipeline: Discontinue simple RSS rewrites. Use KhelPediA's internal database (matches, head-to-head records, player K/D trends) as the primary data source for AI-assisted analytical articles.
  2. Add verified source attribution, database entity deep-links, and structured author bios to establish E-E-A-T.

---

### 7. Search, Discovery & Sitemaps (`/sitemap`, `/sitemap.xml`, search modal)
- **Unique Textual Content:** HTML sitemap index page and dynamic XML sitemaps.
- **Database/Template-Generated:** Automated XML routes based on database queries (`TEAM_INDEXABLE_SQL`, `TOURNAMENT_INDEXABLE_SQL`, etc.).
- **Functionality Provided:** Search modal for quick entity lookup (players, teams) and search engine crawling maps.
- **Thinness / Duplicate Evaluation:** XML sitemaps previously included thin entities due to weak threshold SQL rules.
- **Recommendation:** Tighten SQL indexability rules in `@/lib/seo.js` so that sitemaps only contain high-value, data-rich entity pages.

---

### 8. Trust & Policy Pages (`/about`, `/contact`, `/privacy-policy`, `/terms`, `/editorial-policy`, `/corrections-policy`, `/cookie-policy`, `/disclaimer`)
- **Unique Textual Content:** High. Static, custom-written policy and transparency pages.
- **Database/Template-Generated:** Static pages.
- **Functionality Provided:** Contact form, policy documentation, editorial standards, corrections workflow.
- **Unique Value to KhelPediA:** Establishes organizational legitimacy, editorial integrity, and user trust.
- **Thinness / Duplicate Evaluation:** Low thinness. High trust value.
- **Recommendation:** Maintain indexing; ensure author and editorial standards explicitly cross-reference the Editorial Policy page.
