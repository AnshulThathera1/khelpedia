/**
 * KhelPediA Data Ingestion Engine — Tracker Network API
 * Uses official developer API documentation (https://tracker.gg/developers/docs)
 * Authentication via TRN-Api-Key environment variable header.
 */

import { BaseFetcher } from '../BaseFetcher.js';
import { DataValidator } from '../DataValidator.js';
import { IngestionLogger } from '../IngestionLogger.js';
import { IdempotentUpsert } from '../IdempotentUpsert.js';

const TRACKER_NETWORK_BASE_URL = 'https://public-api.tracker.gg/v2';

export class TrackerEngine {
  constructor(apiKey = process.env.TRN_API_KEY) {
    this.apiKey = apiKey ? apiKey.trim().replace(/^["']|["']$/g, '') : null;
    this.logger = new IngestionLogger('tracker_gg', 'SyncPlayerStats');
    this.fetcher = new BaseFetcher({
      userAgent: 'KhelPediA-TrackerEngine/2.0',
      logger: this.logger
    });
  }

  getHeaders() {
    return {
      'TRN-Api-Key': this.apiKey,
      'Accept': 'application/json'
    };
  }

  /**
   * Fetch player profile stats from Tracker Network
   * @param {string} game - e.g. 'csgo', 'valorant'
   * @param {string} platform - e.g. 'steam', 'origin', 'riot'
   * @param {string} handle - player identifier
   */
  async getPlayerProfile(game, platform, handle) {
    if (!this.apiKey) {
      console.warn("⚠️ TRN_API_KEY is missing. Please set TRN_API_KEY in .env.local to query Tracker Network.");
      this.logger.logRequest(false, false);
      return null;
    }

    const url = `${TRACKER_NETWORK_BASE_URL}/${game}/standard/profile/${platform}/${encodeURIComponent(handle)}`;
    const res = await this.fetcher.fetch(url, { headers: this.getHeaders() });

    if (!res.ok || !res.data) {
      console.error(`❌ Tracker Network API Error for ${game}/${platform}/${handle}: ${res.error}`);
      return null;
    }

    const profile = res.data.data;
    if (!profile) return null;

    // Validate player payload
    const playerInfo = profile.userInfo || {};
    const validation = DataValidator.validatePlayer({
      ign: playerInfo.name || handle,
      name: playerInfo.name
    });

    if (!validation.valid) {
      this.logger.logValidationFailure();
      return null;
    }

    // Register source mapping for player
    const sourcePlayerId = playerInfo.userId || handle;
    const internalPlayerId = await IdempotentUpsert.upsertPlayer({
      source: 'tracker_gg',
      source_player_id: sourcePlayerId,
      ign: playerInfo.name || handle,
      name: playerInfo.name || handle,
      country: playerInfo.countryCode,
      image_url: playerInfo.avatarUrl,
      logger: this.logger
    });

    return {
      internalPlayerId,
      sourcePlayerId,
      segments: profile.segments || []
    };
  }
}
