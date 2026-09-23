/**
 * KhelPediA Data Ingestion Engine — IngestionLogger
 * Standardized structured logger for data ingestion operational metrics.
 */

export class IngestionLogger {
  constructor(source, job) {
    this.source = source;
    this.job = job;
    this.startTime = new Date();
    this.endTime = null;
    this.requests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.recordsFetched = 0;
    this.recordsInserted = 0;
    this.recordsUpdated = 0;
    this.recordsSkipped = 0;
    this.duplicates = 0;
    this.validationFailures = 0;
    this.apiErrors = 0;
    this.rateLimitErrors = 0;
  }

  logRequest(success = true, isRateLimit = false) {
    this.requests++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
      if (isRateLimit) {
        this.rateLimitErrors++;
      } else {
        this.apiErrors++;
      }
    }
  }

  logFetched(count = 1) {
    this.recordsFetched += count;
  }

  logInserted(count = 1) {
    this.recordsInserted += count;
  }

  logUpdated(count = 1) {
    this.recordsUpdated += count;
  }

  logSkipped(count = 1) {
    this.recordsSkipped += count;
  }

  logDuplicate(count = 1) {
    this.duplicates += count;
  }

  logValidationFailure(count = 1) {
    this.validationFailures += count;
  }

  finish() {
    this.endTime = new Date();
  }

  getSummary() {
    const durationMs = (this.endTime || new Date()) - this.startTime;
    const durationSec = (durationMs / 1000).toFixed(2);
    
    return `
==================================================
INGESTION METRICS REPORT: [${this.source.toUpperCase()}] ${this.job}
==================================================
SOURCE:               ${this.source}
JOB:                  ${this.job}
START TIME:           ${this.startTime.toISOString()}
END TIME:             ${(this.endTime || new Date()).toISOString()} (${durationSec}s)
REQUESTS:             ${this.requests}
SUCCESSFUL REQUESTS:  ${this.successfulRequests}
FAILED REQUESTS:      ${this.failedRequests}
RECORDS FETCHED:      ${this.recordsFetched}
RECORDS INSERTED:     ${this.recordsInserted}
RECORDS UPDATED:      ${this.recordsUpdated}
RECORDS SKIPPED:      ${this.recordsSkipped}
DUPLICATES:           ${this.duplicates}
VALIDATION FAILURES:  ${this.validationFailures}
API ERRORS:           ${this.apiErrors}
RATE LIMIT ERRORS:    ${this.rateLimitErrors}
==================================================
`;
  }

  async sendDiscordNotification() {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      const summaryText = this.getSummary();
      const isSuccess = this.failedRequests === 0 && this.apiErrors === 0 && this.rateLimitErrors === 0;

      const payload = {
        content: null,
        embeds: [
          {
            title: `⚙️ Ingestion Report: [${this.source.toUpperCase()}] ${this.job}`,
            description: `\`\`\`yaml\n${summaryText.trim()}\n\`\`\``,
            color: isSuccess ? 3066993 : 15158332, // Green if clean, Red if errors
            timestamp: new Date().toISOString(),
            footer: {
              text: "KhelPediA Data Ingestion Daemon"
            }
          }
        ],
        username: "KhelPediA Ingestion Bot",
        avatar_url: "https://khelpedia.org/icon.png"
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("⚠️ Discord ingestion notification error:", err.message || err);
    }
  }

  async printReport() {
    this.finish();
    console.log(this.getSummary());
    await this.sendDiscordNotification();
  }
}
