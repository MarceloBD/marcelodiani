import { logger, toError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";

const REPORT_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60_000, // 10 error reports per minute per IP
};

interface ErrorReport {
  message?: string;
  source?: string;
  stack?: string;
  url?: string;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    const { allowed } = checkRateLimit(`error-report:${clientIp}`, REPORT_RATE_LIMIT);
    if (!allowed) {
      return new Response(null, { status: 429 });
    }

    const body: ErrorReport = await request.json();
    const { message, source, stack, url } = body;

    logger.error(source || "client-error", message || "Unknown client error", {
      clientIp,
      stackTrace: stack,
      metadata: url ? { url } : undefined,
    });

    return new Response(null, { status: 204 });
  } catch (caughtError) {
    logger.error("report-error-api", "Failed to process error report", {
      error: toError(caughtError),
    });
    return new Response(null, { status: 500 });
  }
}
