/**
 * Database-backed daily cache for APIs with very limited free tiers.
 * Stores fetched data in PostgreSQL and only calls the external API
 * once per day (on the first request after midnight UTC).
 */

import { getDatabase, ensureApiCacheTable } from "@/lib/db";

interface CachedRow {
  cache_key: string;
  data: Record<string, unknown>;
  fetched_at: string;
}

function isSameUtcDay(dateString: string): boolean {
  const cached = new Date(dateString);
  const now = new Date();

  return (
    cached.getUTCFullYear() === now.getUTCFullYear() &&
    cached.getUTCMonth() === now.getUTCMonth() &&
    cached.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Tries to return data from DB cache if it was fetched today (UTC).
 * Returns null if no valid cache exists.
 */
export async function getDailyCached<T>(cacheKey: string): Promise<T | null> {
  const sql = getDatabase();
  if (!sql) return null;

  try {
    await ensureApiCacheTable();

    const rows = await sql`
      SELECT cache_key, data, fetched_at
      FROM api_cache
      WHERE cache_key = ${cacheKey}
    `;

    if (rows.length === 0) return null;

    const row = rows[0] as unknown as CachedRow;

    if (!isSameUtcDay(row.fetched_at)) return null;

    return row.data as unknown as T;
  } catch {
    return null;
  }
}

/**
 * Stores data in the DB cache with today's timestamp.
 * Uses UPSERT to update existing rows.
 */
export async function setDailyCache<T>(cacheKey: string, data: T): Promise<void> {
  const sql = getDatabase();
  if (!sql) return;

  try {
    await ensureApiCacheTable();

    await sql`
      INSERT INTO api_cache (cache_key, data, fetched_at)
      VALUES (${cacheKey}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (cache_key)
      DO UPDATE SET data = ${JSON.stringify(data)}, fetched_at = NOW()
    `;
  } catch {
    // Silently fail — in-memory cache will still work as fallback
  }
}
