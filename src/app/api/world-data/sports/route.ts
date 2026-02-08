import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 10 * 60 * 1_000; // 10 minutes
const CACHE_KEY_PREFIX = "sports";

interface SportsDbEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strThumb: string | null;
  strLeague: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
}

interface SportsDbResponse {
  events: SportsDbEvent[] | null;
}

const LEAGUE_IDS: Record<string, string> = {
  premier_league: "4328",
  la_liga: "4335",
  serie_a: "4332",
  brasileirao: "4351",
  nba: "4387",
  nfl: "4391",
  champions_league: "4480",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") || "premier_league";

  const leagueId = LEAGUE_IDS[league] || LEAGUE_IDS.premier_league;
  const cacheKey = `${CACHE_KEY_PREFIX}:${leagueId}`;
  const cached = getCached<SportsDbResponse>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${leagueId}`;
    const response = await fetch(url, { next: { revalidate: 600 } });

    if (!response.ok) {
      return NextResponse.json({ error: "Sports API unavailable" }, { status: 502 });
    }

    const data: SportsDbResponse = await response.json();
    setCache(cacheKey, data, CACHE_TTL_MS);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sports data" }, { status: 500 });
  }
}
