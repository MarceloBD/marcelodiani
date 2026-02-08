"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

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
  error?: string;
}

const POPULAR_SYMBOLS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "PETR4.SAO", name: "Petrobras" },
] as const;

export function StockPriceWidget() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [customSymbol, setCustomSymbol] = useState("");
  const translation = useTranslations("worldData");

  const endpoint = `/api/world-data/stocks?symbol=${encodeURIComponent(selectedSymbol)}`;

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as StockData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<StockData>({
    endpoint,
    pollingIntervalMs: 30 * 60 * 1_000,
    transform: identityTransform,
  });

  const handleCustomSearch = () => {
    const trimmed = customSymbol.trim().toUpperCase();
    if (trimmed) {
      setSelectedSymbol(trimmed);
      setCustomSymbol("");
    }
  };

  if (data?.error && data.error.includes("not configured")) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-sm text-muted mb-2">{translation("stocks.noApiKey")}</p>
          <p className="text-[10px] text-muted/60 max-w-sm">
            {translation("stocks.noApiKeyDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (error) return <WidgetError message={error} onRetry={refetch} />;

  const isPositive = (data?.change ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("stocks.description")}</div>

      {/* Symbol selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {POPULAR_SYMBOLS.map(({ symbol, name }) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
              selectedSymbol === symbol
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/60 hover:text-muted bg-card-border/20 border border-transparent"
            }`}
            title={name}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Custom search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customSymbol}
          onChange={(event) => setCustomSymbol(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleCustomSearch()}
          placeholder={translation("stocks.searchPlaceholder")}
          className="flex-1 px-3 py-1.5 text-xs font-mono bg-card-border/20 border border-card-border rounded text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
        />
        <button
          onClick={handleCustomSearch}
          className="px-3 py-1.5 text-xs bg-accent/20 text-accent border border-accent/30 rounded hover:bg-accent/30 transition-colors cursor-pointer"
        >
          {translation("stocks.search")}
        </button>
      </div>

      {isLoading && !data && <WidgetLoading />}

      {/* Stock data */}
      {data && !data.error && (
        <>
          <div className="bg-card-border/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-foreground">{data.symbol}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                {isPositive ? "▲" : "▼"} {data.changePercent}
              </span>
            </div>

            <div className="text-2xl font-bold text-foreground mb-1">
              ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}{data.change.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-card-border/20 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted/70">{translation("stocks.open")}</div>
              <div className="text-xs font-mono text-foreground">${data.open.toFixed(2)}</div>
            </div>
            <div className="bg-card-border/20 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted/70">{translation("stocks.high")}</div>
              <div className="text-xs font-mono text-foreground">${data.high.toFixed(2)}</div>
            </div>
            <div className="bg-card-border/20 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted/70">{translation("stocks.low")}</div>
              <div className="text-xs font-mono text-foreground">${data.low.toFixed(2)}</div>
            </div>
            <div className="bg-card-border/20 rounded-lg px-3 py-2">
              <div className="text-[10px] text-muted/70">{translation("stocks.volume")}</div>
              <div className="text-xs font-mono text-foreground">{(data.volume / 1_000_000).toFixed(1)}M</div>
            </div>
          </div>
        </>
      )}

      <WidgetLastUpdated
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        updateFrequencyNote={translation("updatedDaily")}
      />
    </div>
  );
}
