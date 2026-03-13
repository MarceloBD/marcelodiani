"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CloudFlowDiagram } from "../interactive/architecture/CloudFlowDiagram";
import { ObservabilityDashboard } from "../interactive/architecture/ObservabilityDashboard";
import { MicroservicesScaler } from "../interactive/architecture/MicroservicesScaler";

type ArchitectureTab = "cloudFlow" | "observability" | "scaling";

const TABS: { key: ArchitectureTab; icon: string }[] = [
  { key: "cloudFlow", icon: "☁️" },
  { key: "observability", icon: "📊" },
  { key: "scaling", icon: "⚡" },
];

export function ArchitectureSimulatorContent() {
  const translations = useTranslations("architecture");
  const [activeTab, setActiveTab] = useState<ArchitectureTab>("cloudFlow");

  return (
    <div className="space-y-4">
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

      <div>
        {activeTab === "cloudFlow" && <CloudFlowDiagram />}
        {activeTab === "observability" && <ObservabilityDashboard />}
        {activeTab === "scaling" && <MicroservicesScaler />}
      </div>
    </div>
  );
}
