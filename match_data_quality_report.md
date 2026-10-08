# KhelPediA Match Data Quality & Entity Graph Audit Report

**Audit Type:** Read-Only Empirical Database Inspection  
**Target:** Production Supabase Database  
**Date:** September 28, 2026  
**Status:** Completed  

---

## Executive Summary

A comprehensive read-only audit of all **297,884 match records** and related entity relationships (`tournaments`, `teams`, `players`, `games`) was performed to evaluate data integrity, structural completeness, and entity graph density.

The findings confirm that while a large volume of raw match rows exists (297,884 rows), **the entity graph is heavily sparse**:
1. **296,884 matches** (99.66%) belong to tournament records where `game_id` is currently `NULL`.
2. **2,008 out of 2,018 tournaments** (99.50%) have 0 linked matches.
3. **1,460 out of 1,517 teams** (96.24%) have 0 linked match records.
4. **581 matches** (0.20%) contain orphaned `team_id` references.
5. **658 matches** (0.22%) are duplicate candidates with identical tournament, team pairing, and schedule keys.

---

## 1. Match Data Quality Audit

| Metric / Dimension | Raw Row Count | Valid / Complete Count | Percentage (%) | Integrity Status & Notes |
|---|---|---|---|---|
| **Total Match Rows** | 297,884 | 297,884 | 100.00% | Base table size. |
| **Valid `team1_id`** | 297,884 | 297,884 | 100.00% | All rows specify a Team 1 identifier. |
| **Valid `team2_id`** | 297,884 | 297,884 | 100.00% | All rows specify a Team 2 identifier. |
| **Valid `winner_id`** | 297,884 | 284,309 | 95.44% | 13,575 matches lack an explicit winner (draws/unresolved). |
| **Valid Scores (`score1`/`score2`)**| 297,884 | 297,884 | 100.00% | All rows contain valid numeric score fields. |
| **Valid `played_at` Timestamp** | 297,884 | 297,846 | 99.99% | 38 matches lack timestamps. |
| **Valid `tournament_id`** | 297,884 | 297,884 | 100.00% | All matches reference a tournament record. |
| **Linked Game (`game_id`)** | 297,884 | 1,000 | **0.34%** | **99.66% of matches belong to tournaments where `game_id = NULL`.** |
| **Orphaned Team FK References** | 297,884 | 581 | 0.20% | 581 rows reference team IDs missing from `teams`. |
| **Orphaned Tournament References**| 297,884 | 0 | 0.00% | 0 orphaned tournament IDs. |
| **Duplicate Candidate Matches** | 297,884 | 658 | 0.22% | 658 rows share identical (tournament, team1, team2, time/round) keys. |

---

## 2. Entity Graph Density Audit

The audit measured actual entity connectivity across the database graph:

```
+-----------------------------------------------------------------------------------+
|                            KHELPEDIA ENTITY GRAPH DENSITY                         |
+-----------------------------------------------------------------------------------+
| TEAMS (1,517 total):                                                              |
|   - Teams with match history:              57 teams  (3.76%)                      |
|   - Teams with active players:             13 teams  (0.86%)                      |
|   - Teams with tournament records:         13 teams  (0.86%)                      |
|   - Disconnected / Stub Teams:          1,460 teams (96.24%)                      |
|                                                                                   |
| TOURNAMENTS (2,018 total):                                                        |
|   - Tournaments with linked matches:       10 tourneys (0.50%)                    |
|   - Tournaments with linked teams:          4 tourneys (0.20%)                    |
|   - Disconnected / Stub Tournaments:    2,008 tourneys (99.50%)                   |
|                                                                                   |
| PLAYERS (18 total):                                                               |
|   - Players with match stats:              15 players (83.33%)                    |
|   - Players with team affiliations:        15 players (83.33%)                    |
|   - Players with tournament history:       14 players (77.78%)                    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Impact on Remediation & SEO

1. **Homepage Metric Accuracy:** KhelPediA cannot honestly market *"297,884 Verified Esports Matches"* until the 296,884 matches lacking `game_id` associations are mapped to their proper titles. The verified homepage metric must be clearly designated as **"284,000+ Tracked Match Results"**.
2. **Indexability Rule Imperative:** Because 2,008 tournaments and 1,460 teams are disconnected stubs, setting `noindex, follow` on thin entity pages is **essential** to prevent search engines from crawling thousands of empty template pages.
3. **No Artificial Data Generation:** Component UI rendering must check for real match/stat rows before displaying win/loss or H2H cards. Empty sections will not be rendered.
