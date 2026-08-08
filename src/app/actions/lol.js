'use server';

import { cache } from 'react';

// LoL Regional Routing Values (for Match-V5 and Account-V1)
const REGION_ROUTING = {
  americas: ['na1', 'br1', 'la1', 'la2'],
  asia: ['kr', 'jp1'],
  europe: ['eun1', 'euw1', 'tr1', 'ru'],
  sea: ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'],
};

function getRegionalRouting(platformRegion) {
  const normalized = platformRegion.toLowerCase();
  for (const [region, platforms] of Object.entries(REGION_ROUTING)) {
    if (platforms.includes(normalized)) {
      return region;
    }
  }
  return 'americas'; // Default
}

function getHeaders() {
  return {
    'X-Riot-Token': process.env.RIOT_LOL_CLIENT_ID || process.env.RIOT_API_KEY,
  };
}

// ==========================================
// ACCOUNT-V1
// ==========================================

export async function getAccountByRiotId(gameName, tagLine, region = 'americas') {
  try {
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 404) return { error: 'Account not found' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getAccountByRiotId error:', e);
    return { error: e.message };
  }
}

export async function getAccountByPuuid(puuid, region = 'americas') {
  try {
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 404) return { error: 'Account not found' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getAccountByPuuid error:', e);
    return { error: e.message };
  }
}

// ==========================================
// SUMMONER-V4
// ==========================================

export async function getSummonerByPuuid(puuid, platformRegion) {
  try {
    const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 404) return { error: 'Summoner not found' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getSummonerByPuuid error:', e);
    return { error: e.message };
  }
}

// ==========================================
// LEAGUE-V4
// ==========================================

export async function getLeagueEntriesBySummonerId(summonerId, platformRegion) {
  try {
    const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 300 } }); // 5 min cache
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getLeagueEntriesBySummonerId error:', e);
    return { error: e.message };
  }
}

export async function getChallengerLeague(queue, platformRegion) {
  try {
    const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${encodeURIComponent(queue)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getChallengerLeague error:', e);
    return { error: e.message };
  }
}

// ==========================================
// MATCH-V5
// ==========================================

export async function getMatchIdsByPuuid(puuid, platformRegion, start = 0, count = 20) {
  try {
    const region = getRegionalRouting(platformRegion);
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getMatchIdsByPuuid error:', e);
    return { error: e.message };
  }
}

export async function getMatchDetails(matchId, platformRegion) {
  try {
    const region = getRegionalRouting(platformRegion);
    const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
    // Matches don't change, we can cache them for a long time
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 86400 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 404) return { error: 'Match not found' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getMatchDetails error:', e);
    return { error: e.message };
  }
}

// ==========================================
// CHAMPION-MASTERY-V4
// ==========================================

export async function getTopChampionMasteries(puuid, platformRegion, count = 3) {
  try {
    const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=${count}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
    if (!res.ok) {
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getTopChampionMasteries error:', e);
    return { error: e.message };
  }
}

export async function getAllChampionMasteries(puuid, platformRegion) {
    try {
      const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}`;
      const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 3600 } });
      if (!res.ok) {
        if (res.status === 429) return { error: 'Rate limit exceeded' };
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return { data };
    } catch (e) {
      console.error('getAllChampionMasteries error:', e);
      return { error: e.message };
    }
}

// ==========================================
// SPECTATOR-V5
// ==========================================

export async function getActiveGameByPuuid(puuid, platformRegion) {
  try {
    const url = `https://${platformRegion.toLowerCase()}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`;
    const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 60 } }); // 1 min cache for live game
    if (!res.ok) {
      if (res.status === 404) return { data: null }; // Not currently in a game
      if (res.status === 429) return { error: 'Rate limit exceeded' };
      if (res.status === 403) return { error: 'API Key expired or unauthorized' };
      if (res.status === 401) return { error: 'API Key is invalid or missing' };
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (e) {
    console.error('getActiveGameByPuuid error:', e);
    return { error: e.message };
  }
}

// ==========================================
// DATA DRAGON (Static Assets)
// ==========================================
// Data Dragon versions change, but latest can be fetched dynamically or hardcoded for a period.
const DDRAGON_VERSION = '14.15.1'; // Can be fetched from https://ddragon.leagueoflegends.com/api/versions.json
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

export async function getDDragonChampions() {
    try {
        const res = await fetch(`${DDRAGON_BASE}/data/en_US/champion.json`, { next: { revalidate: 86400 } });
        const json = await res.json();
        return json.data;
    } catch(e) {
        console.error("Failed to fetch DDragon champions", e);
        return {};
    }
}

// ==========================================
// COMBINED PROFILE FETCH
// ==========================================

export const getLolProfile = cache(async (gameName, tagLine, platformRegion = 'na1') => {
    const regionalRouting = getRegionalRouting(platformRegion);
    
    // 1. Get Account (PUUID)
    const accountRes = await getAccountByRiotId(gameName, tagLine, regionalRouting);
    if (accountRes.error) return { error: accountRes.error };
    
    const { puuid, gameName: finalGameName, tagLine: finalTagLine } = accountRes.data;

    // 2. Get Summoner (Level, Profile Icon, ID)
    const summonerRes = await getSummonerByPuuid(puuid, platformRegion);
    if (summonerRes.error) return { error: summonerRes.error };
    const summoner = summonerRes.data;

    // 3. Get Rank (League Entries)
    const leagueRes = await getLeagueEntriesBySummonerId(summoner.id, platformRegion);
    const ranks = leagueRes.data || [];

    // 4. Get Match History
    const matchIdsRes = await getMatchIdsByPuuid(puuid, platformRegion, 0, 5); // Just 5 matches for profile overview
    const matchIds = matchIdsRes.data || [];
    
    const matchDetailsPromises = matchIds.map(id => getMatchDetails(id, platformRegion));
    const matchDetailsResults = await Promise.all(matchDetailsPromises);
    const matches = matchDetailsResults.filter(m => !m.error && m.data).map(m => m.data);

    // 5. Get Top Champion Masteries
    const masteriesRes = await getTopChampionMasteries(puuid, platformRegion, 3);
    const topMasteries = masteriesRes.data || [];

    // 6. Check Active Game
    const activeGameRes = await getActiveGameByPuuid(puuid, platformRegion);
    const activeGame = activeGameRes.data;

    // 7. Get Static Data (Champions)
    const championsData = await getDDragonChampions();

    return {
        account: { gameName: finalGameName, tagLine: finalTagLine, puuid },
        summoner,
        ranks,
        matches,
        topMasteries,
        activeGame,
        championsData
    };
});
