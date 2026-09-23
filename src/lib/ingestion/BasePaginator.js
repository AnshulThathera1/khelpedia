/**
 * KhelPediA Data Ingestion Engine — BasePaginator
 * Standardized pagination handlers proving complete dataset retrieval.
 */

export class BasePaginator {
  /**
   * Complete pagination loop for PandaScore API
   * PandaScore uses `page[number]` and `page[size]` query parameters
   */
  static async paginatePandaScore({ fetchFn, pageSize = 100, maxPages = 50, logger = null }) {
    let page = 1;
    let allRecords = [];
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const res = await fetchFn(page, pageSize);
      if (!res || !res.ok || !Array.isArray(res.data)) {
        break;
      }

      const records = res.data;
      if (logger) logger.logFetched(records.length);
      allRecords = allRecords.concat(records);

      if (records.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allRecords;
  }

  /**
   * Complete cursor pagination loop for OpenDota API
   * OpenDota proMatches uses `less_than_match_id` cursor
   */
  static async paginateOpenDota({ fetchFn, maxBatches = 20, logger = null }) {
    let lastMatchId = null;
    let allMatches = [];
    let batchCount = 0;

    while (batchCount < maxBatches) {
      batchCount++;
      const res = await fetchFn(lastMatchId);
      if (!res || !res.ok || !Array.isArray(res.data) || res.data.length === 0) {
        break;
      }

      const matches = res.data;
      if (logger) logger.logFetched(matches.length);
      allMatches = allMatches.concat(matches);

      lastMatchId = matches[matches.length - 1].match_id;
      if (!lastMatchId) break;
    }

    return allMatches;
  }

  /**
   * Complete offset-limit pagination helper
   */
  static async paginateOffsetLimit({ fetchFn, limit = 100, maxPages = 50, logger = null }) {
    let offset = 0;
    let page = 1;
    let allRecords = [];
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const res = await fetchFn(offset, limit);
      if (!res || !res.ok || !Array.isArray(res.data)) {
        break;
      }

      const records = res.data;
      if (logger) logger.logFetched(records.length);
      allRecords = allRecords.concat(records);

      if (records.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
        page++;
      }
    }

    return allRecords;
  }
}
