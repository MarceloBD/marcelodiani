import { LogLevel } from "@/enums/logLevel";
import { getDatabase } from "@/lib/db";
import { sendErrorAlertEmail } from "@/lib/email";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LogOptions {
  metadata?: Record<string, unknown>;
  clientIp?: string;
  error?: Error;
  stackTrace?: string;
}

interface LogEntry {
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  clientIp?: string;
  stackTrace?: string;
}

// ---------------------------------------------------------------------------
// Console method mapping
// ---------------------------------------------------------------------------

const CONSOLE_METHODS: Record<LogLevel, keyof Pick<Console, "info" | "warn" | "error">> = {
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error",
};

// ---------------------------------------------------------------------------
// Email throttle (one error email per source per 5 minutes)
// ---------------------------------------------------------------------------

const emailThrottle = new Map<string, number>();
const EMAIL_THROTTLE_MS = 5 * 60 * 1000;

function shouldSendErrorEmail(source: string): boolean {
  const now = Date.now();
  const lastSent = emailThrottle.get(source) ?? 0;

  if (now - lastSent < EMAIL_THROTTLE_MS) {
    return false;
  }

  emailThrottle.set(source, now);
  return true;
}

// ---------------------------------------------------------------------------
// Database table (cached to avoid repeated CREATE TABLE calls)
// ---------------------------------------------------------------------------

let tableCreated = false;

async function ensureLogsTable(): Promise<void> {
  if (tableCreated) return;

  const sql = getDatabase();
  if (!sql) return;

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

    tableCreated = true;
  } catch {
    console.error("[logger] Failed to create system_logs table");
  }
}

// ---------------------------------------------------------------------------
// Database insert
// ---------------------------------------------------------------------------

async function insertLogToDatabase(entry: LogEntry): Promise<void> {
  const sql = getDatabase();
  if (!sql) return;

  await ensureLogsTable();

  const metadataJson = entry.metadata ? JSON.stringify(entry.metadata) : null;

  await sql`
    INSERT INTO system_logs (level, source, message, metadata, client_ip, stack_trace)
    VALUES (
      ${entry.level},
      ${entry.source},
      ${entry.message},
      ${metadataJson}::jsonb,
      ${entry.clientIp ?? null},
      ${entry.stackTrace ?? null}
    )
  `;
}

// ---------------------------------------------------------------------------
// Persist log (DB + email alert for errors)
// ---------------------------------------------------------------------------

async function persistLog(entry: LogEntry): Promise<void> {
  try {
    await insertLogToDatabase(entry);
  } catch {
    // DB logging failure — at least we have console output
  }

  if (entry.level === LogLevel.ERROR && shouldSendErrorEmail(entry.source)) {
    try {
      await sendErrorAlertEmail({
        source: entry.source,
        message: entry.message,
        stackTrace: entry.stackTrace,
        metadata: entry.metadata,
      });
    } catch {
      // Email failure is non-critical
    }
  }
}

// ---------------------------------------------------------------------------
// Core write function
// ---------------------------------------------------------------------------

function writeLog(
  level: LogLevel,
  source: string,
  message: string,
  options?: LogOptions,
): void {
  const entry: LogEntry = {
    level,
    source,
    message,
    metadata: options?.metadata,
    clientIp: options?.clientIp,
    stackTrace: options?.error?.stack ?? options?.stackTrace,
  };

  // Synchronous console output (always available)
  const consoleMethod = CONSOLE_METHODS[level];
  console[consoleMethod](`[${source}] ${message}`, options?.metadata ?? "");

  // Async: DB write + optional email (fire-and-forget)
  persistLog(entry);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const logger = {
  info(source: string, message: string, options?: LogOptions): void {
    writeLog(LogLevel.INFO, source, message, options);
  },

  warn(source: string, message: string, options?: LogOptions): void {
    writeLog(LogLevel.WARN, source, message, options);
  },

  error(source: string, message: string, options?: LogOptions): void {
    writeLog(LogLevel.ERROR, source, message, options);
  },
};

// ---------------------------------------------------------------------------
// Helper: convert unknown caught value to Error
// ---------------------------------------------------------------------------

export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value));
}
