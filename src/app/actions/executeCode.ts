"use server";

import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { logger, toError } from "@/lib/logger";
import { serviceBreakers } from "@/lib/circuit-breaker";
import { withRetry, retryConfigs } from "@/lib/retry";

interface ExecuteCodeRequest {
  language: string;
  code: string;
}

interface ExecuteCodeResult {
  success: boolean;
  output?: string;
  error?: string;
}

interface PistonStage {
  stdout: string;
  stderr: string;
  output: string;
  code: number;
  signal: string | null;
}

interface PistonResponse {
  language: string;
  version: string;
  run: PistonStage;
  compile?: PistonStage;
}

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const MAX_CODE_LENGTH = 10_000;
const EXECUTION_TIMEOUT_MS = 15_000;

const RATE_LIMIT_CONFIG = {
  maxRequests: 20,
  windowMs: 60_000, // 20 executions per minute
};

async function getClientIdentifier(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function executeCode({
  language,
  code,
}: ExecuteCodeRequest): Promise<ExecuteCodeResult> {
  const clientIp = await getClientIdentifier();
  const { allowed } = checkRateLimit(
    `playground:${clientIp}`,
    RATE_LIMIT_CONFIG
  );

  if (!allowed) {
    return {
      success: false,
      error: "Rate limit exceeded. Please wait a moment.",
    };
  }

  if (!code || code.length > MAX_CODE_LENGTH) {
    return {
      success: false,
      error: `Code must be between 1 and ${MAX_CODE_LENGTH} characters.`,
    };
  }

  // Circuit breaker: fail fast if Piston has been unresponsive
  if (!serviceBreakers.piston.isAvailable()) {
    return {
      success: false,
      error: "Code execution service is temporarily unavailable. Please try again later.",
    };
  }

  try {
    // Retry the HTTP call (handles transient network errors and 5xx responses)
    const response = await withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

      const fetchResponse = await fetch(PISTON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version: "*",
          files: [{ content: code }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        throw new Error(`Piston API error (${fetchResponse.status})`);
      }

      return fetchResponse;
    }, retryConfigs.piston);

    serviceBreakers.piston.onSuccess();
    const result: PistonResponse = await response.json();

    // Check compilation errors (for compiled languages — user code issues, not service)
    if (result.compile && result.compile.code !== 0) {
      return {
        success: false,
        error:
          result.compile.stderr ||
          result.compile.output ||
          "Compilation failed",
      };
    }

    // Check runtime errors (non-zero exit code — user code issues, not service)
    if (result.run.code !== 0) {
      return {
        success: false,
        error:
          result.run.stderr || result.run.output || "Runtime error",
      };
    }

    // Success
    const output = (
      result.run.stdout || result.run.output || ""
    ).trimEnd();
    return { success: true, output: output || "(no output)" };
  } catch (caughtError) {
    serviceBreakers.piston.onFailure();

    if (caughtError instanceof Error && caughtError.name === "AbortError") {
      logger.warn("code-execution", "Code execution timed out after retries", {
        clientIp,
        metadata: { language },
      });
      return { success: false, error: "Execution timed out (15s limit)" };
    }

    logger.error("code-execution", "Failed to connect to execution service after retries", {
      error: toError(caughtError),
      clientIp,
      metadata: { language },
    });
    return {
      success: false,
      error: "Failed to connect to execution service. Try again later.",
    };
  }
}
