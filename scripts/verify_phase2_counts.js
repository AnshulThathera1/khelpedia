import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPhase2IndexabilityAudit() {
  console.log("==================================================");
  console.log("PHASE 2 READ-ONLY INDEXABILITY SQL AUDIT");
  console.log("==================================================\n");

  // Total counts
  const { count: totalTournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
  const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
  const { count: totalPlayers } = await supabase.from('players').select('*', { count: 'exact', head: true });
  const { count: totalBlogs } = await supabase.from('blogs').select('*', { count: 'exact', head: true });

  // Fetch entity records to evaluate Phase 2 indexability predicates
  const { data: tournaments } = await supabase.from('tournaments').select('id, name, editorial_content');
  const { data: teams } = await supabase.from('teams').select('id, name, editorial_content');
  const { data: players } = await supabase.from('players').select('id, ign, editorial_content, team_id');
  const { data: playerStats } = await supabase.from('player_stats').select('player_id, matches_played');
  const { data: tournamentTeams } = await supabase.from('tournament_teams').select('tournament_id, team_id');

  // Batch fetch matches to count per tournament and per team
  const tourneyMatchCountMap = new Map();
  const teamMatchCountMap = new Map();

  const pageSize = 50000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('matches')
      .select('id, tournament_id, team1_id, team2_id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error || !batch || batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const m of batch) {
      if (m.tournament_id) tourneyMatchCountMap.set(m.tournament_id, (tourneyMatchCountMap.get(m.tournament_id) || 0) + 1);
      if (m.team1_id) teamMatchCountMap.set(m.team1_id, (teamMatchCountMap.get(m.team1_id) || 0) + 1);
      if (m.team2_id) teamMatchCountMap.set(m.team2_id, (teamMatchCountMap.get(m.team2_id) || 0) + 1);
    }

    page++;
    if (batch.length < pageSize) hasMore = false;
  }

  // Compute maps & sets
  const playerStatsMap = new Map();
  for (const ps of playerStats || []) {
    playerStatsMap.set(ps.player_id, (playerStatsMap.get(ps.player_id) || 0) + (ps.matches_played || 0));
  }

  const tourneyTeamsSet = new Set(tournamentTeams?.map(tt => tt.tournament_id) || []);
  const teamPlayersSet = new Set(players?.filter(p => p.team_id).map(p => p.team_id) || []);

  // Evaluate indexable counts according to PHASE 2 SQL PREDICATES:
  // Tournament: editorial_content > 100 OR (participating teams AND matches >= 2)
  let indexableTournaments = 0;
  let noindexTournaments = 0;
  for (const t of tournaments || []) {
    const edLen = t.editorial_content ? t.editorial_content.trim().length : 0;
    const hasTeams = tourneyTeamsSet.has(t.id);
    const mCount = tourneyMatchCountMap.get(t.id) || 0;

    if (edLen > 100 || (hasTeams && mCount >= 2)) {
      indexableTournaments++;
    } else {
      noindexTournaments++;
    }
  }

  // Team: editorial_content > 100 OR (has players AND matches >= 3)
  let indexableTeams = 0;
  let noindexTeams = 0;
  for (const tm of teams || []) {
    const edLen = tm.editorial_content ? tm.editorial_content.trim().length : 0;
    const hasPlayers = teamPlayersSet.has(tm.id);
    const mCount = teamMatchCountMap.get(tm.id) || 0;

    if (edLen > 100 || (hasPlayers && mCount >= 3)) {
      indexableTeams++;
    } else {
      noindexTeams++;
    }
  }

  // Player: ign non-empty AND (player_stats.matches_played > 0 OR editorial_content > 100)
  let indexablePlayers = 0;
  let noindexPlayers = 0;
  for (const p of players || []) {
    const edLen = p.editorial_content ? p.editorial_content.trim().length : 0;
    const mCount = playerStatsMap.get(p.id) || 0;

    if (p.ign && p.ign.trim() !== '' && (mCount > 0 || edLen > 100)) {
      indexablePlayers++;
    } else {
      noindexPlayers++;
    }
  }

  console.log("--- PHASE 2 EXACT INDEXABILITY RESULTS ---");
  console.log(`Tournaments Total: ${totalTournaments}`);
  console.log(`- INDEXABLE Tournaments:   ${indexableTournaments} (${((indexableTournaments/totalTournaments)*100).toFixed(2)}%)`);
  console.log(`- NOINDEX Tournaments:     ${noindexTournaments} (${((noindexTournaments/totalTournaments)*100).toFixed(2)}%)`);

  console.log(`\nTeams Total: ${totalTeams}`);
  console.log(`- INDEXABLE Teams:         ${indexableTeams} (${((indexableTeams/totalTeams)*100).toFixed(2)}%)`);
  console.log(`- NOINDEX Teams:           ${noindexTeams} (${((noindexTeams/totalTeams)*100).toFixed(2)}%)`);

  console.log(`\nPlayers Total: ${totalPlayers}`);
  console.log(`- INDEXABLE Players:       ${indexablePlayers} (${((indexablePlayers/totalPlayers)*100).toFixed(2)}%)`);
  console.log(`- NOINDEX Players:         ${noindexPlayers} (${((noindexPlayers/totalPlayers)*100).toFixed(2)}%)`);

  console.log(`\nBlogs Total: ${totalBlogs}`);
  console.log(`- INDEXABLE Blogs:         ${totalBlogs} (100.00%)`);

  process.exit(0);
}

runPhase2IndexabilityAudit();
