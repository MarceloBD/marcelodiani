import { logger } from "@/lib/logger";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json();

    const { fingerprint, userAgent } = body;

    logger.info("security-awareness", "Security awareness section visited", {
      clientIp,
      metadata: {
        fingerprint,
        userAgent,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    logger.error("security-awareness-api", "Failed to log security awareness visit", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return Response.json({ success: false }, { status: 500 });
  }
}
