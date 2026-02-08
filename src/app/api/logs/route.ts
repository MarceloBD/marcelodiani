import { getDatabase, ensureSystemLogsTable } from "@/lib/db";

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function isAuthorized(request: Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${adminKey}`;
}

// ---------------------------------------------------------------------------
// GET /api/logs — Query system logs (paginated, filterable)
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDatabase();
  if (!sql) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const tableReady = await ensureSystemLogsTable();
  if (!tableReady) {
    return Response.json({ error: "Failed to initialize logs table" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const levelFilter = searchParams.get("level") || null;
  const sourceFilter = searchParams.get("source") || null;
  const searchTerm = searchParams.get("search") || null;
  const searchPattern = searchTerm ? `%${searchTerm}%` : null;
  const queryLimit = Math.min(Number(searchParams.get("limit") || 50), 200);
  const queryOffset = Number(searchParams.get("offset") || 0);

  try {
    const rows = await sql`
      SELECT id, level, source, message, metadata, client_ip, stack_trace, created_at
      FROM system_logs
      WHERE (${levelFilter} IS NULL OR level = ${levelFilter})
        AND (${sourceFilter} IS NULL OR source = ${sourceFilter})
        AND (${searchPattern} IS NULL OR message ILIKE ${searchPattern})
      ORDER BY created_at DESC
      LIMIT ${queryLimit}
      OFFSET ${queryOffset}
    `;

    const countRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM system_logs
      WHERE (${levelFilter} IS NULL OR level = ${levelFilter})
        AND (${sourceFilter} IS NULL OR source = ${sourceFilter})
        AND (${searchPattern} IS NULL OR message ILIKE ${searchPattern})
    `;

    return Response.json({
      logs: rows,
      total: Number(countRows[0]?.total ?? 0),
      limit: queryLimit,
      offset: queryOffset,
    });
  } catch {
    return Response.json({ error: "Failed to query logs" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/logs — Cleanup old logs
// ---------------------------------------------------------------------------

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDatabase();
  if (!sql) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const tableReady = await ensureSystemLogsTable();
  if (!tableReady) {
    return Response.json({ error: "Failed to initialize logs table" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const daysToKeep = Math.max(Number(searchParams.get("keep_days") || 30), 1);
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

  try {
    const rows = await sql`
      DELETE FROM system_logs
      WHERE created_at < ${cutoffDate}::timestamptz
      RETURNING id
    `;

    return Response.json({
      deleted: rows.length,
      cutoffDate,
    });
  } catch {
    return Response.json({ error: "Failed to delete logs" }, { status: 500 });
  }
}
