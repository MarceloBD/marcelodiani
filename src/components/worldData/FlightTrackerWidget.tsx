"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface FlightState {
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
  flights: FlightState[];
}

const REGIONS = [
  { key: "brazil", icon: "🇧🇷" },
  { key: "usa", icon: "🇺🇸" },
  { key: "europe", icon: "🇪🇺" },
  { key: "asia", icon: "🌏" },
] as const;

function formatAltitude(meters: number | null): string {
  if (meters === null) return "—";
  return `${Math.round(meters)}m`;
}

function formatSpeed(metersPerSecond: number | null): string {
  if (metersPerSecond === null) return "—";
  return `${Math.round(metersPerSecond * 3.6)} km/h`;
}

export function FlightTrackerWidget() {
  const [selectedRegion, setSelectedRegion] = useState("brazil");
  const translation = useTranslations("worldData");

  const endpoint = `/api/world-data/flights?region=${selectedRegion}`;

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as FlightsData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<FlightsData>({
    endpoint,
    pollingIntervalMs: 2 * 60 * 1_000,
    transform: identityTransform,
  });

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  const airborneFlights = data.flights.filter((flight) => !flight.onGround);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("flights.description")}</div>

      {/* Region selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {REGIONS.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => setSelectedRegion(key)}
            className={`px-3 py-1.5 text-[10px] font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
              selectedRegion === key
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/60 hover:text-muted bg-card-border/20 border border-transparent"
            }`}
          >
            <span>{icon}</span>
            <span>{translation(`flights.regions.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 bg-card-border/20 rounded-lg px-4 py-2.5">
        <div>
          <div className="text-[10px] text-muted/70">{translation("flights.totalAircraft")}</div>
          <div className="text-lg font-bold text-foreground">{data.totalAircraft.toLocaleString()}</div>
        </div>
        <div className="w-px h-8 bg-card-border/50" />
        <div>
          <div className="text-[10px] text-muted/70">{translation("flights.airborne")}</div>
          <div className="text-lg font-bold text-accent">{airborneFlights.length}</div>
        </div>
      </div>

      {/* Flight table */}
      {airborneFlights.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-muted/60 font-mono">
                <th className="text-left px-2 py-1.5">{translation("flights.callsign")}</th>
                <th className="text-left px-2 py-1.5">{translation("flights.origin")}</th>
                <th className="text-right px-2 py-1.5">{translation("flights.altitude")}</th>
                <th className="text-right px-2 py-1.5">{translation("flights.speed")}</th>
              </tr>
            </thead>
            <tbody>
              {airborneFlights.slice(0, 15).map((flight) => (
                <tr
                  key={flight.icao24}
                  className="border-t border-card-border/20 hover:bg-card-border/10 transition-colors"
                >
                  <td className="px-2 py-1.5 font-mono text-foreground">
                    {flight.callsign || flight.icao24}
                  </td>
                  <td className="px-2 py-1.5 text-muted/70">{flight.originCountry}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-foreground">
                    {formatAltitude(flight.baroAltitude)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-foreground">
                    {formatSpeed(flight.velocity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
