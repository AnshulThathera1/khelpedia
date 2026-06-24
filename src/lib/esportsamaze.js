const API_BASE_URL = "https://esportsamaze.in/api.php";

/**
 * Helper to fetch data from MediaWiki Cargo API
 * @param {string} tables - Comma-separated list of tables
 * @param {string} fields - Comma-separated list of fields
 * @param {object} options - Additional options like limit, where, order_by
 * @returns {Promise<Array>} Array of results
 */
export async function fetchCargoData(tables, fields, options = {}) {
  const { limit = 50, where = "", order_by = "" } = options;
  
  const params = new URLSearchParams({
    action: "cargoquery",
    format: "json",
    tables,
    fields,
    limit: limit.toString()
  });

  if (where) params.append("where", where);
  if (order_by) params.append("order_by", order_by);

  // Use fetch with Next.js revalidation (cache for 1 hour)
  try {
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Cargo API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Cargo API Error:", data.error);
      return [];
    }

    if (!data.cargoquery) {
      return [];
    }

    // Map over results to extract 'title' object from each row
    return data.cargoquery.map(row => row.title);
  } catch (error) {
    console.error("fetchCargoData error:", error);
    return [];
  }
}

/**
 * Fetch BGMI Tournaments
 */
export async function getBGMITournaments(limit = 20) {
  return fetchCargoData(
    "Tournaments",
    "name, tier, prize_pool, start_date, end_date, winner, location, venue, image, image_dark",
    {
      limit,
      where: "game='BGMI'",
      order_by: "start_date DESC"
    }
  );
}

/**
 * Fetch Top BGMI Teams
 */
export async function getBGMITeams(limit = 20) {
  return fetchCargoData(
    "Teams",
    "name, image, image_dark, country, status, sponsors",
    { limit, where: "game='BGMI'" }
  );
}

/**
 * Fetch Top BGMI Players
 */
export async function getBGMIPlayers(limit = 20) {
  return fetchCargoData(
    "Players",
    "id, real_name, image, current_team, nationality, role, status",
    { limit, where: "game='BGMI'" }
  );
}

/**
 * Fetch specific Tournament Details
 * @param {string} name - Tournament name
 */
export async function getTournamentDetails(name) {
  const data = await fetchCargoData(
    "Tournaments",
    "name, series, tier, type, organizer, sponsor, game, prize_pool, start_date, end_date, location, venue, winner, runner_up, image",
    { limit: 1, where: `name="${name}"` }
  );
  return data[0] || null;
}

/**
 * Fetch Tournament Teams
 * @param {string} tournamentName 
 */
export async function getTournamentTeams(tournamentName) {
  return fetchCargoData(
    "Tournament_Teams",
    "tournament, team, display_name, image, image_dark, seeding, p1, p2, p3, p4, p5, p6, coach, analyst",
    { limit: 100, where: `tournament="${tournamentName}"`, order_by: "team ASC" }
  );
}

/**
 * Fetch Tournament Standings
 * @param {string} tournamentName 
 */
export async function getTournamentStandings(tournamentName) {
  return fetchCargoData(
    "StageStandings",
    "tournament, stage, groupname, team, matchesplayed, wwcd, placepts, elimpts, totalpts, lastmatchrank, result",
    { limit: 300, where: `tournament="${tournamentName}"`, order_by: "stage ASC, totalpts DESC" }
  );
}

/**
 * Fetch Tournament Schedule
 * @param {string} tournamentName 
 */
export async function getTournamentSchedule(tournamentName) {
  return fetchCargoData(
    "Tournament_Schedule",
    "tournament, game, match_type, date, stage, stream, day_data",
    { limit: 100, where: `tournament="${tournamentName}"`, order_by: "date ASC" }
  );
}
