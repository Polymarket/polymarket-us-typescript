/**
 * Retry helpers for the HTTP client.
 *
 * The Polymarket US API does not return `Retry-After` or `X-RateLimit-*`
 * headers, so backoff is computed client-side with exponential growth and
 * jitter. Only idempotent methods are retried automatically: order placement
 * and other `POST` requests are never retried because the API has no idempotency
 * key, so a retry after a partial failure could submit a duplicate order.
 */

export const DEFAULT_MAX_RETRIES = 2;

const RETRYABLE_STATUS = new Set([408, 409, 429, 500, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'DELETE']);

const BACKOFF_INITIAL_MS = 500;
const BACKOFF_MAX_MS = 8000;

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

export function canRetryMethod(method: string): boolean {
  return IDEMPOTENT_METHODS.has(method.toUpperCase());
}

export function backoffDelayMs(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined && retryAfterMs >= 0) {
    return retryAfterMs;
  }
  const capped = Math.min(BACKOFF_INITIAL_MS * 2 ** attempt, BACKOFF_MAX_MS);
  return capped / 2 + Math.random() * (capped / 2);
}

export function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) {
    return undefined;
  }
  const seconds = Number(header);
  return Number.isFinite(seconds) ? seconds * 1000 : undefined;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
