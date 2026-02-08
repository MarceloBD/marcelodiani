import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const CACHE_TTL_MS = 30 * 60 * 1_000; // 30 minutes
const CACHE_KEY_PREFIX = "sports";
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

interface LeagueConfig {
  id: string;
  season: string;
}

const LEAGUE_CONFIG: Record<string, LeagueConfig> = {
  premier_league: { id: "4328", season: "2025-2026" },
  la_liga: { id: "4335", season: "2025-2026" },
  serie_a: { id: "4332", season: "2025-2026" },
  bundesliga: { id: "4331", season: "2025-2026" },
  ligue_1: { id: "4334", season: "2025-2026" },
  brasileirao: { id: "4351", season: "2025" },
};

interface StandingRaw {
  idStanding: string;
  intRank: string;
  strTeam: string;
  strBadge: string;
  strLeague: string;
  strSeason: string;
  strForm: string;
  strDescription: string;
  intPlayed: string;
  intWin: string;
  intLoss: string;
  intDraw: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
}

interface EventRaw {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strLeague: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intRound: string;
}

interface SportsResponse {
  table: StandingRaw[] | null;
  events: EventRaw[] | null;
}

function extractCurrentRound(standings: StandingRaw[]): number {
  if (standings.length === 0) return 1;

  // The max "intPlayed" among top teams gives us the latest round
  const maxPlayed = Math.max(
    ...standings.slice(0, 5).map((standing) => parseInt(standing.intPlayed, 10) || 0),
  );

  return maxPlayed || 1;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) return null;

    const text = await response.text();

    if (!text || text.length < 5) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const league = searchParams.get("league") || "premier_league";

  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.premier_league;
  const cacheKey = `${CACHE_KEY_PREFIX}:combined:${config.id}:${config.season}`;
  const cached = getCached<SportsResponse>(cacheKey);

  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch standings first (to get current round number)
    const standingsUrl = `${BASE_URL}/lookuptable.php?l=${config.id}&s=${config.season}`;
    const standingsData = await fetchJson<{ table: StandingRaw[] | null }>(standingsUrl);
    const table = standingsData?.table || null;

    // Derive current round from standings and fetch last round results
    let events: EventRaw[] | null = null;

    if (table && table.length > 0) {
      const currentRound = extractCurrentRound(table);
      const roundUrl = `${BASE_URL}/eventsround.php?id=${config.id}&r=${currentRound}&s=${config.season}`;
      const roundData = await fetchJson<{ events: EventRaw[] | null }>(roundUrl);
      events = roundData?.events || null;
    }

    const result: SportsResponse = { table, events };
    setCache(cacheKey, result, CACHE_TTL_MS);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sports data" }, { status: 500 });
  }
}
