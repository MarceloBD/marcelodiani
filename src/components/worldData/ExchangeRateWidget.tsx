"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useWorldData } from "@/hooks/useWorldData";
import { WidgetError } from "./WidgetError";
import { WidgetLoading } from "./WidgetLoading";
import { WidgetLastUpdated } from "./WidgetLastUpdated";

interface ExchangeData {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const BASE_CURRENCIES = ["USD", "EUR", "GBP", "BRL"] as const;

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  BRL: "🇧🇷",
  JPY: "🇯🇵",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  CHF: "🇨🇭",
};

export function ExchangeRateWidget() {
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [amount, setAmount] = useState<string>("1");
  const translation = useTranslations("worldData");

  const endpoint = `/api/world-data/exchange?base=${baseCurrency}&symbols=BRL,EUR,GBP,JPY,CAD,AUD,CHF,USD`;

  const identityTransform = useCallback((raw: Record<string, unknown>) => raw as unknown as ExchangeData, []);

  const { data, isLoading, error, lastUpdated, refetch } = useWorldData<ExchangeData>({
    endpoint,
    pollingIntervalMs: 30 * 60 * 1_000,
    transform: identityTransform,
  });

  const convertedRates = useMemo(() => {
    if (!data?.rates) return [];
    const numericAmount = parseFloat(amount) || 1;

    return Object.entries(data.rates)
      .filter(([currency]) => currency !== baseCurrency)
      .map(([currency, rate]) => ({
        currency,
        flag: CURRENCY_FLAGS[currency] || "🏳️",
        rate,
        converted: rate * numericAmount,
      }));
  }, [data, amount, baseCurrency]);

  if (error) return <WidgetError message={error} onRetry={refetch} />;
  if (isLoading && !data) return <WidgetLoading />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted/70">{translation("exchange.description")}</div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted/70">{translation("exchange.base")}</label>
          <div className="flex gap-1">
            {BASE_CURRENCIES.map((currency) => (
              <button
                key={currency}
                onClick={() => setBaseCurrency(currency)}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                  baseCurrency === currency
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted bg-card-border/20 border border-transparent"
                }`}
              >
                {CURRENCY_FLAGS[currency]} {currency}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted/70">{translation("exchange.amount")}</label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            min="0"
            step="0.01"
            className="w-24 px-2 py-1 text-xs font-mono bg-card-border/20 border border-card-border rounded text-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* Rates grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {convertedRates.map(({ currency, flag, rate, converted }) => (
          <div key={currency} className="bg-card-border/20 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{flag}</span>
              <span className="text-xs font-semibold text-foreground">{currency}</span>
            </div>
            <div className="text-sm font-mono text-foreground">
              {converted.toFixed(2)}
            </div>
            <div className="text-[9px] text-muted/60 font-mono">
              1 {baseCurrency} = {rate.toFixed(4)} {currency}
            </div>
          </div>
        ))}
      </div>

      {data.date && (
        <div className="text-[9px] text-muted/50">
          {translation("exchange.source")} — {data.date}
        </div>
      )}

      <WidgetLastUpdated lastUpdated={lastUpdated} onRefresh={refetch} />
    </div>
  );
}
