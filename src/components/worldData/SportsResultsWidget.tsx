"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

/* ── Types ────────────────────────────────────────────────── */

interface Standing {
  idStanding: string;
  intRank: string;
  strTeam: string;
  strBadge: string;
  strForm: string;
  intPlayed: string;
  intWin: string;
  intLoss: string;
  intDraw: string;
  intPoints: string;
}

interface MatchEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  intRound: string;
}

interface SportsData {
  table: Standing[] | null;
  events: MatchEvent[] | null;
}

type SportsView = "standings" | "results";

/* ── Constants ────────────────────────────────────────────── */

const LEAGUES = [
  { key: "premier_league", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { key: "la_liga", icon: "🇪🇸" },
  { key: "serie_a", icon: "🇮🇹" },
  { key: "bundesliga", icon: "🇩🇪" },
  { key: "ligue_1", icon: "🇫🇷" },
  { key: "brasileirao", icon: "🇧🇷" },
] as const;

const FORM_COLORS: Record<string, string> = {
  W: "bg-green-500/80 text-white",
  D: "bg-yellow-500/80 text-white",
  L: "bg-red-500/80 text-white",
};

/* ── Sub-components ───────────────────────────────────────── */

function FormBadge({ form }: { form: string }) {
  if (!form) return null;

  const letters = form.split("").slice(-5);

  return (
    <div className="flex gap-0.5">
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={`w-4 h-4 flex items-center justify-center rounded text-[8px] font-bold ${FORM_COLORS[letter] || "bg-muted/30 text-muted/60"}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function StandingsTable({
  standings,
  translation,
}: {
  standings: Standing[];
  translation: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="grid grid-cols-[28px_1fr_32px_32px_32px_32px_36px_60px] gap-1 text-[9px] text-muted/50 font-mono px-2 pb-1 border-b border-card-border/30">
        <span>#</span>
        <span>{translation("sports.team")}</span>
        <span className="text-center">{translation("sports.played")}</span>
        <span className="text-center">{translation("sports.won")}</span>
        <span className="text-center">{translation("sports.drawn")}</span>
        <span className="text-center">{translation("sports.lost")}</span>
        <span className="text-center">{translation("sports.points")}</span>
        <span className="text-center">{translation("sports.form")}</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {standings.map((standing) => {
          const rank = parseInt(standing.intRank, 10);
          const isTopZone = rank <= 4;
          const isDangerZone = rank >= standings.length - 2;

          return (
            <div
              key={standing.idStanding}
              className={`grid grid-cols-[28px_1fr_32px_32px_32px_32px_36px_60px] gap-1 items-center px-2 py-1.5 rounded text-xs ${
                isTopZone
                  ? "bg-green-500/5 border-l-2 border-green-500/40"
                  : isDangerZone
                    ? "bg-red-500/5 border-l-2 border-red-500/40"
                    : "bg-card-border/10 border-l-2 border-transparent"
              }`}
            >
              <span className="font-mono text-muted/60 text-[10px]">
                {standing.intRank}
              </span>

              <div className="flex items-center gap-1.5 min-w-0">
                {standing.strBadge && (
                  <img
                    src={standing.strBadge}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                    loading="lazy"
                  />
                )}
                <span className="text-foreground truncate text-[11px]">
                  {standing.strTeam}
                </span>
              </div>

              <span className="text-center text-muted/70 font-mono text-[10px]">
                {standing.intPlayed}
              </span>
              <span className="text-center text-green-400/80 font-mono text-[10px]">
                {standing.intWin}
              </span>
              <span className="text-center text-yellow-400/80 font-mono text-[10px]">
                {standing.intDraw}
              </span>
              <span className="text-center text-red-400/80 font-mono text-[10px]">
                {standing.intLoss}
              </span>
              <span className="text-center text-foreground font-bold font-mono text-[11px]">
                {standing.intPoints}
              </span>

              <FormBadge form={standing.strForm} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchResults({
  events,
  translation,
}: {
  events: MatchEvent[];
  translation: ReturnType<typeof useTranslations>;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted/60 text-sm">
        {translation("sports.noResults")}
      </div>
    );
  }

  const roundLabel = events[0]?.intRound
    ? `${translation("sports.round")} ${events[0].intRound}`
    : "";

  return (
    <div className="space-y-2">
      {roundLabel && (
        <div className="text-[10px] text-muted/50 font-mono px-1">
          {roundLabel}
        </div>
      )}

      {events.map((event) => (
        <div
          key={event.idEvent}
          className="bg-card-border/20 rounded-lg px-3 py-2.5 flex items-center gap-2"
        >
          {/* Home team */}
          <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
            <span className="text-xs text-foreground truncate text-right">
              {event.strHomeTeam}
            </span>
            {event.strHomeTeamBadge && (
              <img
                src={event.strHomeTeamBadge}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
                loading="lazy"
              />
            )}
          </div>

          {/* Score */}
          <div className="bg-card-border/30 rounded px-2.5 py-1 font-mono text-sm text-foreground min-w-[56px] text-center">
            {event.intHomeScore !== null
              ? `${event.intHomeScore} - ${event.intAwayScore}`
              : "vs"}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            {event.strAwayTeamBadge && (
              <img
                src={event.strAwayTeamBadge}
                alt=""
                className="w-4 h-4 object-contain shrink-0"
                loading="lazy"
              />
            )}
            <span className="text-xs text-foreground truncate">
              {event.strAwayTeam}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Widget ──────────────────────────────────────────── */

export function SportsResultsWidget() {
  const [selectedLeague, setSelectedLeague] = useState("premier_league");
  const [activeView, setActiveView] = useState<SportsView>("standings");
  const translation = useTranslations("worldData");

  const endpoint = `/api/world-data/sports?league=${selectedLeague}`;

  const identityTransform = useCallback(
    (raw: Record<string, unknown>) => raw as unknown as SportsData,
    [],
  );

  const { data, isLoading, error, lastUpdated, refetch } =
    useWorldData<SportsData>({
      endpoint,
      pollingIntervalMs: 30 * 60 * 1_000,
      transform: identityTransform,
    });

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  const standings = data.table?.slice(0, 20) || [];
  const events = data.events || [];
  const hasStandings = standings.length > 0;
  const hasEvents = events.length > 0;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">
        {translation("sports.description")}
      </div>

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

      {/* View toggle (standings / results) */}
      {(hasStandings || hasEvents) && (
        <div className="flex gap-1 bg-card-border/20 rounded-lg p-0.5 w-fit">
          <button
            onClick={() => setActiveView("standings")}
            className={`px-3 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
              activeView === "standings"
                ? "bg-accent/20 text-accent"
                : "text-muted/60 hover:text-muted"
            }`}
          >
            {translation("sports.standingsTab")}
          </button>
          <button
            onClick={() => setActiveView("results")}
            className={`px-3 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
              activeView === "results"
                ? "bg-accent/20 text-accent"
                : "text-muted/60 hover:text-muted"
            }`}
          >
            {translation("sports.resultsTab")}
          </button>
        </div>
      )}

      {/* Content */}
      {activeView === "standings" && hasStandings && (
        <StandingsTable standings={standings} translation={translation} />
      )}

      {activeView === "standings" && !hasStandings && (
        <div className="text-center py-8 text-muted/60 text-sm">
          {translation("sports.noStandings")}
        </div>
      )}

      {activeView === "results" && (
        <MatchResults events={events} translation={translation} />
      )}

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
