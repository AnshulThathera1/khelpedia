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
      SELECT tt.*, 
        json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url, 'region', tm.region, 'country', tm.country) AS teams
      FROM tournament_teams tt
      LEFT JOIN teams tm ON tt.team_id = tm.id
      WHERE tt.tournament_id = $1
      ORDER BY tt.placement ASC NULLS LAST
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
  try {
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.teamId) {
      whereConditions.push(`p.team_id = $${paramIndex++}`);
      params.push(filters.teamId);
    }
    if (filters.country) {
      whereConditions.push(`p.country = $${paramIndex++}`);
      params.push(filters.country);
    }
    if (filters.search) {
      whereConditions.push(`(p.ign ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT p.*,
        CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'slug', tm.slug, 'logo_url', tm.logo_url) ELSE NULL END AS teams
      FROM players p
      LEFT JOIN teams tm ON p.team_id = tm.id
      ${whereClause}
      ORDER BY p.earnings DESC NULLS LAST
    `;
    const res = await query(sql, params);
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
  try {
    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (filters.region) {
      whereConditions.push(`region = $${paramIndex++}`);
      params.push(filters.region);
    }
    if (filters.search) {
      whereConditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${filters.search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
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
      SELECT tt.*,
        json_build_object(
          'name', tr.name,
          'slug', tr.slug,
          'status', tr.status,
          'prize_pool', tr.prize_pool,
          'start_date', tr.start_date,
          'end_date', tr.end_date,
          'games', json_build_object('name', g.name, 'slug', g.slug)
        ) AS tournaments
      FROM tournament_teams tt
      LEFT JOIN tournaments tr ON tt.tournament_id = tr.id
      LEFT JOIN games g ON tr.game_id = g.id
      WHERE tt.team_id = $1
      ORDER BY tt.placement ASC NULLS LAST
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
    const [games, tournaments, players, teams] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM games'),
      query('SELECT COUNT(*)::int AS count FROM tournaments'),
      query('SELECT COUNT(*)::int AS count FROM players'),
      query('SELECT COUNT(*)::int AS count FROM teams'),
    ]);
    return {
      games: games.rows[0]?.count || 0,
      tournaments: tournaments.rows[0]?.count || 0,
      players: players.rows[0]?.count || 0,
      teams: teams.rows[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return { games: 0, tournaments: 0, players: 0, teams: 0 };
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
