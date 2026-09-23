/**
 * KhelPediA Data Ingestion Engine — BaseFetcher
 * Safe HTTP fetcher with rate-limit detection, 429/5xx exponential backoff retries, and timeout controls.
 */

export class BaseFetcher {
  constructor(options = {}) {
    this.userAgent = options.userAgent || "KhelPediA-DataEngine/2.0 (https://khelpedia.org; contact@khelpedia.org)";
    this.maxRetries = options.maxRetries || 5;
    this.baseDelayMs = options.baseDelayMs || 1000;
    this.timeoutMs = options.timeoutMs || 15000;
    this.logger = options.logger || null;
  }

  async fetch(url, requestOptions = {}) {
    const headers = {
      "User-Agent": this.userAgent,
      "Accept": "application/json",
      ...(requestOptions.headers || {})
    };

    let attempt = 0;
    let delay = this.baseDelayMs;

    while (attempt < this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          ...requestOptions,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (this.logger) this.logger.logRequest(true);
          const text = await response.text();
          let data = null;
          if (text && text.trim()) {
            try {
              data = JSON.parse(text);
            } catch {
              data = text;
            }
          }
          return {
            ok: true,
            status: response.status,
            headers: response.headers,
            data
          };
        }

        const isRateLimit = response.status === 429;
        const isServerError = response.status >= 500 && response.status <= 599;

        if (this.logger) this.logger.logRequest(false, isRateLimit);

        if (isRateLimit || isServerError) {
          let retryAfterSec = 0;
          const retryAfterHeader = response.headers.get("retry-after");
          if (retryAfterHeader) {
            retryAfterSec = parseInt(retryAfterHeader, 10) || 0;
          }

          const sleepMs = retryAfterSec > 0 ? retryAfterSec * 1000 : delay;
          console.warn(`⚠️ HTTP ${response.status} from ${url}. Retrying in ${sleepMs}ms (Attempt ${attempt}/${this.maxRetries})...`);
          
          await new Promise(resolve => setTimeout(resolve, sleepMs));
          delay *= 2; // Exponential backoff multiplier
          continue;
        }

        // Unrecoverable HTTP error (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found)
        const errText = await response.text().catch(() => "");
        console.error(`❌ HTTP ${response.status} from ${url}: ${errText.substring(0, 200)}`);
        return {
          ok: false,
          status: response.status,
          error: `HTTP ${response.status}: ${errText}`
        };

      } catch (err) {
        clearTimeout(timeoutId);
        if (this.logger) this.logger.logRequest(false, false);

        if (attempt >= this.maxRetries) {
          console.error(`💥 Request failed after ${this.maxRetries} attempts for ${url}: ${err.message}`);
          return {
            ok: false,
            status: 0,
            error: err.message
          };
        }

        console.warn(`⚠️ Network/Timeout error (${err.message}). Retrying in ${delay}ms (Attempt ${attempt}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    return { ok: false, status: 0, error: "Max retries exceeded" };
  }
}
