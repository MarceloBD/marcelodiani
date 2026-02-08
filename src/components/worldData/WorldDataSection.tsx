"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionTitle } from "../ui/SectionTitle";
import { WorldDataTab } from "@/enums/worldDataTab";

interface DataTab {
  key: WorldDataTab;
  labelKey: string;
  shortLabelKey: string;
  icon: string;
}

const DATA_TABS: DataTab[] = [
  { key: WorldDataTab.WEATHER, labelKey: "tabs.weather", shortLabelKey: "tabs.weatherShort", icon: "🌤" },
  { key: WorldDataTab.CRYPTO, labelKey: "tabs.crypto", shortLabelKey: "tabs.cryptoShort", icon: "₿" },
  { key: WorldDataTab.EXCHANGE, labelKey: "tabs.exchange", shortLabelKey: "tabs.exchangeShort", icon: "💱" },
  { key: WorldDataTab.GOLD, labelKey: "tabs.gold", shortLabelKey: "tabs.goldShort", icon: "🥇" },
  { key: WorldDataTab.STOCKS, labelKey: "tabs.stocks", shortLabelKey: "tabs.stocksShort", icon: "📈" },
  { key: WorldDataTab.SPORTS, labelKey: "tabs.sports", shortLabelKey: "tabs.sportsShort", icon: "⚽" },
  { key: WorldDataTab.FLIGHTS, labelKey: "tabs.flights", shortLabelKey: "tabs.flightsShort", icon: "✈" },
];

const WeatherWidget = dynamic(() => import("./WeatherWidget").then((m) => ({ default: m.WeatherWidget })), { ssr: false });
const CryptoWidget = dynamic(() => import("./CryptoWidget").then((m) => ({ default: m.CryptoWidget })), { ssr: false });
const ExchangeRateWidget = dynamic(() => import("./ExchangeRateWidget").then((m) => ({ default: m.ExchangeRateWidget })), { ssr: false });
const GoldPriceWidget = dynamic(() => import("./GoldPriceWidget").then((m) => ({ default: m.GoldPriceWidget })), { ssr: false });
const StockPriceWidget = dynamic(() => import("./StockPriceWidget").then((m) => ({ default: m.StockPriceWidget })), { ssr: false });
const SportsResultsWidget = dynamic(() => import("./SportsResultsWidget").then((m) => ({ default: m.SportsResultsWidget })), { ssr: false });
const FlightTrackerWidget = dynamic(() => import("./FlightTrackerWidget").then((m) => ({ default: m.FlightTrackerWidget })), { ssr: false });

const WIDGET_COMPONENTS: Record<WorldDataTab, React.ComponentType> = {
  [WorldDataTab.WEATHER]: WeatherWidget,
  [WorldDataTab.CRYPTO]: CryptoWidget,
  [WorldDataTab.EXCHANGE]: ExchangeRateWidget,
  [WorldDataTab.GOLD]: GoldPriceWidget,
  [WorldDataTab.STOCKS]: StockPriceWidget,
  [WorldDataTab.SPORTS]: SportsResultsWidget,
  [WorldDataTab.FLIGHTS]: FlightTrackerWidget,
};

export function WorldDataSection() {
  const [activeTab, setActiveTab] = useState<WorldDataTab>(WorldDataTab.WEATHER);
  const translation = useTranslations("worldData");

  const ActiveWidget = WIDGET_COMPONENTS[activeTab];

  return (
    <section id="world-data" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={translation("title")}
          subtitle={translation("subtitle")}
        />

        <ScrollReveal>
          <div className="glass-card rounded-xl overflow-hidden border border-card-border">
            {/* Tab navigation */}
            <div className="flex items-center justify-between px-4 py-2 bg-card-border/30 border-b border-card-border flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-muted font-mono ml-2">
                  {translation("windowTitle")}
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {DATA_TABS.map(({ key, labelKey, shortLabelKey, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      activeTab === key
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted/60 hover:text-muted border border-transparent"
                    }`}
                  >
                    <span className="text-xs">{icon}</span>
                    <span className="hidden sm:inline">{translation(labelKey)}</span>
                    <span className="sm:hidden">{translation(shortLabelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget content */}
            <div className="p-4 md:p-6">
              <ActiveWidget />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
