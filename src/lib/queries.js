import { supabase } from "./supabase";

// ======================== GAMES ========================
export async function getGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("name");
  if (error) console.error("Error fetching games:", error);
  return data || [];
}

export async function getGameBySlug(slug) {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) console.error("Error fetching game:", error);
  return data;
}

// ======================== TOURNAMENTS ========================
export async function getTournaments(filters = {}) {
  let query = supabase
    .from("tournaments")
    .select("*, games(name, slug, icon_url)")
    .order("start_date", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.gameId) query = query.eq("game_id", filters.gameId);
  if (filters.region) query = query.eq("region", filters.region);

  const { data, error } = await query;
  if (error) console.error("Error fetching tournaments:", error);
  return data || [];
}

export async function getTournamentById(id) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*, games(name, slug, icon_url)")
    .eq("id", id)
    .single();
  if (error) console.error("Error fetching tournament:", error);
  return data;
}

export async function getTournamentTeams(tournamentId) {
  const { data, error } = await supabase
    .from("tournament_teams")
    .select("*, teams(name, slug, logo_url, region, country)")
    .eq("tournament_id", tournamentId)
    .order("placement", { ascending: true, nullsFirst: false });
  if (error) console.error("Error fetching tournament teams:", error);
  return data || [];
}

export async function getTournamentMatches(tournamentId) {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `*, 
      team1:teams!matches_team1_id_fkey(name, slug, logo_url),
      team2:teams!matches_team2_id_fkey(name, slug, logo_url),
      winner:teams!matches_winner_id_fkey(name, slug)`
    )
    .eq("tournament_id", tournamentId)
    .order("played_at", { ascending: false });
  if (error) console.error("Error fetching matches:", error);
  return data || [];
}

// ======================== PLAYERS ========================
export async function getPlayers(filters = {}) {
  let query = supabase
    .from("players")
    .select("*, teams(name, slug, logo_url)")
    .order("earnings", { ascending: false });

  if (filters.teamId) query = query.eq("team_id", filters.teamId);
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.search)
    query = query.or(
      `ign.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
    );

  const { data, error } = await query;
  if (error) console.error("Error fetching players:", error);
  return data || [];
}

export async function getPlayerById(id) {
  const { data, error } = await supabase
    .from("players")
    .select("*, teams(name, slug, logo_url, region)")
    .eq("id", id)
    .single();
  if (error) console.error("Error fetching player:", error);
  return data;
}

export async function getPlayerStats(playerId) {
  const { data, error } = await supabase
    .from("player_stats")
    .select("*, games(name, slug, icon_url)")
    .eq("player_id", playerId);
  if (error) console.error("Error fetching player stats:", error);
  return data || [];
}

// ======================== TEAMS ========================
export async function getTeams(filters = {}) {
  let query = supabase.from("teams").select("*").order("name");

  if (filters.region) query = query.eq("region", filters.region);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) console.error("Error fetching teams:", error);
  return data || [];
}

export async function getTeamById(id) {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("Error fetching team:", error);
  return data;
}

export async function getTeamPlayers(teamId) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("ign");
  if (error) console.error("Error fetching team players:", error);
  return data || [];
}

export async function getTeamTournaments(teamId) {
  const { data, error } = await supabase
    .from("tournament_teams")
    .select("*, tournaments(name, slug, status, prize_pool, start_date, end_date, games(name, slug))")
    .eq("team_id", teamId)
    .order("placement", { ascending: true, nullsFirst: false });
  if (error) console.error("Error fetching team tournaments:", error);
  return data || [];
}

// ======================== STATS / COUNTS ========================
export async function getLiveTournaments() {
  return getTournaments({ status: "live" });
}

export async function getUpcomingTournaments() {
  return getTournaments({ status: "upcoming" });
}

export async function getTopPlayers(limit = 10) {
  const { data, error } = await supabase
    .from("players")
    .select("*, teams(name, slug, logo_url)")
    .order("earnings", { ascending: false })
    .limit(limit);
  if (error) console.error("Error fetching top players:", error);
  return data || [];
}

export async function getSiteStats() {
  const [games, tournaments, players, teams] = await Promise.all([
    supabase.from("games").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
  ]);
  return {
    games: games.count || 0,
    tournaments: tournaments.count || 0,
    players: players.count || 0,
    teams: teams.count || 0,
  };
}
