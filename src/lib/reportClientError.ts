/**
 * Client-side utility to report errors to the server for logging.
 * Fire-and-forget — never throws or blocks the UI.
 */
export function reportClientError(error: Error, source: string): void {
  fetch("/api/report-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: error.message,
      source,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : "",
    }),
  }).catch(() => {
    // Silently fail — this is best-effort error reporting
  });
}
