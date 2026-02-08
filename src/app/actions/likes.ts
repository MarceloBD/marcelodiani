"use server";

import { getDatabase, ensureLikesTable } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIdentifier } from "@/lib/client-identifier";
import { logger, toError } from "@/lib/logger";

interface LikeResult {
  success: boolean;
  count: number;
}

const LIKE_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60_000, // 5 likes per minute
};

export async function getLikeCount(): Promise<number> {
  const sql = getDatabase();
  if (!sql) return 0;

  try {
    await ensureLikesTable();
    const rows = await sql`SELECT count FROM page_likes WHERE id = 1`;
    return Number(rows[0]?.count ?? 0);
  } catch (caughtError) {
    logger.error("likes-action", "Failed to get like count", {
      error: toError(caughtError),
    });
    return 0;
  }
}

export async function incrementLikeCount(): Promise<LikeResult> {
  const clientIp = await getClientIdentifier();
  const { allowed } = checkRateLimit(`likes:${clientIp}`, LIKE_RATE_LIMIT);

  if (!allowed) {
    const currentCount = await getLikeCount();
    return { success: false, count: currentCount };
  }

  const sql = getDatabase();
  if (!sql) {
    return { success: false, count: 0 };
  }

  try {
    await ensureLikesTable();

    const rows = await sql`
      INSERT INTO page_likes (id, count)
      VALUES (1, 1)
      ON CONFLICT (id) DO UPDATE SET count = page_likes.count + 1
      RETURNING count
    `;

    return { success: true, count: Number(rows[0]?.count ?? 0) };
  } catch (caughtError) {
    logger.error("likes-action", "Failed to increment like count", {
      error: toError(caughtError),
    });
    return { success: false, count: 0 };
  }
}
