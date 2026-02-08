import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Human-readable label for logging (e.g. "piston", "e2b") */
  label: string;
  /** Total number of attempts including the initial one (e.g. 3 = 1 try + 2 retries) */
  maxAttempts: number;
  /** Delay before the first retry (ms) */
  initialDelayMs: number;
  /** Maximum delay between retries (ms) */
  maxDelayMs: number;
  /** Multiplier applied to delay after each retry */
  backoffMultiplier: number;
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// ---------------------------------------------------------------------------
// Core retry function
// ---------------------------------------------------------------------------

/**
 * Execute an async operation with exponential backoff retries.
 *
 * The operation is called up to `maxAttempts` times. On each failure
 * (thrown error), the function waits with exponential backoff before
 * the next attempt. If all attempts fail, the last error is thrown.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  { label, maxAttempts, initialDelayMs, maxDelayMs, backoffMultiplier }: RetryOptions,
): Promise<T> {
  let lastError: Error = new Error("No attempts made");
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Last attempt — do not retry, just throw
      if (attempt === maxAttempts) {
        break;
      }

      logger.warn("retry", `Attempt ${attempt}/${maxAttempts} for "${label}" failed — retrying in ${delay}ms`, {
        metadata: {
          service: label,
          attempt,
          maxAttempts,
          delayMs: delay,
          error: lastError.message,
        },
      });

      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Pre-configured retry options per external service
// ---------------------------------------------------------------------------

export const retryConfigs = {
  /** Piston code execution API: 3 attempts, 500ms → 1s delays */
  piston: {
    label: "piston",
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 5_000,
    backoffMultiplier: 2,
  },

  /** E2B sandbox: 3 attempts, 1s → 2s delays */
  e2b: {
    label: "e2b",
    maxAttempts: 3,
    initialDelayMs: 1_000,
    maxDelayMs: 5_000,
    backoffMultiplier: 2,
  },

  /** Resend email: 3 attempts, 500ms → 1s delays */
  resend: {
    label: "resend",
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 3_000,
    backoffMultiplier: 2,
  },
} as const satisfies Record<string, RetryOptions>;
