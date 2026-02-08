import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 30 * 60 * 1_000; // 30 minutes
const CACHE_KEY_PREFIX = "exchange";

const FRANKFURTER_URLS = [
  "https://api.frankfurter.app",
  "https://api.frankfurter.dev",
];

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const base = searchParams.get("base") || "USD";
  const symbols = searchParams.get("symbols") || "BRL,EUR,GBP,JPY,CAD,AUD,CHF";

  // Frankfurter rejects requests where the base currency is also in the symbols list
  const filteredSymbols = symbols
    .split(",")
    .filter((symbol) => symbol !== base)
    .join(",");

  const cacheKey = `${CACHE_KEY_PREFIX}:${base}:${filteredSymbols}`;
  const cached = getCached<FrankfurterResponse>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  for (const baseUrl of FRANKFURTER_URLS) {
    try {
      const url = `${baseUrl}/latest?base=${base}&symbols=${filteredSymbols}`;
      const response = await fetch(url, { next: { revalidate: 1800 } });

      if (!response.ok) {
        continue;
      }

      const data: FrankfurterResponse = await response.json();
      setCache(cacheKey, data, CACHE_TTL_MS);

      return NextResponse.json(data);
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Exchange rate API unavailable" }, { status: 502 });
}
