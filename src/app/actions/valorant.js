'use server';

import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

// Read process.env.RIOT_API_KEY dynamically

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

export async function getValorantWeapons() {
  try {
    const res = await fetch('https://valorant-api.com/v1/weapons', { next: { revalidate: 86400 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Failed to fetch weapons:', e);
    return [];
  }
}

export async function getValorantPlayerCards() {
  try {
    const res = await fetch('https://valorant-api.com/v1/playercards', { next: { revalidate: 86400 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Failed to fetch player cards:', e);
    return [];
  }
}

export async function getValorantTiers() {
  try {
    const res = await fetch('https://valorant-api.com/v1/competitivetiers', { next: { revalidate: 86400 } });
    const json = await res.json();
    // The API returns an array of episodes, usually the last one has the most up-to-date tier definitions
    if (!json.data || json.data.length === 0) return [];
    const latestEpisode = json.data[json.data.length - 1];
    return latestEpisode.tiers || [];
  } catch (e) {
    console.error('Failed to fetch competitive tiers:', e);
    return [];
  }
}

function getHeaders() {
  return {
    'X-Riot-Token': process.env.RIOT_API_KEY,
  };
}

export const getValorantProfile = cache(async (gameName, tagLine) => {
  const accountRes = await getValorantAccount(gameName, tagLine);
  if (accountRes.error) return { error: accountRes.error };

  const { puuid } = accountRes.data;
  const historyRes = await getMatchHistoryIds(puuid);
  if (historyRes.error) return { error: historyRes.error };

  const matchIds = historyRes.data || [];
  const playerRegion = historyRes.region || 'ap';

  const emptyPlayerStats = {
    summary: {
      totalMatches: 0, winRate: 0, wins: 0, losses: 0, kdRatio: 0,
      totalKills: 0, totalDeaths: 0, totalDamage: 0,
      globalHsPercent: 0,
      globalAdr: 0,
      globalAcs: 0,
      globalKast: 0,
      globalDdPerRound: 0,
      globalKadRatio: 0,
      globalKillsPerRound: 0,
      totalFirstBloods: 0,
      totalAces: 0,
      totalFlawlessRounds: 0,
      kpsScore: 0,
      totalHeadshots: 0,
      totalBodyshots: 0,
      totalLegshots: 0,
      totalHits: 0,
      currentRankTier: null,
      currentPlayerCard: null,
      topAgents: []
    },
    recentMatches: [],
    topWeapons: [],
    topMaps: []
  };

  if (matchIds.length === 0) {
    // Player hasn't played recently, but account exists. Don't throw error, return empty stats.
    const [agentsRes, mapsRes, tiersRes, weaponsRes, playerCardsRes] = await Promise.all([
      getValorantAgents(), getValorantMaps(), getValorantTiers(), getValorantWeapons(), getValorantPlayerCards()
    ]);
    return {
      account: accountRes.data,
      playerStats: emptyPlayerStats,
      agentDict: agentsRes.reduce((acc, a) => ({ ...acc, [a.uuid.toLowerCase()]: a }), {}),
      mapDict: mapsRes.reduce((acc, m) => ({ ...acc, [m.mapUrl]: m }), {}),
      tiersRes,
      weaponDict: weaponsRes.reduce((acc, w) => ({ ...acc, [w.uuid.toLowerCase()]: w }), {}),
      playerCardDict: playerCardsRes.reduce((acc, c) => ({ ...acc, [c.uuid.toLowerCase()]: c }), {})
    };
  }

  const matchesData = [];
  const errors = [];
  let rateLimited = false;

  for (const id of matchIds.slice(0, 10)) { // Limit to 10 for dev key
    const matchRes = await getMatchDetails(id, puuid, playerRegion);
    if (matchRes.error) {
      if (matchRes.error === 'Rate limit exceeded') rateLimited = true;
      errors.push(`${id}: ${matchRes.error}`);
      if (rateLimited) break;
    }
    if (!matchRes.error && matchRes.data) {
      matchesData.push(matchRes.data);
    }
  }

  const cleanMatches = matchesData.filter(Boolean);
  let playerStats = emptyPlayerStats;
  
  if (cleanMatches.length > 0) {
    playerStats = await aggregatePlayerStats(cleanMatches, puuid) || emptyPlayerStats;
  } else if (rateLimited) {
    return { error: "Riot API Rate Limit Exceeded. Please try again in 2 minutes." };
  }

  const [agentsRes, mapsRes, tiersRes, weaponsRes, playerCardsRes] = await Promise.all([
    getValorantAgents(),
    getValorantMaps(),
    getValorantTiers(),
    getValorantWeapons(),
    getValorantPlayerCards()
  ]);

  const agentDict = agentsRes.reduce((acc, a) => ({ ...acc, [a.uuid.toLowerCase()]: a }), {});
  const mapDict = mapsRes.reduce((acc, m) => ({ ...acc, [m.mapUrl]: m }), {});
  const weaponDict = weaponsRes.reduce((acc, w) => ({ ...acc, [w.uuid.toLowerCase()]: w }), {});
  const playerCardDict = playerCardsRes.reduce((acc, c) => ({ ...acc, [c.uuid.toLowerCase()]: c }), {});
  
  return { 
    account: accountRes.data, 
    playerStats, 
    agentDict, 
    mapDict, 
    tiersRes,
    weaponDict,
    playerCardDict
  };
});

/**
 * Fetch Account by Riot ID
 */
export async function getValorantAccount(gameName, tagLine) {
  const supabase = await createClient();

  const { data: cachedAccount, error: dbError } = await supabase
    .from('valorant_accounts')
    .select('*')
    .ilike('game_name', gameName)
    .ilike('tag_line', tagLine)
    .single();

  if (cachedAccount) {
    return { data: cachedAccount, source: 'cache' };
  }

  if (!process.env.RIOT_API_KEY) {
     return { error: 'RIOT_API_KEY is missing' };
  }

  // 2. Fetch from Riot API if not in Cache
  try {
    const encodedName = encodeURIComponent(gameName);
    const encodedTag = encodeURIComponent(tagLine);
    const res = await fetch(`${ACCOUNT_BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`, {
      headers: getHeaders(),
      cache: 'no-store'
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
      }, { onConflict: 'game_name, tag_line' });

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
  if (!process.env.RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  try {
    // 1. Get active shard
    const shardRes = await fetch(`${ACCOUNT_BASE_URL}/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    let region = REGION;
    if (shardRes.ok) {
       const shardData = await shardRes.json();
       region = shardData.activeShard || REGION;
    }

    const matchBaseUrl = `https://${region}.api.riotgames.com`;

    // 2. Get top 10 matches from matchlist
    const res = await fetch(`${matchBaseUrl}/val/match/v1/matchlists/by-puuid/${puuid}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Match History Fetch Failed:', res.status, errorText, puuid);
      if (res.status === 403) return { error: 'API Key is forbidden (403) from accessing Match History. Ensure val-match-v1 is approved on your Riot App.' };
      return { error: 'Failed to fetch match history IDs' };
    }

    const matchlistData = await res.json();
    
    // The Valorant matchlist API returns an object with a 'history' array
    // Each item in history has { matchId, gameStartTimeMillis, queueId }
    if (!matchlistData || !matchlistData.history) {
       return { error: 'Invalid match history data format' };
    }
    
    const matchIds = matchlistData.history.slice(0, 10).map(match => match.matchId);
    return { data: matchIds, region: region };
  } catch (error) {
    console.error('Error fetching match IDs:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Fetch Match Details (with Caching)
 */
export async function getMatchDetails(matchId, puuid, region = REGION) {
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

  if (!process.env.RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  // 2. Fetch from Riot API
  try {
    const matchBaseUrl = `https://${region}.api.riotgames.com`;
    const res = await fetch(`${matchBaseUrl}/val/match/v1/matches/${matchId}`, {
      headers: getHeaders(),
      cache: 'no-store'
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

  let totalKills = 0, totalDeaths = 0, totalAssists = 0;
  let wins = 0, losses = 0;
  let totalDamage = 0, totalDamageReceived = 0, totalHeadshots = 0, totalBodyshots = 0, totalLegshots = 0;
  let totalRoundsPlayed = 0;
  let totalCombatScore = 0;
  
  // Advanced Stats
  let totalFirstBloods = 0;
  let totalAces = 0;
  let totalFlawlessRounds = 0;
  let totalKastRounds = 0;

  const agentStats = {};
  const weaponStats = {};
  const mapStats = {};
  let currentRankTier = null;
  let currentPlayerCard = null;

  const processedMatches = matchesData.map((match, index) => {
    const player = match.players.find(p => p.puuid === puuid);
    if (!player) return null;

    if (!currentRankTier && player.competitiveTier) {
       currentRankTier = player.competitiveTier;
    }
    
    // Extract player card from the most recent match
    if (index === 0 && player.playerCard) {
       currentPlayerCard = player.playerCard;
    }

    const team = match.teams.find(t => t.teamId === player.teamId);
    const enemyTeam = match.teams.find(t => t.teamId !== player.teamId);
    const hasWon = team ? team.won : false;
    
    if (hasWon) wins++;
    else losses++;

    // Track map stats
    const mapId = match.matchInfo.mapId;
    if (!mapStats[mapId]) {
      mapStats[mapId] = { matches: 0, wins: 0, losses: 0 };
    }
    mapStats[mapId].matches++;
    if (hasWon) mapStats[mapId].wins++;
    else mapStats[mapId].losses++;

    const teamRounds = team ? team.roundsWon : 0;
    const enemyRounds = enemyTeam ? enemyTeam.roundsWon : 0;
    const scoreString = `${teamRounds} - ${enemyRounds}`;

    totalKills += player.stats.kills;
    totalDeaths += player.stats.deaths;
    totalAssists += player.stats.assists;
    totalRoundsPlayed += player.stats.roundsPlayed || 1;

    let matchDamage = 0, matchDamageReceived = 0, matchHS = 0, matchBS = 0, matchLS = 0;
    let matchFirstBloods = 0, matchAces = 0, matchFlawless = 0, matchKastRounds = 0;

    // Calculate Damage and Headshots from Round Results
    if (match.roundResults) {
      match.roundResults.forEach(round => {
        let pKillsInRound = 0;
        let pDiedInRound = false;
        let pAssistedInRound = false;
        let teamDeathsInRound = 0;
        
        // Find all kills in the round
        let allKills = [];
        round.playerStats.forEach(ps => {
          if (ps.kills) allKills.push(...ps.kills);
          
          // Calculate damage received
          if (ps.damage) {
            ps.damage.forEach(dmg => {
              if (dmg.receiver === puuid) {
                matchDamageReceived += dmg.damage;
              }
            });
          }
        });

        // Sort all kills by time to find First Blood
        allKills.sort((a, b) => a.timeSinceRoundStartMillis - b.timeSinceRoundStartMillis);
        if (allKills.length > 0 && allKills[0].killer === puuid) {
          matchFirstBloods++;
        }

        const pStats = round.playerStats.find(ps => ps.puuid === puuid);
        if (pStats) {
          const weaponId = pStats.economy?.weapon?.toLowerCase();
          if (weaponId && !weaponStats[weaponId]) {
            weaponStats[weaponId] = { kills: 0, headshots: 0, bodyshots: 0, legshots: 0, damage: 0 };
          }

          if (pStats.damage) {
            pStats.damage.forEach(dmg => {
              matchDamage += dmg.damage;
              matchHS += dmg.headshots;
              matchBS += dmg.bodyshots;
              matchLS += dmg.legshots;

              if (weaponId) {
                weaponStats[weaponId].headshots += dmg.headshots;
                weaponStats[weaponId].bodyshots += dmg.bodyshots;
                weaponStats[weaponId].legshots += dmg.legshots;
                weaponStats[weaponId].damage += dmg.damage;
              }
            });
          }

          if (pStats.kills) {
            pKillsInRound = pStats.kills.length;
            if (weaponId) {
              pStats.kills.forEach(k => {
                if (k.killer === puuid) weaponStats[weaponId].kills++;
              });
            }
          }
        }
        
        // Determine KAST components and Flawless
        allKills.forEach(k => {
           if (k.victim === puuid) pDiedInRound = true;
           if (k.assistants && k.assistants.includes(puuid)) pAssistedInRound = true;
           
           // Check if victim is on our team
           const victimTeam = match.players.find(p => p.puuid === k.victim)?.teamId;
           if (victimTeam === player.teamId) teamDeathsInRound++;
        });

        // Aces
        if (pKillsInRound >= 5) matchAces++;
        
        // Flawless Round
        if (round.winningTeam === player.teamId && teamDeathsInRound === 0) {
           matchFlawless++;
        }
        
        // KAST: Kill, Assist, Survived, or Traded (Simplified trade as KAS for now)
        if (pKillsInRound > 0 || pAssistedInRound || !pDiedInRound) {
           matchKastRounds++;
        }
      });
    }

    totalDamage += matchDamage;
    totalDamageReceived += matchDamageReceived;
    totalHeadshots += matchHS;
    totalBodyshots += matchBS;
    totalLegshots += matchLS;
    totalFirstBloods += matchFirstBloods;
    totalAces += matchAces;
    totalFlawlessRounds += matchFlawless;
    totalKastRounds += matchKastRounds;

    const matchHits = matchHS + matchBS + matchLS;
    const matchHsPercent = matchHits > 0 ? ((matchHS / matchHits) * 100).toFixed(1) : 0;
    const matchAdr = player.stats.roundsPlayed > 0 ? Math.round(matchDamage / player.stats.roundsPlayed) : 0;
    const combatScore = player.stats.score / (player.stats.roundsPlayed || 1);
    totalCombatScore += combatScore;

    // Agent Stats Aggregation
    const agent = player.characterId;
    if (!agentStats[agent]) {
       agentStats[agent] = { matches: 0, wins: 0, kills: 0, deaths: 0, score: 0 };
    }
    agentStats[agent].matches++;
    if (hasWon) agentStats[agent].wins++;
    agentStats[agent].kills += player.stats.kills;
    agentStats[agent].deaths += player.stats.deaths;
    agentStats[agent].score += combatScore;

    return {
      matchId: match.matchInfo.matchId,
      mapId: match.matchInfo.mapId,
      queueId: match.matchInfo.queueId,
      gameStartMillis: match.matchInfo.gameStartMillis,
      stats: player.stats,
      characterId: player.characterId,
      combatScore,
      hasWon,
      scoreString,
      matchHsPercent,
      matchAdr,
      teamId: player.teamId,
      rawMatch: match // Add full lobby payload for scoreboards
    };
  }).filter(Boolean);

  const totalHits = totalHeadshots + totalBodyshots + totalLegshots;
  const globalHsPercent = totalHits > 0 ? ((totalHeadshots / totalHits) * 100).toFixed(1) : 0;
  const globalAdr = totalRoundsPlayed > 0 ? Math.round(totalDamage / totalRoundsPlayed) : 0;
  const globalAcs = processedMatches.length > 0 ? Math.round(totalCombatScore / processedMatches.length) : 0;
  const globalKast = totalRoundsPlayed > 0 ? ((totalKastRounds / totalRoundsPlayed) * 100).toFixed(1) : 0;
  const globalDdPerRound = totalRoundsPlayed > 0 ? Math.round((totalDamage - totalDamageReceived) / totalRoundsPlayed) : 0;
  const globalKdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
  const globalKadRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : (totalKills + totalAssists).toFixed(2);
  const globalKillsPerRound = totalRoundsPlayed > 0 ? (totalKills / totalRoundsPlayed).toFixed(2) : 0;
  
  // Calculate Performance Score (KPS)
  // Max score ~1000. Weight ACS (max 300), KD (max 3.0 = 300), ADR (max 200), HS% (max 50% = 200)
  const acsScore = Math.min(300, (globalAcs / 300) * 300);
  const kdScore = Math.min(300, (globalKdRatio / 1.5) * 300);
  const adrScore = Math.min(200, (globalAdr / 160) * 200);
  const hsScore = Math.min(200, (globalHsPercent / 40) * 200);
  const kpsScore = Math.round(acsScore + kdScore + adrScore + hsScore);

  // Process all agents
  const allAgents = Object.keys(agentStats)
    .map(agentId => {
      const a = agentStats[agentId];
      return {
        characterId: agentId,
        matches: a.matches,
        winRate: Math.round((a.wins / a.matches) * 100),
        kdRatio: a.deaths > 0 ? (a.kills / a.deaths).toFixed(2) : a.kills.toFixed(2),
        acs: Math.round(a.score / a.matches)
      };
    })
    .sort((a, b) => b.matches - a.matches);

  const topAgents = allAgents.slice(0, 3); // top 3

  // Process all weapons
  const allWeapons = Object.keys(weaponStats)
    .map(weaponId => {
      const w = weaponStats[weaponId];
      const hits = w.headshots + w.bodyshots + w.legshots;
      return {
        weaponId,
        kills: w.kills,
        damage: w.damage,
        headshots: hits > 0 ? Math.round((w.headshots / hits) * 100) : 0,
        bodyshots: hits > 0 ? Math.round((w.bodyshots / hits) * 100) : 0,
        legshots: hits > 0 ? Math.round((w.legshots / hits) * 100) : 0
      };
    })
    .sort((a, b) => b.kills - a.kills);

  // Process all maps
  const allMaps = Object.keys(mapStats)
    .map(mapId => {
      const m = mapStats[mapId];
      return {
        mapId,
        matches: m.matches,
        wins: m.wins,
        losses: m.losses,
        winRate: Math.round((m.wins / m.matches) * 100)
      };
    })
    .sort((a, b) => b.matches - a.matches);

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
      globalHsPercent,
      globalAdr,
      globalAcs,
      globalKast,
      globalDdPerRound,
      globalKadRatio,
      globalKillsPerRound,
      totalFirstBloods,
      totalAces,
      totalFlawlessRounds,
      kpsScore,
      totalHeadshots,
      totalBodyshots,
      totalLegshots,
      totalHits,
      totalDamage,
      topAgents,
      allAgents,
      allWeapons,
      allMaps,
      currentRankTier,
      currentPlayerCard
    }
  };
}

/**
 * Fetch Current Act ID
 */
export async function getCurrentActId() {
  try {
    const res = await fetch('https://valorant-api.com/v1/seasons', { next: { revalidate: 86400 } });
    const json = await res.json();
    if (!json.data) return null;
    
    // Find the active competitive act
    const now = new Date();
    const activeAct = json.data.find(season => {
        if (season.type !== 'EAresSeasonType::Act') return false;
        const start = new Date(season.startTime);
        const end = new Date(season.endTime);
        return now >= start && now <= end;
    });
    
    return activeAct ? activeAct.uuid : null;
  } catch (e) {
    console.error('Failed to fetch acts:', e);
    return null;
  }
}

/**
 * Fetch Ranked Leaderboard
 */
export async function getValorantLeaderboard(actId, region = REGION) {
  if (!process.env.RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  try {
    const res = await fetch(`https://${region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/${actId}?size=100`, {
      headers: getHeaders(),
      next: { revalidate: 3600 } // Cache leaderboard for 1 hour
    });

    if (!res.ok) {
      if (res.status === 404) return { error: 'Leaderboard not found for this act' };
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      return { error: 'Failed to fetch leaderboard from Riot API' };
    }

    const leaderboardData = await res.json();
    return { data: leaderboardData.players || [] };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Fetch Server Status
 */
export async function getValorantServerStatus(region = REGION) {
  if (!process.env.RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  try {
    const res = await fetch(`https://${region}.api.riotgames.com/val/status/v1/platform-data`, {
      headers: getHeaders(),
      next: { revalidate: 300 } // Cache for 5 mins
    });

    if (!res.ok) {
      return { error: 'Failed to fetch status' };
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Error fetching server status:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Fetch Game Content (Characters, Maps, Chromas, Skins, etc)
 * Optionally filtered by locale (e.g. en-US, es-ES, ko-KR)
 */
export async function getValorantContent(locale, region = REGION) {
  if (!process.env.RIOT_API_KEY) return { error: 'RIOT_API_KEY is missing' };

  try {
    let url = `https://${region}.api.riotgames.com/val/content/v1/contents`;
    if (locale) {
      url += `?locale=${encodeURIComponent(locale)}`;
    }

    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 86400 } // Content rarely changes, cache for 1 day
    });

    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      return { error: 'Failed to fetch content data' };
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Error fetching game content:', error);
    return { error: 'Internal server error' };
  }
}

/**
 * Search Cached Valorant Accounts by partial name
 */
export async function searchValorantAccounts(query) {
  if (!query || query.trim().length < 2) return { data: [] };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('valorant_accounts')
    .select('puuid, game_name, tag_line, last_updated')
    .ilike('game_name', `%${query.trim()}%`)
    .order('last_updated', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error searching accounts:', error);
    return { data: [] };
  }

  return { data: data || [] };
}

/**
 * Get Global Stats (Total Players Tracked & Season End Time)
 */
export async function getValorantGlobalStats() {
  const supabase = await createClient();
  let playersTracked = 0;
  let seasonEndTime = null;

  try {
    // 1. Get total players tracked
    const { count, error } = await supabase
      .from('valorant_accounts')
      .select('*', { count: 'exact', head: true });
    
    if (!error) playersTracked = count || 0;

    // 2. Get season end time
    const res = await fetch('https://valorant-api.com/v1/seasons', { next: { revalidate: 86400 } });
    const json = await res.json();
    if (json.data) {
      const now = new Date();
      const activeAct = json.data.find(season => {
          if (season.type !== 'EAresSeasonType::Act') return false;
          const start = new Date(season.startTime);
          const end = new Date(season.endTime);
          return now >= start && now <= end;
      });
      if (activeAct) seasonEndTime = activeAct.endTime;
    }
  } catch (err) {
    console.error('Error fetching global stats:', err);
  }

  return { playersTracked, seasonEndTime };
}
