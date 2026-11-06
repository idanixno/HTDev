/**
 * In-memory notification rate limiter (dev/local).
 * Caps outbound EMAIL/SMS per user+channel to avoid spam loops.
 * Replace with Redis before production (same pattern as auth rate-limit stub).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitConfig = {
  max: number;
  windowMs: number;
};

export const DEFAULT_NOTIFY_RATE: RateLimitConfig = {
  max: Number(process.env.NOTIFY_RATE_LIMIT ?? 20),
  windowMs: Number(process.env.NOTIFY_RATE_WINDOW_MS ?? 60_000),
};

export function checkNotifyRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_NOTIFY_RATE,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + config.windowMs };
    buckets.set(key, bucket);
  }
  if (bucket.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
    };
  }
  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, config.max - bucket.count),
    retryAfterMs: 0,
  };
}

/** Test helper — clear buckets between specs. */
export function resetNotifyRateLimitForTests(): void {
  buckets.clear();
}
