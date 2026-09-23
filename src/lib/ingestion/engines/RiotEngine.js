/**
 * KhelPediA Data Ingestion Engine — Riot Games API
 * Supports Riot Account-V1, Val-Match-V1, Val-Ranked-V1, and Summoner-V4.
 * Implements regional routing, PUUID mapping, 429 exponential backoff, and entity source mapping.
 */

import { BaseFetcher } from '../BaseFetcher.js';
import { DataValidator } from '../DataValidator.js';
import { IngestionLogger } from '../IngestionLogger.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';

export class RiotEngine {
  constructor(apiKey = process.env.RIOT_API_KEY) {
    this.apiKey = apiKey ? apiKey.trim() : null;
    this.logger = new IngestionLogger('riot', 'SyncRiotAccountsAndMatches');
    this.fetcher = new BaseFetcher({
      userAgent: 'KhelPediA-RiotEngine/2.0',
      logger: this.logger
    });
  }

  getHeaders() {
    return {
      'X-Riot-Token': this.apiKey,
      'Accept': 'application/json'
    };
  }

  /**
   * Resolves regional cluster endpoint for Account API
   */
  getClusterForAccount(region = 'ap') {
    const mapping = {
      na: 'americas',
      latam: 'americas',
      br: 'americas',
      eu: 'europe',
      ap: 'asia',
      kr: 'asia',
      esports: 'esports'
    };
    return mapping[region.toLowerCase()] || 'asia';
  }

  /**
   * Account-V1: Resolve PUUID by Riot ID (gameName#tagLine)
   */
  async getAccountByRiotId(gameName, tagLine, region = 'ap') {
    if (!this.apiKey) {
      console.warn("⚠️ RIOT_API_KEY is missing. Skipping Riot Account query.");
      return null;
    }

    const cluster = this.getClusterForAccount(region);
    const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

    const res = await this.fetcher.fetch(url, { headers: this.getHeaders() });
    if (!res.ok || !res.data) return null;

    const account = res.data;
    const puuid = account.puuid;

    if (puuid) {
      // Register player mapping
      await IdempotentUpsert.upsertPlayer({
        source: 'riot',
        source_player_id: puuid,
        ign: `${account.gameName}#${account.tagLine}`,
        name: account.gameName,
        logger: this.logger
      });
    }

    return account;
  }

  /**
   * Val-Match-V1: Fetch Valorant match details by matchId
   */
  async getMatchDetails(matchId, region = 'ap') {
    if (!this.apiKey) return null;

    const url = `https://${region}.api.riotgames.com/val/match/v1/matches/${matchId}`;
    const res = await this.fetcher.fetch(url, { headers: this.getHeaders() });
    if (!res.ok || !res.data) return null;

    const match = res.data;

    // Register match source mapping
    await IdempotentUpsert.upsertEntityMapping(
      'riot',
      matchId,
      'match',
      matchId, // Riot Match IDs act as unique string IDs in valorant_matches cache
      { map_id: match.matchInfo?.mapId, queue_id: match.matchInfo?.queueId }
    );

    return match;
  }
}
