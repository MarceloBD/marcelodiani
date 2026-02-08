/**
 * Simple in-memory rate limiter for server actions.
 * Uses a sliding window approach to limit requests per IP/identifier.
 *
 * Note: This is an in-memory solution suitable for single-instance deployments.
 * For distributed systems, consider using Redis-based solutions like @upstash/ratelimit.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - windowMs;

  for (const [key, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter(
      (timestamp) => timestamp > cutoff
    );

    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
}

export function checkRateLimit(
  identifier: string,
  { maxRequests, windowMs }: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  cleanupExpiredEntries(windowMs);

  const entry = rateLimitStore.get(identifier) || { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((timestamp) => timestamp > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    return { allowed: false, remainingRequests: 0 };
  }

  entry.timestamps.push(now);
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remainingRequests: maxRequests - entry.timestamps.length,
  };
}
