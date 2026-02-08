import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

type SqlTagFunction = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

const globalForPg = globalThis as typeof globalThis & {
  __localPgPool?: Pool;
};

function createLocalSqlTag(databaseUrl: string): SqlTagFunction {
  if (!globalForPg.__localPgPool) {
    globalForPg.__localPgPool = new Pool({ connectionString: databaseUrl });
  }

  const pool = globalForPg.__localPgPool;

  return async (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Record<string, unknown>[]> => {
    const queryText = strings.reduce((accumulated, current, index) => {
      return accumulated + current + (index < values.length ? `$${index + 1}` : "");
    }, "");

    const result = await pool.query(queryText, values);
    return result.rows;
  };
}

function getDatabase(): SqlTagFunction | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return null;
  }

  // Use Neon serverless driver on Vercel, standard pg client locally
  if (process.env.VERCEL) {
    return neon(databaseUrl) as unknown as SqlTagFunction;
  }

  return createLocalSqlTag(databaseUrl);
}

export async function ensureQuoteRequestsTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(100) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        project_description TEXT NOT NULL,
        budget_range VARCHAR(50),
        project_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export async function ensureScoreboardTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_scoreboard (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(30) NOT NULL,
        score INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export async function ensureLikesTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS page_likes (
        id INTEGER PRIMARY KEY DEFAULT 1,
        count INTEGER NOT NULL DEFAULT 0
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export async function ensureGameSessionsTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seed INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed BOOLEAN DEFAULT FALSE
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export async function ensureSystemLogsTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        source VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB,
        client_ip VARCHAR(45),
        stack_trace TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_logs_created_at
      ON system_logs (created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_logs_level
      ON system_logs (level)
    `;

    return true;
  } catch {
    return false;
  }
}

export async function ensureApiCacheTable(): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS api_cache (
        cache_key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return true;
  } catch {
    return false;
  }
}

export { getDatabase };
