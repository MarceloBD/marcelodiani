"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface SportEvent {
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
}

interface SportsData {
  events: SportEvent[] | null;
}

const LEAGUES = [
  { key: "premier_league", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { key: "la_liga", icon: "🇪🇸" },
  { key: "serie_a", icon: "🇮🇹" },
  { key: "brasileirao", icon: "🇧🇷" },
  { key: "champions_league", icon: "🏆" },
  { key: "nba", icon: "🏀" },
  { key: "nfl", icon: "🏈" },
] as const;

export function SportsResultsWidget() {
  const [selectedLeague, setSelectedLeague] = useState("premier_league");
  const translation = useTranslations("worldData");

  const endpoint = `/api/world-data/sports?league=${selectedLeague}`;

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as SportsData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<SportsData>({
    endpoint,
    pollingIntervalMs: 10 * 60 * 1_000,
    transform: identityTransform,
  });

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  const events = data.events?.slice(0, 10) || [];

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("sports.description")}</div>

      {/* League selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {LEAGUES.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setSelectedLeague(key)}
            className={`px-2.5 py-1.5 text-[10px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedLeague === key
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/60 hover:text-muted bg-card-border/20 border border-transparent"
            }`}
          >
            <span>{icon}</span>
            <span>{translation(`sports.leagues.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {events.length === 0 ? (
        <div className="text-center py-8 text-muted/60 text-sm">
          {translation("sports.noResults")}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.idEvent}
              className="bg-card-border/20 rounded-lg px-3 py-2.5 flex items-center gap-3"
            >
              {/* Date */}
              <div className="text-[9px] text-muted/50 font-mono w-16 shrink-0">
                {new Date(event.dateEvent).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {/* Home team */}
              <div className="flex-1 text-right">
                <span className="text-xs text-foreground truncate inline-block max-w-[120px]">
                  {event.strHomeTeam}
                </span>
              </div>

              {/* Score */}
              <div className="bg-card-border/30 rounded px-2.5 py-1 font-mono text-sm text-foreground min-w-[60px] text-center">
                {event.intHomeScore !== null
                  ? `${event.intHomeScore} - ${event.intAwayScore}`
                  : "vs"}
              </div>

              {/* Away team */}
              <div className="flex-1">
                <span className="text-xs text-foreground truncate inline-block max-w-[120px]">
                  {event.strAwayTeam}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
