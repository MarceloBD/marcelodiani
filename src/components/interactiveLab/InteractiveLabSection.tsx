"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionTitle } from "../ui/SectionTitle";

type LabSimulator =
  | "calculus"
  | "physics"
  | "transmissionLine"
  | "opticalFiber"
  | "logicGates"
  | "neuralNetwork"
  | "database"
  | "concurrency"
  | "controlSystem"
  | "transistor"
  | "circuit"
  | "signal";

interface LabTab {
  key: LabSimulator;
  label: string;
  shortLabel: string;
}

const LAB_TABS: LabTab[] = [
  { key: "calculus", label: "Calculus", shortLabel: "Calc" },
  { key: "physics", label: "Physics", shortLabel: "Phys" },
  { key: "transmissionLine", label: "Transmission Lines", shortLabel: "TL" },
  { key: "opticalFiber", label: "Optical Fiber", shortLabel: "Fiber" },
  { key: "logicGates", label: "Logic Gates", shortLabel: "Logic" },
  { key: "neuralNetwork", label: "Neural Networks", shortLabel: "AI" },
  { key: "database", label: "Databases", shortLabel: "DB" },
  { key: "concurrency", label: "Concurrency", shortLabel: "Conc" },
  { key: "controlSystem", label: "Control Systems", shortLabel: "PID" },
  { key: "transistor", label: "Transistors", shortLabel: "Trans" },
  { key: "circuit", label: "Circuit Simulator", shortLabel: "Circuit" },
  { key: "signal", label: "Signal Visualizer", shortLabel: "Signal" },
];

const CalculusVisualizer = dynamic(() => import("./CalculusVisualizer").then((m) => ({ default: m.CalculusVisualizer })), { ssr: false });
const PhysicsSimulator = dynamic(() => import("./PhysicsSimulator").then((m) => ({ default: m.PhysicsSimulator })), { ssr: false });
const TransmissionLineVisualizer = dynamic(() => import("./TransmissionLineVisualizer").then((m) => ({ default: m.TransmissionLineVisualizer })), { ssr: false });
const OpticalFiberVisualizer = dynamic(() => import("./OpticalFiberVisualizer").then((m) => ({ default: m.OpticalFiberVisualizer })), { ssr: false });
const LogicGateSimulator = dynamic(() => import("./LogicGateSimulator").then((m) => ({ default: m.LogicGateSimulator })), { ssr: false });
const NeuralNetworkVisualizer = dynamic(() => import("./NeuralNetworkVisualizer").then((m) => ({ default: m.NeuralNetworkVisualizer })), { ssr: false });
const DatabaseVisualizer = dynamic(() => import("./DatabaseVisualizer").then((m) => ({ default: m.DatabaseVisualizer })), { ssr: false });
const ConcurrencyVisualizer = dynamic(() => import("./ConcurrencyVisualizer").then((m) => ({ default: m.ConcurrencyVisualizer })), { ssr: false });
const ControlSystemVisualizer = dynamic(() => import("./ControlSystemVisualizer").then((m) => ({ default: m.ControlSystemVisualizer })), { ssr: false });
const TransistorArchitectureVisualizer = dynamic(() => import("./TransistorArchitectureVisualizer").then((m) => ({ default: m.TransistorArchitectureVisualizer })), { ssr: false });
const CircuitSimulator = dynamic(() => import("../interactive/CircuitSimulator").then((m) => ({ default: m.CircuitSimulator })), { ssr: false });
const SignalVisualizer = dynamic(() => import("../interactive/SignalVisualizer").then((m) => ({ default: m.SignalVisualizer })), { ssr: false });

const SIMULATOR_COMPONENTS: Record<LabSimulator, React.ComponentType> = {
  calculus: CalculusVisualizer,
  physics: PhysicsSimulator,
  transmissionLine: TransmissionLineVisualizer,
  opticalFiber: OpticalFiberVisualizer,
  logicGates: LogicGateSimulator,
  neuralNetwork: NeuralNetworkVisualizer,
  database: DatabaseVisualizer,
  concurrency: ConcurrencyVisualizer,
  controlSystem: ControlSystemVisualizer,
  transistor: TransistorArchitectureVisualizer,
  circuit: CircuitSimulator,
  signal: SignalVisualizer,
};

export function InteractiveLabSection() {
  const [activeSimulator, setActiveSimulator] = useState<LabSimulator>("calculus");
  const t = useTranslations("interactiveLab");

  const ActiveComponent = SIMULATOR_COMPONENTS[activeSimulator];

  return (
    <section id="lab" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={t("title")}
          subtitle={t("subtitle")}
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
                  Interactive Lab
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {LAB_TABS.map(({ key, label, shortLabel }) => (
                  <button
                    key={key}
                    onClick={() => setActiveSimulator(key)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                      activeSimulator === key
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted/60 hover:text-muted border border-transparent"
                    }`}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulator content */}
            <div className="p-4 md:p-6">
              <ActiveComponent />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
