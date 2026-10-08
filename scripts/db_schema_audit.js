import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFullDbAudit() {
  try {
    console.log("==================================================");
    console.log("KHELPEDIA READ-ONLY DEEP DATABASE AUDIT");
    console.log("==================================================\n");

    // 1. Entity Counts
    const { count: matchesCount } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    const { count: tournamentsCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    const { count: teamsCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const { count: playersCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
    const { count: gamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
    const { count: blogsCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    const { count: playerStatsCount } = await supabase.from('player_stats').select('*', { count: 'exact', head: true });
    const { count: tournamentTeamsCount } = await supabase.from('tournament_teams').select('*', { count: 'exact', head: true });
    const { count: entityMappingCount } = await supabase.from('entity_source_mapping').select('*', { count: 'exact', head: true });

    console.log("--- CORE COUNTS ---");
    console.log(`Matches: ${matchesCount}`);
    console.log(`Tournaments: ${tournamentsCount}`);
    console.log(`Teams: ${teamsCount}`);
    console.log(`Players: ${playersCount}`);
    console.log(`Games: ${gamesCount}`);
    console.log(`Blogs: ${blogsCount}`);
    console.log(`Player Stats Records: ${playerStatsCount}`);
    console.log(`Tournament Teams Relations: ${tournamentTeamsCount}`);
    console.log(`Entity Source Mappings: ${entityMappingCount}`);

    // 2. Table Column Structure & Sample Rows
    const { data: sampleMatch } = await supabase.from('matches').select('*').limit(1);
    const { data: sampleTournament } = await supabase.from('tournaments').select('*').limit(1);
    const { data: sampleTeam } = await supabase.from('teams').select('*').limit(1);
    const { data: samplePlayer } = await supabase.from('players').select('*').limit(1);
    const { data: samplePlayerStats } = await supabase.from('player_stats').select('*').limit(1);
    const { data: sampleTournamentTeams } = await supabase.from('tournament_teams').select('*').limit(1);
    const { data: sampleMapping } = await supabase.from('entity_source_mapping').select('*').limit(1);

    console.log("\n--- AVAILABLE MATCH FIELDS ---", sampleMatch ? Object.keys(sampleMatch[0]) : []);
    console.log("--- AVAILABLE TOURNAMENT FIELDS ---", sampleTournament ? Object.keys(sampleTournament[0]) : []);
    console.log("--- AVAILABLE TEAM FIELDS ---", sampleTeam ? Object.keys(sampleTeam[0]) : []);
    console.log("--- AVAILABLE PLAYER FIELDS ---", samplePlayer ? Object.keys(samplePlayer[0]) : []);
    console.log("--- AVAILABLE PLAYER_STATS FIELDS ---", samplePlayerStats ? Object.keys(samplePlayerStats[0]) : []);
    console.log("--- AVAILABLE TOURNAMENT_TEAMS FIELDS ---", sampleTournamentTeams ? Object.keys(sampleTournamentTeams[0]) : []);
    console.log("--- AVAILABLE ENTITY MAPPING FIELDS ---", sampleMapping ? Object.keys(sampleMapping[0]) : []);

    // 3. Thin Page & Data Density Audit
    // Matches with score / winner
    const { count: matchesWithWinner } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('winner_id', 'is', null);
    const { count: matchesWithTeam1And2 } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('team1_id', 'is', null).not('team2_id', 'is', null);

    // Tournaments with 0 matches
    const { data: tournamentsWithMatches } = await supabase.from('matches').select('tournament_id');
    const uniqueTourneysInMatches = new Set(tournamentsWithMatches?.map(m => m.tournament_id).filter(Boolean));

    // Tournaments with 0 teams
    const { data: tournamentsWithTeams } = await supabase.from('tournament_teams').select('tournament_id');
    const uniqueTourneysInTeams = new Set(tournamentsWithTeams?.map(t => t.tournament_id).filter(Boolean));

    // Teams with 0 players
    const { data: playersWithTeam } = await supabase.from('players').select('team_id').not('team_id', 'is', null);
    const uniqueTeamsInPlayers = new Set(playersWithTeam?.map(p => p.team_id));

    // Teams in matches
    const { data: matchesTeams1 } = await supabase.from('matches').select('team1_id').not('team1_id', 'is', null);
    const { data: matchesTeams2 } = await supabase.from('matches').select('team2_id').not('team2_id', 'is', null);
    const uniqueTeamsInMatches = new Set([...(matchesTeams1?.map(m => m.team1_id) || []), ...(matchesTeams2?.map(m => m.team2_id) || [])]);

    console.log("\n--- DATA DENSITY ANALYSIS ---");
    console.log(`Matches with explicit winner_id: ${matchesWithWinner} / ${matchesCount}`);
    console.log(`Matches with both team1_id & team2_id: ${matchesWithTeam1And2} / ${matchesCount}`);
    console.log(`Tournaments with at least 1 match in DB: ${uniqueTourneysInMatches.size} / ${tournamentsCount}`);
    console.log(`Tournaments with at least 1 team in tournament_teams: ${uniqueTourneysInTeams.size} / ${tournamentsCount}`);
    console.log(`Tournaments with NO matches AND NO teams: ${tournamentsCount - new Set([...uniqueTourneysInMatches, ...uniqueTourneysInTeams]).size}`);
    
    console.log(`Teams with at least 1 player in DB: ${uniqueTeamsInPlayers.size} / ${teamsCount}`);
    console.log(`Teams with match history (in team1 or team2): ${uniqueTeamsInMatches.size} / ${teamsCount}`);
    console.log(`Teams with NO players AND NO matches: ${teamsCount - new Set([...uniqueTeamsInPlayers, ...uniqueTeamsInMatches]).size}`);

    process.exit(0);
  } catch (err) {
    console.error("Audit error:", err);
    process.exit(1);
  }
}

runFullDbAudit();
