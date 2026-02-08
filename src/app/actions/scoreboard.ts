"use server";

import { getDatabase, ensureScoreboardTable, ensureGameSessionsTable } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIdentifier } from "@/lib/client-identifier";
import { type InputEvent, type GameSessionResponse, TICK_RATE } from "@/components/interactive/platformGame/types";
import { replayGame } from "@/components/interactive/platformGame/simulation";
import { logger, toError } from "@/lib/logger";

export interface ScoreEntry {
  id: number;
  player_name: string;
  score: number;
  created_at: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

const MAX_NAME_LENGTH = 30;
const MIN_NAME_LENGTH = 1;
const MAX_SCORE = 99999;
const TOP_SCORES_LIMIT = 10;

/** 30 minutes -- maximum allowed duration for a single game session. */
const SESSION_EXPIRY_MS = 30 * 60 * 1000;

/** 5 seconds tolerance for network latency when comparing replay duration to real time. */
const TIME_TOLERANCE_MS = 5000;

/** Per-IP rate limit for game session creation. */
const SESSION_RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 };

/** Maximum input events accepted per submission (~55 min at 60Hz with ~2 events/tick). */
const MAX_INPUT_EVENTS = 200_000;

function sanitize(input: string): string {
  return input.trim().replace(/<[^>]*>/g, "").replace(/[^\w\s\-_.]/g, "");
}

function isValidInputEvent(value: unknown): value is InputEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as { tick?: unknown; key?: unknown; pressed?: unknown };

  return (
    typeof event.tick === "number" &&
    Number.isInteger(event.tick) &&
    event.tick >= 0 &&
    typeof event.key === "string" &&
    event.key.length > 0 &&
    event.key.length <= 20 &&
    typeof event.pressed === "boolean"
  );
}

// ---------------------------------------------------------------------------
// Public server actions
// ---------------------------------------------------------------------------

export async function getTopScores(): Promise<ScoreEntry[]> {
  const sql = getDatabase();
  if (!sql) return [];

  try {
    await ensureScoreboardTable();

    const rows = await sql`
      SELECT id, player_name, score, created_at
      FROM game_scoreboard
      ORDER BY score DESC
      LIMIT ${TOP_SCORES_LIMIT}
    `;

    return rows.map((row) => ({
      id: Number(row.id),
      player_name: String(row.player_name),
      score: Number(row.score),
      created_at: String(row.created_at),
    }));
  } catch (caughtError) {
    logger.error("scoreboard-action", "Failed to get top scores", {
      error: toError(caughtError),
    });
    return [];
  }
}

/**
 * Create a new game session. Returns a session ID and a seed that the client
 * uses to initialise the seeded PRNG. The seed is stored server-side so the
 * replay can be verified on score submission.
 */
export async function startGameSession(): Promise<GameSessionResponse> {
  const sql = getDatabase();
  if (!sql) throw new Error("Database not configured");

  // Per-IP rate limit
  const clientIp = await getClientIdentifier();
  const { allowed } = checkRateLimit(`game-session:${clientIp}`, SESSION_RATE_LIMIT);

  if (!allowed) {
    throw new Error("Too many game sessions. Please wait a moment.");
  }

  await ensureGameSessionsTable();

  const seed = Math.floor(Math.random() * 2_147_483_647);

  const rows = await sql`
    INSERT INTO game_sessions (seed)
    VALUES (${seed})
    RETURNING id, seed
  `;

  return {
    sessionId: String(rows[0].id),
    seed: Number(rows[0].seed),
  };
}

/**
 * Submit a score for verification. The server replays the game from the
 * session's seed using the submitted input events and compares the resulting
 * score. Only verified scores are saved to the leaderboard.
 */
export async function submitScore(
  sessionId: string,
  playerName: string,
  inputEvents: InputEvent[]
): Promise<ActionResult> {
  const clientIp = await getClientIdentifier();

  const sql = getDatabase();
  if (!sql) {
    return { success: false, error: "Database not configured" };
  }

  // --- Validate player name ---
  const cleanName = sanitize(playerName);

  if (!cleanName || cleanName.length < MIN_NAME_LENGTH || cleanName.length > MAX_NAME_LENGTH) {
    return { success: false, error: "Name must be 1-30 characters (letters, numbers, dashes)" };
  }

  // --- Validate input events structure ---
  if (!Array.isArray(inputEvents) || inputEvents.length > MAX_INPUT_EVENTS) {
    return { success: false, error: "Invalid replay data" };
  }

  for (const event of inputEvents) {
    if (!isValidInputEvent(event)) {
      return { success: false, error: "Invalid replay data" };
    }
  }

  // --- Fetch and validate session ---
  await ensureGameSessionsTable();

  const sessions = await sql`
    SELECT seed, created_at, completed
    FROM game_sessions
    WHERE id = ${sessionId}
  `;

  if (sessions.length === 0) {
    return { success: false, error: "Invalid session" };
  }

  const session = sessions[0];

  // Single-use: each session can only submit one score
  if (session.completed) {
    return { success: false, error: "Score already submitted for this session" };
  }

  // Session expiry: reject sessions older than 30 minutes
  const createdAt = new Date(String(session.created_at));
  const elapsedMs = Date.now() - createdAt.getTime();

  if (elapsedMs > SESSION_EXPIRY_MS) {
    return { success: false, error: "Session expired. Play again to save your score." };
  }

  // --- Replay verification ---
  const seed = Number(session.seed);
  const replayResult = replayGame(seed, inputEvents);

  // The game must have ended (player died)
  if (!replayResult.isDead) {
    logger.warn("scoreboard-action", "Suspicious submission: game did not end", {
      clientIp,
      metadata: { sessionId },
    });
    return { success: false, error: "Invalid replay — game did not end" };
  }

  // Time-elapsed validation: the replay's simulated duration must not exceed
  // the real wall-clock time since session creation (plus a small tolerance).
  // This prevents bots that pre-compute optimal inputs and submit instantly.
  const replayDurationMs = (replayResult.totalTicks / TICK_RATE) * 1000;

  if (replayDurationMs > elapsedMs + TIME_TOLERANCE_MS) {
    logger.warn("scoreboard-action", "Suspicious submission: invalid replay timing", {
      clientIp,
      metadata: { sessionId, replayDurationMs, elapsedMs },
    });
    return { success: false, error: "Invalid replay timing" };
  }

  const verifiedScore = replayResult.score;

  if (verifiedScore < 0 || verifiedScore > MAX_SCORE) {
    return { success: false, error: "Invalid score" };
  }

  // --- Save verified score ---
  try {
    await sql`UPDATE game_sessions SET completed = TRUE WHERE id = ${sessionId}`;

    await ensureScoreboardTable();

    await sql`
      INSERT INTO game_scoreboard (player_name, score)
      VALUES (${cleanName}, ${verifiedScore})
    `;

    logger.info("scoreboard-action", "Score submitted successfully", {
      clientIp,
      metadata: { sessionId, playerName: cleanName, score: verifiedScore },
    });

    return { success: true };
  } catch (caughtError) {
    logger.error("scoreboard-action", "Failed to save score", {
      error: toError(caughtError),
      clientIp,
      metadata: { sessionId },
    });
    return { success: false, error: "Failed to save score" };
  }
}
