import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 30 * 60 * 1_000; // 30 minutes
const CACHE_KEY_PREFIX = "exchange";

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const base = searchParams.get("base") || "USD";
  const symbols = searchParams.get("symbols") || "BRL,EUR,GBP,JPY,CAD,AUD,CHF";

  const cacheKey = `${CACHE_KEY_PREFIX}:${base}:${symbols}`;
  const cached = getCached<FrankfurterResponse>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://api.frankfurter.dev/latest?base=${base}&symbols=${symbols}`;
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Exchange rate API unavailable" }, { status: 502 });
    }

    const data: FrankfurterResponse = await response.json();
    setCache(cacheKey, data, CACHE_TTL_MS);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 });
  }
}
