import { logger, toError } from "@/lib/logger";

interface IpLocationResponse {
  ip: string;
  success: boolean;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  connection: {
    isp: string;
  };
}

function getClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  return (
    vercelForwarded?.split(",")[0]?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    ""
  );
}

export async function GET(request: Request) {
  try {
    const clientIp = getClientIp(request);
    
    const url = clientIp 
      ? `https://ipwho.is/${clientIp}`
      : "https://ipwho.is/";

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ipwho.is returned status ${response.status}`);
    }

    const data = (await response.json()) as IpLocationResponse;

    if (!data.success) {
      throw new Error("ipwho.is returned success: false");
    }

    return Response.json({
      ip: data.ip,
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      country: data.country || "Unknown",
      isp: data.connection?.isp || "Unknown",
      latitude: data.latitude,
      longitude: data.longitude,
    });
  } catch (caughtError) {
    logger.error("geolocation-api", "Failed to fetch geolocation data", {
      error: toError(caughtError),
    });

    return Response.json(
      {
        ip: "Unknown",
        city: "Unknown",
        region: "Unknown",
        country: "Unknown",
        isp: "Unknown",
        latitude: 0,
        longitude: 0,
      },
      { status: 500 }
    );
  }
}
