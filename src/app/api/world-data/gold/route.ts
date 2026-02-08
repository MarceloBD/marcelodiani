import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";
import { getDailyCached, setDailyCache } from "@/lib/daily-api-cache";

const MEMORY_CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour in-memory
const CACHE_KEY = "gold:xau_usd";

interface GoldApiResponse {
  price: number;
  prev_close_price: number;
  change: number;
  change_percent: number;
  currency: string;
  metal: string;
  timestamp: number;
}

interface GoldData {
  priceUsd: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export async function GET() {
  // 1. Check in-memory cache first (fastest)
  const memoryCached = getCached<GoldData>(CACHE_KEY);
  if (memoryCached) {
    return NextResponse.json(memoryCached);
  }

  // 2. Check database cache (persists across restarts, updates once per day)
  const dbCached = await getDailyCached<GoldData>(CACHE_KEY);
  if (dbCached) {
    setCache(CACHE_KEY, dbCached, MEMORY_CACHE_TTL_MS);
    return NextResponse.json(dbCached);
  }

  // 3. Fetch from external API (first call of the day)
  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gold API key not configured", priceUsd: 0, previousClose: 0, change: 0, changePercent: 0, timestamp: 0 },
      { status: 200 }
    );
  }

  try {
    const response = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Gold API unavailable" }, { status: 502 });
    }

    const raw: GoldApiResponse = await response.json();

    const data: GoldData = {
      priceUsd: raw.price ?? 0,
      previousClose: raw.prev_close_price ?? 0,
      change: raw.change ?? 0,
      changePercent: raw.change_percent ?? 0,
      timestamp: raw.timestamp ?? 0,
    };

    // Store in both caches
    setCache(CACHE_KEY, data, MEMORY_CACHE_TTL_MS);
    await setDailyCache(CACHE_KEY, data);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gold data" }, { status: 500 });
  }
}
