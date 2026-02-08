import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";
import { logger, toError } from "@/lib/logger";

const CACHE_TTL_MS = 60 * 1_000; // 1 minute
const CACHE_KEY = "crypto:prices";

const COIN_IDS = "bitcoin,ethereum,solana,cardano,dogecoin";

interface CoinGeckoPrice {
  usd: number;
  brl: number;
  usd_24h_change: number;
}

type CoinGeckoResponse = Record<string, CoinGeckoPrice>;

export async function GET() {
  const cached = getCached<CoinGeckoResponse>(CACHE_KEY);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS}&vs_currencies=usd,brl&include_24hr_change=true`;
    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Crypto API unavailable" }, { status: 502 });
    }

    const data: CoinGeckoResponse = await response.json();
    setCache(CACHE_KEY, data, CACHE_TTL_MS);

    return NextResponse.json(data);
  } catch (caughtError) {
    logger.error("crypto-api", "Failed to fetch crypto data", { error: toError(caughtError) });
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}
