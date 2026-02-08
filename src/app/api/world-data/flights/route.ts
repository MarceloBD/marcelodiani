import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 2 * 60 * 1_000; // 2 minutes
const CACHE_KEY_PREFIX = "flights";

interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  velocity: number | null;
  trueTrack: number | null;
  onGround: boolean;
}

interface FlightsData {
  totalAircraft: number;
  flights: OpenSkyState[];
}

const REGION_BOUNDS: Record<string, { lamin: string; lomin: string; lamax: string; lomax: string }> = {
  brazil: { lamin: "-34", lomin: "-74", lamax: "5", lomax: "-34" },
  europe: { lamin: "35", lomin: "-10", lamax: "60", lomax: "30" },
  usa: { lamin: "25", lomin: "-125", lamax: "50", lomax: "-65" },
  asia: { lamin: "10", lomin: "100", lamax: "45", lomax: "145" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const region = searchParams.get("region") || "brazil";

  const bounds = REGION_BOUNDS[region] || REGION_BOUNDS.brazil;
  const cacheKey = `${CACHE_KEY_PREFIX}:${region}`;
  const cached = getCached<FlightsData>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;
    const response = await fetch(url, { next: { revalidate: 120 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Flight API unavailable" }, { status: 502 });
    }

    const raw = await response.json();
    const states: unknown[][] = raw.states || [];

    const flights: OpenSkyState[] = states.slice(0, 50).map((state) => ({
      icao24: String(state[0] || ""),
      callsign: state[1] ? String(state[1]).trim() : null,
      originCountry: String(state[2] || ""),
      longitude: state[5] as number | null,
      latitude: state[6] as number | null,
      baroAltitude: state[7] as number | null,
      velocity: state[9] as number | null,
      trueTrack: state[10] as number | null,
      onGround: Boolean(state[8]),
    }));

    const data: FlightsData = {
      totalAircraft: states.length,
      flights,
    };

    setCache(cacheKey, data, CACHE_TTL_MS);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch flight data" }, { status: 500 });
  }
}
