import { type Instrumentation } from "next";

// ---------------------------------------------------------------------------
// Global error handler — catches ALL unhandled server-side errors
// ---------------------------------------------------------------------------
// This is a safety net for errors that escape route-level try-catch blocks.
// It ensures every server error is:
//   1. Visible in Vercel logs (console.error)
//   2. Sent via email alert (sendErrorAlertEmail)
// ---------------------------------------------------------------------------

function extractErrorDetails(error: unknown): {
  message: string;
  stack: string | undefined;
  digest: string | undefined;
} {
  if (error instanceof Error) {
    const digest = "digest" in error ? String((error as Error & { digest: string }).digest) : undefined;
    return { message: error.message, stack: error.stack, digest };
  }

  return { message: String(error), stack: undefined, digest: undefined };
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { message, stack, digest } = extractErrorDetails(error);
  const source = `${context.routeType}:${context.routePath}`;
  const errorMessage = `Unhandled ${request.method} error on ${request.path}: ${message}`;

  // Synchronous console output — always visible in Vercel logs/observability
  console.error(`[${source}] ${errorMessage}`, {
    digest,
    routerKind: context.routerKind,
    routeType: context.routeType,
    stack,
  });

  // Dynamic import to avoid module evaluation issues during instrumentation setup
  const { sendErrorAlertEmail } = await import("@/lib/email");

  // Await the email to guarantee delivery before the function terminates
  await sendErrorAlertEmail({
    source,
    message: errorMessage,
    stackTrace: stack,
    metadata: {
      path: request.path,
      method: request.method,
      routeType: context.routeType,
      routePath: context.routePath,
      routerKind: context.routerKind,
      digest,
    },
  });
};
