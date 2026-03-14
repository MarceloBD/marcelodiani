import { logger } from "@/lib/logger";

function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  return (
    vercelForwarded?.split(",")[0]?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    "Unknown"
  );
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    
    const city = request.headers.get("x-vercel-ip-city") || "Unknown";
    const region = request.headers.get("x-vercel-ip-country-region") || "Unknown";
    const country = request.headers.get("x-vercel-ip-country") || "Unknown";
    const latitude = parseFloat(request.headers.get("x-vercel-ip-latitude") || "0");
    const longitude = parseFloat(request.headers.get("x-vercel-ip-longitude") || "0");

    const decodedCity = city !== "Unknown" ? decodeURIComponent(city) : "Unknown";

    logger.info("geolocation-api", "Geolocation data retrieved", {
      clientIp,
      metadata: {
        city: decodedCity,
        region,
        country,
        latitude,
        longitude,
      },
    });

    return Response.json({
      ip: clientIp,
      city: decodedCity,
      region,
      country,
      isp: "Unknown",
      latitude,
      longitude,
    });
  } catch (caughtError) {
    const clientIp = getClientIp(request);
    
    logger.error("geolocation-api", "Failed to fetch geolocation data", {
      error: caughtError instanceof Error ? caughtError : new Error(String(caughtError)),
      clientIp,
    });

    return Response.json({
      ip: clientIp,
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      isp: "Unknown",
      latitude: 0,
      longitude: 0,
    });
  }
}
