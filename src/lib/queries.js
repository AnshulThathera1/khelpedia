import { query } from "./db";

// ======================== GAMES ========================
export async function getGames() {
  try {
    const res = await query('SELECT * FROM games ORDER BY name ASC');
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export async function getGameBySlug(slug) {
  try {
    const res = await query('SELECT * FROM games WHERE slug = $1 LIMIT 1', [slug]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error fetching game:", error);
    return null;
  }
}

// ======================== TOURNAMENTS ========================
export async function getTournaments(filters = {}) {
  const { page = 1, limit = 20, status, gameId, region, tier, paginate = false } = filters;
  
  try {
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }
    if (gameId) {
      whereConditions.push(`t.game_id = $${paramIndex++}`);
      params.push(gameId);
    }
    if (region) {
      whereConditions.push(`t.region = $${paramIndex++}`);
      params.push(region);
    }
    if (tier) {
      whereConditions.push(`t.tier = $${paramIndex++}`);
      params.push(tier);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    if (paginate) {
      const countRes = await query(`SELECT COUNT(*) FROM tournaments t ${whereClause}`, params);
      const totalCount = parseInt(countRes.rows[0].count, 10) || 0;

      const offset = (page - 1) * limit;
      const sql = `
        SELECT t.*, 
          json_build_object('name', g.name, 'slug', g.slug, 'icon_url', g.icon_url) AS games
        FROM tournaments t
        LEFT JOIN games g ON t.game_id = g.id
        ${whereClause}
        ORDER BY t.start_date DESC NULLS LAST
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      const dataRes = await query(sql, [...params, limit, offset]);

      return { tournaments: dataRes.rows || [], count: totalCount };
    }

    const sql = `
      SELECT t.*, 
        json_build_object('name', g.name, 'slug', g.slug, 'icon_url', g.icon_url) AS games
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g.id
      ${whereClause}
      ORDER BY t.start_date DESC NULLS LAST
    `;
    const res = await query(sql, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    if (paginate) return { tournaments: [], count: 0 };
    return [];
  }
}

export async function getTournamentById(id) {
  try {
    const sql = `
      SELECT t.*, 
        json_build_object('name', g.name, 'slug', g.slug, 'icon_url', g.icon_url) AS games
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g.id
      WHERE t.id = $1
      LIMIT 1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return null;
  }
}

export async function getTournamentTeams(tournamentId) {
  try {
    const sql = `
      WITH unified_teams AS (
        SELECT team_id, tournament_id, placement FROM tournament_teams WHERE tournament_id = $1
        UNION
        SELECT DISTINCT m.team1_id AS team_id, m.tournament_id, NULL::int AS placement 
        FROM matches m WHERE m.tournament_id = $1 AND m.team1_id IS NOT NULL
        UNION
        SELECT DISTINCT m.team2_id AS team_id, m.tournament_id, NULL::int AS placement 
        FROM matches m WHERE m.tournament_id = $1 AND m.team2_id IS NOT NULL
      )
      SELECT 
        ut.team_id,
        ut.tournament_id,
        ut.placement,
        json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url, 'region', tm.region, 'country', tm.country) AS teams
      FROM unified_teams ut
      JOIN teams tm ON ut.team_id = tm.id
      ORDER BY ut.placement ASC NULLS LAST, tm.name ASC
      LIMIT 24;
    `;
    const res = await query(sql, [tournamentId]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching tournament teams:", error);
    return [];
  }
}

export async function getTournamentMatches(tournamentId) {
  try {
    const sql = `
      SELECT m.*,
        json_build_object('name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('name', w.name, 'slug', w.slug) ELSE NULL END AS winner
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      WHERE m.tournament_id = $1
      ORDER BY m.played_at DESC NULLS LAST
    `;
    const res = await query(sql, [tournamentId]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

export async function getMatchesByGame(gameId, limit = 20) {
  try {
    const sql = `
      SELECT m.*,
        json_build_object('name', tr.name, 'slug', tr.slug, 'tier', tr.tier) AS tournament,
        json_build_object('name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('name', w.name, 'slug', w.slug) ELSE NULL END AS winner
      FROM matches m
      JOIN tournaments tr ON m.tournament_id = tr.id
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      WHERE tr.game_id = $1
      ORDER BY m.played_at DESC NULLS LAST
      LIMIT $2
    `;
    const res = await query(sql, [gameId, limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching matches by game:", error);
    return [];
  }
}

// ======================== PLAYERS ========================
export async function getPlayers(filters = {}) {
  const { page = 1, limit = 24, paginate = false, search, country, teamId } = filters;
  try {
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (teamId) {
      whereConditions.push(`p.team_id = $${paramIndex++}`);
      params.push(teamId);
    }
    if (country) {
      whereConditions.push(`p.country = $${paramIndex++}`);
      params.push(country);
    }
    if (search) {
      whereConditions.push(`(p.ign ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseSql = `
      SELECT p.*,
        CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url) ELSE NULL END AS teams
      FROM players p
      LEFT JOIN teams tm ON p.team_id = tm.id
      ${whereClause}
      ORDER BY p.earnings DESC NULLS LAST
    `;

    if (paginate) {
      const countRes = await query(`SELECT COUNT(*) FROM players p ${whereClause}`, params);
      const totalCount = parseInt(countRes.rows[0].count, 10) || 0;
      
      const offset = (page - 1) * limit;
      const sql = `${baseSql} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const dataRes = await query(sql, [...params, limit, offset]);
      
      return { players: dataRes.rows || [], count: totalCount };
    }

    const res = await query(baseSql, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

export async function getPlayerById(id) {
  try {
    const sql = `
      SELECT p.*,
        CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url, 'region', tm.region) ELSE NULL END AS teams
      FROM players p
      LEFT JOIN teams tm ON p.team_id = tm.id
      WHERE p.id = $1
      LIMIT 1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error fetching player:", error);
    return null;
  }
}

export async function getPlayerStats(playerId) {
  try {
    const sql = `
      SELECT ps.*,
        json_build_object('name', g.name, 'slug', g.slug, 'icon_url', g.icon_url) AS games
      FROM player_stats ps
      LEFT JOIN games g ON ps.game_id = g.id
      WHERE ps.player_id = $1
    `;
    const res = await query(sql, [playerId]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return [];
  }
}

// ======================== TEAMS ========================
export async function getTeams(filters = {}) {
  const { page = 1, limit = 24, paginate = false, search, region } = filters;
  try {
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (region) {
      whereConditions.push(`region = $${paramIndex++}`);
      params.push(region);
    }
    if (search) {
      whereConditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    if (paginate) {
      const countRes = await query(`SELECT COUNT(*) FROM teams ${whereClause}`, params);
      const totalCount = parseInt(countRes.rows[0].count, 10) || 0;
      
      const offset = (page - 1) * limit;
      const sql = `SELECT * FROM teams ${whereClause} ORDER BY name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const dataRes = await query(sql, [...params, limit, offset]);
      
      return { teams: dataRes.rows || [], count: totalCount };
    }

    const sql = `SELECT * FROM teams ${whereClause} ORDER BY name ASC`;
    const res = await query(sql, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function getTeamById(id) {
  try {
    const res = await query('SELECT * FROM teams WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

export async function getTeamPlayers(teamId) {
  try {
    const res = await query('SELECT * FROM players WHERE team_id = $1 ORDER BY ign ASC', [teamId]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching team players:", error);
    return [];
  }
}

export async function getTeamTournaments(teamId) {
  try {
    const sql = `
      WITH team_tourney_ids AS (
        SELECT tournament_id FROM tournament_teams WHERE team_id = $1
        UNION
        SELECT DISTINCT tournament_id FROM matches WHERE (team1_id = $1 OR team2_id = $1) AND tournament_id IS NOT NULL
      )
      SELECT 
        tr.id AS tournament_id,
        tr.name,
        tr.slug,
        tr.status,
        tr.prize_pool,
        tr.start_date,
        tr.end_date,
        tt.placement,
        json_build_object(
          'name', tr.name,
          'slug', tr.slug,
          'status', tr.status,
          'prize_pool', tr.prize_pool,
          'start_date', tr.start_date,
          'end_date', tr.end_date,
          'games', json_build_object('name', g.name, 'slug', g.slug)
        ) AS tournaments
      FROM team_tourney_ids tti
      JOIN tournaments tr ON tti.tournament_id = tr.id
      LEFT JOIN tournament_teams tt ON tt.tournament_id = tr.id AND tt.team_id = $1
      LEFT JOIN games g ON tr.game_id = g.id
      ORDER BY tr.start_date DESC NULLS LAST
      LIMIT 10;
    `;
    const res = await query(sql, [teamId]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching team tournaments:", error);
    return [];
  }
}

// ======================== STATS / COUNTS ========================
export async function getLiveTournaments() {
  return getTournaments({ status: "live" });
}

export async function getUpcomingTournaments() {
  return getTournaments({ status: "upcoming" });
}

export async function getTopPlayers(limit = 10) {
  try {
    const sql = `
      SELECT p.*,
        CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url) ELSE NULL END AS teams
      FROM players p
      LEFT JOIN teams tm ON p.team_id = tm.id
      ORDER BY p.earnings DESC NULLS LAST
      LIMIT $1
    `;
    const res = await query(sql, [limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching top players:", error);
    return [];
  }
}

export async function getSiteStats() {
  try {
    const [matchesRes, gamesRes, tournamentsRes, teamsRes] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM matches WHERE winner_id IS NOT NULL'),
      query('SELECT COUNT(*)::int AS count FROM games'),
      query('SELECT COUNT(DISTINCT tournament_id)::int AS count FROM matches WHERE tournament_id IS NOT NULL'),
      query('SELECT COUNT(DISTINCT team_id)::int AS count FROM (SELECT team1_id AS team_id FROM matches UNION SELECT team2_id AS team_id FROM matches) t WHERE team_id IS NOT NULL'),
    ]);
    return {
      matches: matchesRes.rows[0]?.count || 0,
      games: gamesRes.rows[0]?.count || 0,
      tournaments: tournamentsRes.rows[0]?.count || 0,
      teams: teamsRes.rows[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return { matches: 0, games: 0, tournaments: 0, teams: 0 };
  }
}

export async function searchAll(queryStr) {
  if (!queryStr) return { players: [], teams: [], news: [] };
  
  try {
    const searchTerm = `%${queryStr}%`;
    const [playersRes, teamsRes] = await Promise.all([
      query(
        'SELECT id, ign, name, image_url FROM players WHERE ign ILIKE $1 OR name ILIKE $1 LIMIT 5',
        [searchTerm]
      ),
      query(
        'SELECT id, name, logo_url FROM teams WHERE name ILIKE $1 LIMIT 5',
        [searchTerm]
      )
    ]);

    return {
      players: playersRes.rows || [],
      teams: teamsRes.rows || [],
      news: []
    };
  } catch (error) {
    console.error("Error in searchAll:", error);
    return { players: [], teams: [], news: [] };
  }
}

// ======================== BLOGS ========================
export async function getBlogs(filters = {}) {
  const { page = 1, limit = 12, paginate = false, search, category } = filters;
  try {
    const whereConditions = ['b.is_published = true'];
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`b.category = $${paramIndex++}`);
      params.push(category);
    }
    if (search) {
      whereConditions.push(`b.title ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const baseSql = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.created_at, b.author_id,
        CASE WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'display_name', p.display_name, 'avatar_url', p.avatar_url) ELSE NULL END AS profiles
      FROM blogs b
      LEFT JOIN profiles p ON b.author_id = p.id
      ${whereClause}
      ORDER BY b.created_at DESC
    `;

    if (paginate) {
      const countRes = await query(`SELECT COUNT(*) FROM blogs b ${whereClause}`, params);
      const totalCount = parseInt(countRes.rows[0].count, 10) || 0;
      
      const offset = (page - 1) * limit;
      const sql = `${baseSql} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const dataRes = await query(sql, [...params, limit, offset]);
      
      return { blogs: dataRes.rows || [], count: totalCount };
    }

    const res = await query(baseSql, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    if (paginate) return { blogs: [], count: 0 };
    return [];
  }
}

// ======================== VERIFIED STATISTICS HELPERS ========================

export async function getTeamPerformanceStats(teamId) {
  if (!teamId) return { total_matches: 0, wins: 0, losses: 0, unresolved_matches: 0, win_rate: 0, first_match: null, latest_match: null };
  try {
    const sql = `
      SELECT 
        COUNT(m.id)::int AS total_matches,
        COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::int AS wins,
        COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != $1 THEN 1 END)::int AS losses,
        COUNT(CASE WHEN m.winner_id IS NULL THEN 1 END)::int AS unresolved_matches,
        MIN(m.played_at) AS first_match,
        MAX(m.played_at) AS latest_match
      FROM matches m
      WHERE m.team1_id = $1 OR m.team2_id = $1;
    `;
    const res = await query(sql, [teamId]);
    const row = res.rows[0] || { total_matches: 0, wins: 0, losses: 0, unresolved_matches: 0, first_match: null, latest_match: null };
    const decidedMatches = row.wins + row.losses;
    const win_rate = decidedMatches > 0 ? parseFloat(((row.wins / decidedMatches) * 100).toFixed(1)) : 0;
    return { ...row, win_rate };
  } catch (error) {
    console.error("Error in getTeamPerformanceStats:", error);
    return { total_matches: 0, wins: 0, losses: 0, unresolved_matches: 0, win_rate: 0, first_match: null, latest_match: null };
  }
}

export async function getTeamOpponents(teamId, limit = 5) {
  if (!teamId) return [];
  try {
    const sql = `
      SELECT 
        opp.id,
        opp.name,
        opp.slug,
        opp.logo_url,
        opp.region,
        COUNT(m.id)::int AS matches_played,
        COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::int AS wins,
        COUNT(CASE WHEN m.winner_id = opp.id THEN 1 END)::int AS losses
      FROM matches m
      JOIN teams opp ON (opp.id = CASE WHEN m.team1_id = $1 THEN m.team2_id ELSE m.team1_id END)
      WHERE (m.team1_id = $1 OR m.team2_id = $1)
        AND opp.id IS NOT NULL
      GROUP BY opp.id, opp.name, opp.slug, opp.logo_url, opp.region
      ORDER BY COUNT(m.id) DESC
      LIMIT $2;
    `;
    const res = await query(sql, [teamId, limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error in getTeamOpponents:", error);
    return [];
  }
}

export async function getTeamRecentMatches(teamId, limit = 5) {
  if (!teamId) return [];
  try {
    const sql = `
      SELECT m.*,
        json_build_object('name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('name', w.name, 'slug', w.slug) ELSE NULL END AS winner,
        json_build_object('name', tr.name, 'slug', tr.slug) AS tournament
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      LEFT JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE m.team1_id = $1 OR m.team2_id = $1
      ORDER BY m.played_at DESC NULLS LAST
      LIMIT $2
    `;
    const res = await query(sql, [teamId, limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error in getTeamRecentMatches:", error);
    return [];
  }
}

export async function getHeadToHeadStats(team1Id, team2Id, beforeDate = null) {
  if (!team1Id || !team2Id) return { total_h2h: 0, team1_wins: 0, team2_wins: 0, unresolved: 0 };
  try {
    const whereConditions = [
      `((m.team1_id = $1 AND m.team2_id = $2) OR (m.team1_id = $2 AND m.team2_id = $1))`
    ];
    const params = [team1Id, team2Id];

    if (beforeDate) {
      whereConditions.push(`m.played_at < $3`);
      params.push(beforeDate);
    }

    const sql = `
      SELECT 
        COUNT(m.id)::int AS total_h2h,
        COUNT(CASE WHEN m.winner_id = $1 THEN 1 END)::int AS team1_wins,
        COUNT(CASE WHEN m.winner_id = $2 THEN 1 END)::int AS team2_wins,
        COUNT(CASE WHEN m.winner_id IS NULL THEN 1 END)::int AS unresolved
      FROM matches m
      WHERE ${whereConditions.join(' AND ')};
    `;
    const res = await query(sql, params);
    return res.rows[0] || { total_h2h: 0, team1_wins: 0, team2_wins: 0, unresolved: 0 };
  } catch (error) {
    console.error("Error in getHeadToHeadStats:", error);
    return { total_h2h: 0, team1_wins: 0, team2_wins: 0, unresolved: 0 };
  }
}

export async function getHeadToHeadRecentMatches(team1Id, team2Id, limit = 5, beforeDate = null) {
  if (!team1Id || !team2Id) return [];
  try {
    const whereConditions = [
      `((m.team1_id = $1 AND m.team2_id = $2) OR (m.team1_id = $2 AND m.team2_id = $1))`
    ];
    const params = [team1Id, team2Id, limit];

    if (beforeDate) {
      whereConditions.push(`m.played_at < $4`);
      params.push(beforeDate);
    }

    const sql = `
      SELECT m.*,
        json_build_object('name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('name', w.name, 'slug', w.slug) ELSE NULL END AS winner,
        json_build_object('name', tr.name, 'slug', tr.slug) AS tournament
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      LEFT JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY m.played_at DESC NULLS LAST
      LIMIT $3
    `;
    const res = await query(sql, params);
    return res.rows || [];
  } catch (error) {
    console.error("Error in getHeadToHeadRecentMatches:", error);
    return [];
  }
}

export async function getTournamentStats(tournamentId) {
  if (!tournamentId) return { match_count: 0, maps_played: 0, last_match_played: null };
  try {
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
  } catch (error) {
    console.error("Error in getTournamentStats:", error);
    return { match_count: 0, maps_played: 0, last_match_played: null };
  }
}

export async function getPlayerVerifiedStats(playerId) {
  if (!playerId) return null;
  try {
    const sql = `
      SELECT ps.*,
        json_build_object('name', g.name, 'slug', g.slug, 'icon_url', g.icon_url) AS games
      FROM player_stats ps
      LEFT JOIN games g ON ps.game_id = g.id
      WHERE ps.player_id = $1 AND ps.matches_played > 0
      LIMIT 1;
    `;
    const res = await query(sql, [playerId]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error in getPlayerVerifiedStats:", error);
    return null;
  }
}

export async function getMatchById(id) {
  if (!id) return null;
  try {
    const sql = `
      SELECT m.*,
        json_build_object('id', t1.id, 'name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('id', t2.id, 'name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('id', w.id, 'name', w.name, 'slug', w.slug) ELSE NULL END AS winner,
        json_build_object('id', tr.id, 'name', tr.name, 'slug', tr.slug, 'tier', tr.tier) AS tournament
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      LEFT JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE m.id = $1
      LIMIT 1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error in getMatchById:", error);
    return null;
  }
}

export async function getRecentMatches(limit = 5) {
  try {
    const sql = `
      SELECT m.*,
        json_build_object('id', t1.id, 'name', t1.name, 'slug', t1.slug, 'logo_url', t1.logo_url) AS team1,
        json_build_object('id', t2.id, 'name', t2.name, 'slug', t2.slug, 'logo_url', t2.logo_url) AS team2,
        CASE WHEN w.id IS NOT NULL THEN json_build_object('id', w.id, 'name', w.name, 'slug', w.slug) ELSE NULL END AS winner,
        json_build_object('id', tr.id, 'name', tr.name, 'slug', tr.slug) AS tournament
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      LEFT JOIN tournaments tr ON m.tournament_id = tr.id
      WHERE m.played_at IS NOT NULL
      ORDER BY m.played_at DESC
      LIMIT $1
    `;
    const res = await query(sql, [limit]);
    return res.rows || [];
  } catch (error) {
    console.error("Error in getRecentMatches:", error);
    return [];
  }
}

/**
 * Fetch dynamic maintenance mode state from shared PostgreSQL database
 */
export async function getMaintenanceStatus() {
  try {
    const res = await query(
      "SELECT value FROM system_settings WHERE key = 'maintenance' LIMIT 1"
    );
    if (res?.rows?.[0]?.value) {
      return res.rows[0].value;
    }
    return { enabled: false, message: "", showBannerOnly: false };
  } catch (error) {
    // Fail-open strategy: If database table is unreachable or blips, don't take down the site
    return { enabled: false, message: "", showBannerOnly: false };
  }
}



