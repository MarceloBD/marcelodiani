"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../../ui/ScrollReveal";
import { SectionTitle } from "../../ui/SectionTitle";
import { CloudFlowDiagram } from "./CloudFlowDiagram";
import { ObservabilityDashboard } from "./ObservabilityDashboard";
import { MicroservicesScaler } from "./MicroservicesScaler";

type ArchitectureTab = "cloudFlow" | "observability" | "scaling";

const TABS: { key: ArchitectureTab; icon: string }[] = [
  { key: "cloudFlow", icon: "☁️" },
  { key: "observability", icon: "📊" },
  { key: "scaling", icon: "⚡" },
];

export function ArchitectureSimulator() {
  const translations = useTranslations("architecture");
  const [activeTab, setActiveTab] = useState<ArchitectureTab>("cloudFlow");

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("subtitle")}
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
                  {translations("title")}
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {TABS.map(({ key, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === key
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted/60 hover:text-muted border border-transparent"
                    }`}
                  >
                    <span>{icon}</span>
                    {translations(`tabs.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="p-4 md:p-6">
              {activeTab === "cloudFlow" && <CloudFlowDiagram />}
              {activeTab === "observability" && <ObservabilityDashboard />}
              {activeTab === "scaling" && <MicroservicesScaler />}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
