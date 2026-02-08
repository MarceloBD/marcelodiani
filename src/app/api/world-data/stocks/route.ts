import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";
import { getDailyCached, setDailyCache } from "@/lib/daily-api-cache";

const MEMORY_CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour in-memory
const CACHE_KEY_PREFIX = "stocks";

interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  };
}

interface StockData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get("symbol") || "AAPL";
  const cacheKey = `${CACHE_KEY_PREFIX}:${symbol.toUpperCase()}`;

  // 1. Check in-memory cache first (fastest)
  const memoryCached = getCached<StockData>(cacheKey);
  if (memoryCached) {
    return NextResponse.json(memoryCached);
  }

  // 2. Check database cache (persists across restarts, updates once per day)
  const dbCached = await getDailyCached<StockData>(cacheKey);
  if (dbCached) {
    setCache(cacheKey, dbCached, MEMORY_CACHE_TTL_MS);
    return NextResponse.json(dbCached);
  }

  // 3. Fetch from external API (first call of the day per symbol)
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Alpha Vantage API key not configured", symbol, price: 0, open: 0, high: 0, low: 0, volume: 0, previousClose: 0, change: 0, changePercent: "0%" },
      { status: 200 }
    );
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Stock API unavailable" }, { status: 502 });
    }

    const raw: AlphaVantageQuote = await response.json();
    const quote = raw["Global Quote"];

    if (!quote || !quote["05. price"]) {
      return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
    }

    const data: StockData = {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      open: parseFloat(quote["02. open"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"], 10),
      previousClose: parseFloat(quote["08. previous close"]),
      change: parseFloat(quote["09. change"]),
      changePercent: quote["10. change percent"],
    };

    // Store in both caches
    setCache(cacheKey, data, MEMORY_CACHE_TTL_MS);
    await setDailyCache(cacheKey, data);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
