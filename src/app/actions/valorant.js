'use server';

import { createClient } from '@/utils/supabase/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Base URLs
// For Account API, Riot uses regional proxies (americas, asia, europe). 'americas' works globally for accounts.
const ACCOUNT_BASE_URL = 'https://americas.api.riotgames.com';

// For Match API, it is specific to Valorant regions (ap, br, eu, kr, latam, na).
// Defaulting to AP given the context, but can be made dynamic.
const REGION = 'ap'; 
const MATCH_BASE_URL = `https://${REGION}.api.riotgames.com`;

export async function getValorantAgents() {
  try {
    const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true', { next: { revalidate: 86400 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Failed to fetch agents:', e);
    return [];
  }
}

export async function getValorantMaps() {
  try {
    const res = await fetch('https://valorant-api.com/v1/maps', { next: { revalidate: 86400 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Failed to fetch maps:', e);
    return [];
  }
}

const headers = {
  'X-Riot-Token': RIOT_API_KEY,
};

/**
 * Fetch Account by Riot ID
 */
export async function getValorantAccount(gameName, tagLine) {
  const supabase = await createClient();

  // 1. Check DB Cache
  const { data: cachedAccount, error: dbError } = await supabase
    .from('valorant_accounts')
    .select('*')
    .ilike('game_name', gameName)
    .ilike('tag_line', tagLine)
    .single();

  if (cachedAccount) {
    return { data: cachedAccount, source: 'cache' };
  }

  if (!RIOT_API_KEY) {
     return { error: 'RIOT_API_KEY is missing' };
  }

  // 2. Fetch from Riot API if not in Cache
  try {
    const encodedName = encodeURIComponent(gameName);
    const encodedTag = encodeURIComponent(tagLine);
    const res = await fetch(`${ACCOUNT_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`, {
      headers,
      next: { revalidate: 3600 } // Next.js fetch cache fallback
    });

    if (!res.ok) {
      if (res.status === 404) return { error: 'Player not found' };
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      return { error: 'Failed to fetch from Riot API' };
    }

    const accountData = await res.json();
    
    // 3. Save to DB Cache
    const { error: insertError } = await supabase
      .from('valorant_accounts')
      .upsert({
        puuid: accountData.puuid,
        game_name: accountData.gameName,
        tag_line: accountData.tagLine,
        last_updated: new Date().toISOString()
      }, { onConflict: 'puuid' });

    if (insertError) {
      console.error('Error caching account:', insertError);
    }

    return { 
      data: {
        puuid: accountData.puuid,
        game_name: accountData.gameName,
        tag_line: accountData.tagLine
      }, 
      source: 'api' 
    };
  } catch (error) {
    console.error('Error fetching account:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Fetch Match History IDs
 */
export async function getMatchHistoryIds(puuid) {
  if (!RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  try {
    // Get top 10 matches
    const res = await fetch(`${MATCH_BASE_URL}/val/match/v1/matches/by-puuid/${puuid}/ids?start=0&size=10`, {
      headers,
      next: { revalidate: 60 } // Short lived cache
    });

    if (!res.ok) {
      return { error: 'Failed to fetch match history IDs' };
    }

    const matchIds = await res.json();
    return { data: matchIds };
  } catch (error) {
    console.error('Error fetching match IDs:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Fetch Match Details (with Caching)
 */
export async function getMatchDetails(matchId, puuid) {
  const supabase = await createClient();

  // 1. Check DB Cache
  const { data: cachedMatch } = await supabase
    .from('valorant_matches')
    .select('match_info_json')
    .eq('match_id', matchId)
    .single();

  if (cachedMatch) {
    return { data: cachedMatch.match_info_json, source: 'cache' };
  }

  if (!RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  // 2. Fetch from Riot API
  try {
    const res = await fetch(`${MATCH_BASE_URL}/val/match/v1/matches/${matchId}`, {
      headers
    });

    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      return { error: 'Failed to fetch match details' };
    }

    const matchData = await res.json();

    // 3. Save to DB Cache
    const { error: insertError } = await supabase
      .from('valorant_matches')
      .upsert({
        match_id: matchId,
        puuid: puuid,
        match_info_json: matchData
      }, { onConflict: 'match_id' });

    if (insertError) {
      console.error('Error caching match:', insertError);
    }

    return { data: matchData, source: 'api' };
  } catch (error) {
    console.error('Error fetching match details:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Process Raw Matches into Display Stats
 */
export async function aggregatePlayerStats(matchesData, puuid) {
  if (!matchesData || matchesData.length === 0) return null;

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let wins = 0;
  let losses = 0;
  
  const agentCount = {};

  const processedMatches = matchesData.map(match => {
    // Find the player's specific stats in this match
    const player = match.players.find(p => p.puuid === puuid);
    if (!player) return null;

    // Determine if won or lost. Find player's team, then check if that team won
    const team = match.teams.find(t => t.teamId === player.teamId);
    const hasWon = team ? team.won : false;
    
    if (hasWon) wins++;
    else losses++;

    totalKills += player.stats.kills;
    totalDeaths += player.stats.deaths;
    totalAssists += player.stats.assists;

    const agent = player.characterId;
    agentCount[agent] = (agentCount[agent] || 0) + 1;

    return {
      matchId: match.matchInfo.matchId,
      mapId: match.matchInfo.mapId,
      queueId: match.matchInfo.queueId,
      gameStartMillis: match.matchInfo.gameStartMillis,
      stats: player.stats,
      characterId: player.characterId,
      combatScore: player.stats.score / (match.matchInfo.gameLengthMillis / 60000), // simplified
      hasWon,
      teamId: player.teamId,
      roundsPlayed: match.matchInfo.gameLengthMillis // not true rounds, but approximation if team data missing
    };
  }).filter(Boolean);

  const mostPlayedAgent = Object.keys(agentCount).reduce((a, b) => agentCount[a] > agentCount[b] ? a : b, null);

  const totalMatches = wins + losses;
  
  return {
    recentMatches: processedMatches,
    summary: {
      totalMatches,
      wins,
      losses,
      winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
      totalKills,
      totalDeaths,
      totalAssists,
      kdRatio: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2),
      mostPlayedAgent
    }
  };
}
