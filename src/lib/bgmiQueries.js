import { query } from "./db.js";

const BGMI_GAME_ID = "01dae6b9-7e1a-4a70-a452-648e441e2ca2";
// Standard baseline conversion rate: 1 USD ~ 84 INR
const USD_TO_INR_RATE = 84;

/**
 * Fetch strictly verified BGMI data directly from PostgreSQL.
 * No fabricated fallback numbers or non-BGMI entities.
 */
export async function getBGMIPageData() {
  const result = {
    tournaments: [],
    upcomingTournaments: [],
    completedTournaments: [],
    liveTournaments: [],
    featuredTournament: null,
    teams: [],
    players: [],
    matches: [],
    blogs: [],
    stats: {
      totalTournaments: 0,
      totalMatches: 0,
      sTierEvents: 0,
      liveCount: 0,
      upcomingCount: 0,
      completedCount: 0,
      totalPrizePoolUSD: 0,
      totalPrizePoolINR: 0,
      totalTeams: 0,
      totalPlayers: 0,
    },
  };

  try {
    // 1. Fetch Tournaments for BGMI from PostgreSQL
    const tourneyQuery = `
      SELECT t.id, t.name, t.slug, t.tier, t.status, t.prize_pool, t.currency, t.region, t.format,
             t.start_date, t.end_date, t.logo_url, t.image_url, t.description
      FROM tournaments t
      WHERE t.game_id = $1
      ORDER BY t.start_date DESC
    `;
    const tourneysRes = await query(tourneyQuery, [BGMI_GAME_ID]).catch(() => ({ rows: [] }));
    const dbTournaments = tourneysRes.rows || [];

    result.tournaments = dbTournaments;
    result.liveTournaments = dbTournaments.filter((t) => t.status === "live");
    result.upcomingTournaments = dbTournaments.filter((t) => t.status === "upcoming");
    result.completedTournaments = dbTournaments.filter((t) => t.status === "completed");

    // Featured Tournament: Prefer live or highest tier (S or A), then first
    if (dbTournaments.length > 0) {
      result.featuredTournament =
        result.liveTournaments[0] ||
        dbTournaments.find((t) => t.tier === "S" || t.tier === "S-Tier") ||
        dbTournaments.find((t) => t.tier === "A" || t.tier === "A-Tier") ||
        dbTournaments[0];
    }

    // Compute Prize Pool & Tier counts strictly from DB
    let sumPrizeUSD = 0;
    let sTierCount = 0;
    dbTournaments.forEach((t) => {
      const prize = parseFloat(t.prize_pool) || 0;
      // All tournaments in DB are stored in USD
      if (t.currency === "INR") {
        sumPrizeUSD += prize / USD_TO_INR_RATE;
      } else {
        sumPrizeUSD += prize;
      }

      if (t.tier === "S" || t.tier === "S-Tier" || t.tier === "A" || t.tier === "A-Tier") {
        sTierCount++;
      }
    });

    result.stats.totalTournaments = dbTournaments.length;
    result.stats.liveCount = result.liveTournaments.length;
    result.stats.upcomingCount = result.upcomingTournaments.length;
    result.stats.completedCount = result.completedTournaments.length;
    result.stats.sTierEvents = sTierCount;
    result.stats.totalPrizePoolUSD = Math.round(sumPrizeUSD);
    result.stats.totalPrizePoolINR = Math.round(sumPrizeUSD * USD_TO_INR_RATE);

    // 2. Fetch Recent BGMI Matches from DB (Supports both 1v1 and Multi-Team Battle Royale)
    const matchesQuery = `
      SELECT m.id, m.tournament_id, m.team1_id, m.team2_id, m.score1, m.score2, m.winner_id,
             m.round, m.map, m.played_at,
             t1.name as team1_name, t1.logo_url as team1_logo,
             t2.name as team2_name, t2.logo_url as team2_logo,
             tourn.name as tournament_name,
             COALESCE(
               (SELECT json_agg(json_build_object(
                  'team_id', bmt.team_id,
                  'team_name', t_br.name,
                  'team_logo', t_br.logo_url,
                  'placement', bmt.placement,
                  'placement_points', bmt.placement_points,
                  'elimination_points', bmt.elimination_points,
                  'num_points', bmt.num_points,
                  'wwcd', bmt.wwcd
                ) ORDER BY bmt.placement ASC NULLS LAST)
                FROM bgmi_match_teams bmt
                JOIN teams t_br ON bmt.team_id = t_br.id
                WHERE bmt.match_id = m.id),
               '[]'::json
             ) as match_teams
      FROM matches m
      JOIN tournaments tourn ON m.tournament_id = tourn.id
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      WHERE tourn.game_id = $1
      ORDER BY m.played_at DESC
      LIMIT 12
    `;
    const matchesRes = await query(matchesQuery, [BGMI_GAME_ID]).catch(() => ({ rows: [] }));
    result.matches = matchesRes.rows || [];

    const totalMatchesCountRes = await query(
      `SELECT COUNT(*)::int as count FROM matches m JOIN tournaments tourn ON m.tournament_id = tourn.id WHERE tourn.game_id = $1`,
      [BGMI_GAME_ID]
    ).catch(() => ({ rows: [{ count: 0 }] }));
    result.stats.totalMatches = totalMatchesCountRes.rows[0]?.count || result.matches.length;

    // 2b. Fetch BGMI Stage Standings Leaderboards (When Available)
    const standingsQuery = `
      SELECT s.id, s.tournament_id, s.stage_name, s.team_id, s.rank_position,
             s.matches_played, s.wwcd_count, s.placement_pts, s.elimination_pts,
             s.total_pts, s.bonus_pts, s.tiebreaker_rule,
             t.name as team_name, t.logo_url as team_logo
      FROM bgmi_stage_standings s
      JOIN teams t ON s.team_id = t.id
      JOIN tournaments tourn ON s.tournament_id = tourn.id
      WHERE tourn.game_id = $1
      ORDER BY s.rank_position ASC
      LIMIT 16
    `;
    const standingsRes = await query(standingsQuery, [BGMI_GAME_ID]).catch(() => ({ rows: [] }));
    result.standings = standingsRes.rows || [];

    // 3. Fetch Legitimate BGMI Teams (Teams in BGMI tournament_teams or verified Indian BGMI teams)
    const teamsQuery = `
      SELECT DISTINCT t.id, t.name, t.slug, t.logo_url, t.region, t.country, t.description
      FROM teams t
      WHERE t.id IN (
        SELECT DISTINCT team_id FROM tournament_teams WHERE tournament_id IN (
          SELECT id FROM tournaments WHERE game_id = $1
        )
      )
      OR t.name IN ('Soul', 'GodLike Esports', 'Blind Esports', 'Entity Gaming', 'Team SouL')
      ORDER BY t.name ASC
      LIMIT 16
    `;
    const teamsRes = await query(teamsQuery, [BGMI_GAME_ID]).catch(() => ({ rows: [] }));
    result.teams = teamsRes.rows || [];
    result.stats.totalTeams = result.teams.length;

    // 4. Fetch Legitimate BGMI Players (Strictly affiliated with BGMI tournament teams or verified BGMI rosters)
    // NOTE: Explicitly excludes Valorant/other game players by filtering on BGMI teams
    const playersQuery = `
      SELECT p.id, p.name, p.ign, p.slug, p.country, p.role, p.image_url, p.earnings,
             t.name as team_name, t.logo_url as team_logo
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE t.id IN (
        SELECT DISTINCT team_id FROM tournament_teams WHERE tournament_id IN (
          SELECT id FROM tournaments WHERE game_id = $1
        )
      )
      OR p.ign IN ('MortaL', 'JoNy', 'Classy ff')
      ORDER BY p.earnings::numeric DESC
      LIMIT 12
    `;
    const playersRes = await query(playersQuery, [BGMI_GAME_ID]).catch(() => ({ rows: [] }));
    result.players = playersRes.rows || [];
    result.stats.totalPlayers = result.players.length;

    // 5. Fetch Genuine BGMI Editorial Blogs from DB
    const blogsQuery = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.created_at, b.category,
             CASE WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'display_name', p.display_name) ELSE NULL END AS profiles
      FROM blogs b
      LEFT JOIN profiles p ON b.author_id = p.id
      WHERE b.is_published = true AND (
        b.title ILIKE '%bgmi%' OR b.category ILIKE '%bgmi%' OR b.excerpt ILIKE '%bgmi%' OR b.title ILIKE '%battlegrounds%'
      )
      ORDER BY b.created_at DESC
      LIMIT 6
    `;
    const blogsRes = await query(blogsQuery).catch(() => ({ rows: [] }));
    result.blogs = blogsRes.rows || [];
  } catch (err) {
    console.error("Error in getBGMIPageData:", err);
  }

  return result;
}
