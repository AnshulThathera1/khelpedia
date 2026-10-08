import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMatchAndGraphAudit() {
  console.log("==================================================");
  console.log("KHELPEDIA READ-ONLY MATCH QUALITY & GRAPH AUDIT");
  console.log("==================================================\n");

  // 1. MATCH QUALITY AUDIT
  const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true });
  const { count: matchesWithTeam1 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('team1_id', 'is', null);
  const { count: matchesWithTeam2 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('team2_id', 'is', null);
  const { count: matchesWithWinner } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('winner_id', 'is', null);
  const { count: matchesWithScores } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('score1', 'is', null).not('score2', 'is', null);
  const { count: matchesWithPlayedAt } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('played_at', 'is', null);
  const { count: matchesWithTournament } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('tournament_id', 'is', null);

  // Check valid Foreign Key references
  const { data: allTeams } = await supabase.from('teams').select('id');
  const validTeamIds = new Set(allTeams?.map(t => t.id) || []);

  const { data: allTournaments } = await supabase.from('tournaments').select('id, game_id');
  const validTournamentIds = new Set(allTournaments?.map(t => t.id) || []);
  const tourneyGameMap = new Map(allTournaments?.map(t => [t.id, t.game_id]) || []);

  // Fetch sample/all matches to inspect foreign key integrity, game IDs, and duplicate candidates
  // Batch fetch matches
  let orphanedTeamMatches = 0;
  let orphanedTournamentMatches = 0;
  let matchesWithValidGame = 0;

  console.log("Auditing match foreign keys and game associations in batches...");

  const pageSize = 50000;
  let page = 0;
  let hasMore = true;

  const matchKeyCounts = new Map(); // key: tournament_id + team1_id + team2_id + played_at
  let duplicateCandidateMatches = 0;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('matches')
      .select('id, tournament_id, team1_id, team2_id, winner_id, played_at, round, score1, score2')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching match batch:", error.message);
      break;
    }

    if (!batch || batch.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Processing batch ${page + 1} (${batch.length} rows)...`);

    for (const m of batch) {
      // Check orphaned team references
      const t1Valid = m.team1_id ? validTeamIds.has(m.team1_id) : false;
      const t2Valid = m.team2_id ? validTeamIds.has(m.team2_id) : false;
      if ((m.team1_id && !t1Valid) || (m.team2_id && !t2Valid)) {
        orphanedTeamMatches++;
      }

      // Check orphaned tournament reference
      const tourneyValid = m.tournament_id ? validTournamentIds.has(m.tournament_id) : false;
      if (m.tournament_id && !tourneyValid) {
        orphanedTournamentMatches++;
      }

      // Check game association through tournament
      if (m.tournament_id && tourneyGameMap.get(m.tournament_id)) {
        matchesWithValidGame++;
      }

      // Duplicate detection key
      if (m.tournament_id && m.team1_id && m.team2_id) {
        const key = `${m.tournament_id}_${m.team1_id}_${m.team2_id}_${m.played_at || m.round || 'stage'}`;
        const count = matchKeyCounts.get(key) || 0;
        if (count > 0) {
          duplicateCandidateMatches++;
        }
        matchKeyCounts.set(key, count + 1);
      }
    }

    page++;
    if (batch.length < pageSize) hasMore = false;
  }

  // 2. ENTITY GRAPH DENSITY AUDIT
  const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
  const { count: totalTournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
  const { count: totalPlayers } = await supabase.from('players').select('*', { count: 'exact', head: true });

  // Teams with matches
  const { data: mTeams1 } = await supabase.from('matches').select('team1_id').not('team1_id', 'is', null);
  const { data: mTeams2 } = await supabase.from('matches').select('team2_id').not('team2_id', 'is', null);
  const teamsWithMatches = new Set([...(mTeams1?.map(m => m.team1_id) || []), ...(mTeams2?.map(m => m.team2_id) || [])]);

  // Teams with players
  const { data: pTeams } = await supabase.from('players').select('team_id').not('team_id', 'is', null);
  const teamsWithPlayers = new Set(pTeams?.map(p => p.team_id));

  // Teams with tournaments
  const { data: ttTeams } = await supabase.from('tournament_teams').select('team_id').not('team_id', 'is', null);
  const teamsWithTournaments = new Set(ttTeams?.map(t => t.team_id));

  // Tournaments with matches
  const { data: mTourneys } = await supabase.from('matches').select('tournament_id').not('tournament_id', 'is', null);
  const tourneysWithMatches = new Set(mTourneys?.map(m => m.tournament_id));

  // Tournaments with teams
  const { data: ttTourneys } = await supabase.from('tournament_teams').select('tournament_id').not('tournament_id', 'is', null);
  const tourneysWithTeams = new Set(ttTourneys?.map(t => t.tournament_id));

  // Players with matches (via player_stats or team match history)
  const { data: psPlayers } = await supabase.from('player_stats').select('player_id').gt('matches_played', 0);
  const playersWithStats = new Set(psPlayers?.map(ps => ps.player_id));

  // Players with teams
  const { data: playersList } = await supabase.from('players').select('id, team_id');
  const playersWithTeams = new Set(playersList?.filter(p => p.team_id).map(p => p.id));

  // Players with tournament history (player's team is in tournament_teams)
  const playerTeamMap = new Map(playersList?.filter(p => p.team_id).map(p => [p.id, p.team_id]));
  let playersWithTourneyHistory = 0;
  for (const p of playersList || []) {
    if (p.team_id && teamsWithTournaments.has(p.team_id)) {
      playersWithTourneyHistory++;
    }
  }

  console.log("\n==================================================");
  console.log("                  AUDIT RESULTS                   ");
  console.log("==================================================");
  
  console.log("\n--- 1. MATCH QUALITY AUDIT RESULTS ---");
  console.log(`Total Match Rows:                  ${totalMatches}`);
  console.log(`Rows with valid team1_id:          ${matchesWithTeam1} (${((matchesWithTeam1/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid team2_id:          ${matchesWithTeam2} (${((matchesWithTeam2/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid winner_id:         ${matchesWithWinner} (${((matchesWithWinner/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid scores:            ${matchesWithScores} (${((matchesWithScores/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid played_at:         ${matchesWithPlayedAt} (${((matchesWithPlayedAt/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid tournament_id:     ${matchesWithTournament} (${((matchesWithTournament/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Rows with valid Game (via Tourney):${matchesWithValidGame} (${((matchesWithValidGame/totalMatches)*100).toFixed(2)}%)`);
  console.log(`Orphaned Team Matches:             ${orphanedTeamMatches}`);
  console.log(`Orphaned Tournament Matches:       ${orphanedTournamentMatches}`);
  console.log(`Duplicate Candidate Matches:       ${duplicateCandidateMatches}`);

  console.log("\n--- 2. ENTITY GRAPH DENSITY RESULTS ---");
  console.log(`Total Teams: ${totalTeams}`);
  console.log(`- Teams with matches:              ${teamsWithMatches.size} (${((teamsWithMatches.size/totalTeams)*100).toFixed(2)}%)`);
  console.log(`- Teams with players:              ${teamsWithPlayers.size} (${((teamsWithPlayers.size/totalTeams)*100).toFixed(2)}%)`);
  console.log(`- Teams with tournaments:          ${teamsWithTournaments.size} (${((teamsWithTournaments.size/totalTeams)*100).toFixed(2)}%)`);

  console.log(`\nTotal Tournaments: ${totalTournaments}`);
  console.log(`- Tournaments with matches:        ${tourneysWithMatches.size} (${((tourneysWithMatches.size/totalTournaments)*100).toFixed(2)}%)`);
  console.log(`- Tournaments with teams:          ${tourneysWithTeams.size} (${((tourneysWithTeams.size/totalTournaments)*100).toFixed(2)}%)`);

  console.log(`\nTotal Players: ${totalPlayers}`);
  console.log(`- Players with matches/stats:      ${playersWithStats.size} (${((playersWithStats.size/totalPlayers)*100).toFixed(2)}%)`);
  console.log(`- Players with teams:              ${playersWithTeams.size} (${((playersWithTeams.size/totalPlayers)*100).toFixed(2)}%)`);
  console.log(`- Players with tournament history: ${playersWithTourneyHistory} (${((playersWithTourneyHistory/totalPlayers)*100).toFixed(2)}%)`);

  process.exit(0);
}

runMatchAndGraphAudit();
