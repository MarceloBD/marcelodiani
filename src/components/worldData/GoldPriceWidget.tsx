"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface GoldData {
  priceUsd: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
  error?: string;
}

export function GoldPriceWidget() {
  const translation = useTranslations("worldData");

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as GoldData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<GoldData>({
    endpoint: "/api/world-data/gold",
    pollingIntervalMs: 60 * 60 * 1_000,
    transform: identityTransform,
  });

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  if (data.error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">🥇</div>
          <p className="text-sm text-muted mb-2">{translation("gold.noApiKey")}</p>
          <p className="text-[10px] text-muted/60 max-w-sm">
            {translation("gold.noApiKeyDescription")}
          </p>
        </div>
      </div>
    );
  }

  const priceUsd = data.priceUsd ?? 0;
  const previousClose = data.previousClose ?? 0;
  const change = data.change ?? 0;
  const changePercent = data.changePercent ?? 0;
  const isPositive = change >= 0;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("gold.description")}</div>

      {/* Main price display */}
      <div className="flex items-center gap-6">
        <div className="text-4xl">🥇</div>
        <div>
          <div className="text-xs text-muted/60 mb-1">{translation("gold.pricePerOunce")}</div>
          <div className="text-3xl font-bold text-foreground">
            ${priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm font-mono mt-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "▲" : "▼"} ${Math.abs(change).toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-border/20 rounded-lg px-3 py-2.5">
          <div className="text-[10px] text-muted/70">{translation("gold.previousClose")}</div>
          <div className="text-sm font-mono text-foreground">
            ${previousClose.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-card-border/20 rounded-lg px-3 py-2.5">
          <div className="text-[10px] text-muted/70">{translation("gold.dailyChange")}</div>
          <div className={`text-sm font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <WidgetLastUpdated
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        updateFrequencyNote={translation("updatedDaily")}
      />
    </div>
  );
}
