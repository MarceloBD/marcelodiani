"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface CoinPrice {
  usd: number;
  brl: number;
  usd_24h_change: number;
}

type CryptoData = Record<string, CoinPrice>;

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
] as const;

function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

function formatChange(change: number): { text: string; isPositive: boolean } {
  const isPositive = change >= 0;
  const text = `${isPositive ? "+" : ""}${change.toFixed(2)}%`;
  return { text, isPositive };
}

export function CryptoWidget() {
  const translation = useTranslations("worldData");

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as CryptoData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<CryptoData>({
    endpoint: "/api/world-data/crypto",
    pollingIntervalMs: 60 * 1_000,
    transform: identityTransform,
  });

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("crypto.description")}</div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-[10px] text-muted/60 font-mono px-2">
        <span>{translation("crypto.coin")}</span>
        <span className="text-right">{translation("crypto.priceUsd")}</span>
        <span className="text-right">{translation("crypto.priceBrl")}</span>
        <span className="text-right w-20">{translation("crypto.change24h")}</span>
      </div>

      {/* Coin rows */}
      <div className="space-y-1">
        {COINS.map(({ id, symbol, name }) => {
          const coin = data[id];
          if (!coin) return null;

          const { text: changeText, isPositive } = formatChange(coin.usd_24h_change);

          return (
            <div
              key={id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-card-border/20 rounded-lg px-3 py-2.5 hover:bg-card-border/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{symbol}</span>
                <span className="text-[10px] text-muted/60 hidden sm:inline">{name}</span>
              </div>
              <div className="text-xs font-mono text-foreground text-right">
                {formatPrice(coin.usd, "USD")}
              </div>
              <div className="text-xs font-mono text-muted text-right">
                {formatPrice(coin.brl, "BRL")}
              </div>
              <div
                className={`text-xs font-mono text-right w-20 ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {changeText}
              </div>
            </div>
          );
        })}
      </div>

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
