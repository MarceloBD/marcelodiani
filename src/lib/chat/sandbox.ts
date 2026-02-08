import { Sandbox } from "@e2b/code-interpreter";
import { serviceBreakers } from "@/lib/circuit-breaker";
import { withRetry, retryConfigs } from "@/lib/retry";

const SANDBOX_TIMEOUT_MS = 30_000;
const CODE_EXECUTION_TIMEOUT_MS = 15_000;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

interface SandboxExecutionResult {
  success: boolean;
  imageBase64?: string;
  logs?: string;
  error?: string;
}

export async function executeInSandbox(
  pythonCode: string
): Promise<SandboxExecutionResult> {
  // Circuit breaker: fail fast if E2B has been unresponsive
  if (!serviceBreakers.e2b.isAvailable()) {
    return {
      success: false,
      error: "Sandbox service is temporarily unavailable. Please try again later.",
    };
  }

  let sandbox: Sandbox | null = null;

  try {
    // Retry sandbox creation (handles transient E2B service issues)
    sandbox = await withRetry(
      () => Sandbox.create({ timeoutMs: SANDBOX_TIMEOUT_MS }),
      retryConfigs.e2b,
    );

    const execution = await sandbox.runCode(pythonCode, {
      timeoutMs: CODE_EXECUTION_TIMEOUT_MS,
    });

    if (execution.error) {
      return {
        success: false,
        error: `${execution.error.name}: ${execution.error.value}`,
      };
    }

    const stdout = execution.logs.stdout.join("\n").trim();
    const stderr = execution.logs.stderr.join("\n").trim();

    // Look for chart image in results
    const chartResult = execution.results.find(
      (result) => result.png || result.svg
    );

    if (chartResult) {
      const imageData = chartResult.png ?? chartResult.svg ?? "";

      if (imageData.length > MAX_IMAGE_SIZE_BYTES) {
        return {
          success: false,
          error: "Generated image is too large (max 2MB).",
        };
      }

      serviceBreakers.e2b.onSuccess();
      return {
        success: true,
        imageBase64: imageData,
        logs: stdout || undefined,
      };
    }

    // No image but code ran successfully
    serviceBreakers.e2b.onSuccess();
    return {
      success: true,
      logs: stdout || stderr || "(no output)",
    };
  } catch (error) {
    serviceBreakers.e2b.onFailure();
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("timed out") || message.includes("timeout")) {
      return {
        success: false,
        error: "Code execution timed out (15s limit).",
      };
    }

    return {
      success: false,
      error: `Sandbox error: ${message}`,
    };
  } finally {
    if (sandbox) {
      await sandbox.kill().catch(() => {
        // Sandbox may already be dead — ignore cleanup errors
      });
    }
  }
}
