"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";
import { type BalancingStrategyType } from "@/data/balancingStrategies";
import { StrategyDetails } from "./StrategyDetails";

interface Container {
  id: number;
  version: string;
  cpuUsage: number;
  activeConnections: number;
  isHealthy: boolean;
  isDeploying: boolean;
  requestsHandled: number;
}

interface TrafficDot {
  id: number;
  targetContainerIndex: number;
  progress: number;
}

// ============================================
// Constants
// ============================================

const TICK_MS = 200;
const MIN_CONTAINERS = 1;
const MAX_CONTAINERS = 8;
const MAX_TRAFFIC_DOTS = 10;
const CURRENT_VERSION = "v2.0";
const NEXT_VERSION = "v2.1";

// ============================================
// Helper functions
// ============================================

function createContainer(id: number, version: string): Container {
  return {
    id,
    version,
    cpuUsage: 10 + Math.random() * 20,
    activeConnections: 0,
    isHealthy: true,
    isDeploying: false,
    requestsHandled: 0,
  };
}

function getHealthColor(container: Container): string {
  if (container.isDeploying) return "text-purple-400";
  if (!container.isHealthy) return "text-red-400";
  if (container.cpuUsage > 80) return "text-yellow-400";
  return "text-green-400";
}

function getHealthDotColor(container: Container): string {
  if (container.isDeploying) return "bg-purple-400";
  if (!container.isHealthy) return "bg-red-400";
  if (container.cpuUsage > 80) return "bg-yellow-400";
  return "bg-green-400";
}

function getCpuBarColor(cpuUsage: number): string {
  if (cpuUsage > 80) return "bg-red-500/60";
  if (cpuUsage > 60) return "bg-yellow-500/50";
  return "bg-accent/50";
}

// ============================================
// Sub-components
// ============================================

function ContainerCard({
  container,
  isReceivingTraffic,
}: {
  container: Container;
  isReceivingTraffic: boolean;
}) {
  const translations = useTranslations("architecture.scaling");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-3 transition-colors ${
        container.isDeploying
          ? "border-purple-500/30 bg-purple-500/5"
          : !container.isHealthy
            ? "border-red-500/30 bg-red-500/5"
            : isReceivingTraffic
              ? "border-accent/40 bg-accent/10"
              : "border-card-border/50 bg-background/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${getHealthDotColor(container)}`} />
          <span className="text-[9px] font-mono text-foreground/70">
            {translations("container")} #{container.id}
          </span>
        </div>
        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
          container.version === NEXT_VERSION
            ? "bg-purple-500/20 text-purple-400"
            : "bg-card-border/50 text-muted/60"
        }`}>
          {container.version}
        </span>
      </div>

      {/* CPU bar */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[7px] font-mono text-muted/50">CPU</span>
          <span className={`text-[7px] font-mono ${getHealthColor(container)}`}>
            {Math.round(container.cpuUsage)}%
          </span>
        </div>
        <div className="h-1 bg-card-border/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getCpuBarColor(container.cpuUsage)}`}
            animate={{ width: `${Math.min(container.cpuUsage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-[7px] font-mono text-muted/50">
        <span>{container.activeConnections} {translations("conn")}</span>
        <span>{container.requestsHandled} {translations("req")}</span>
      </div>

      {/* Deploying indicator */}
      {container.isDeploying && (
        <div className="mt-1.5 text-[7px] font-mono text-purple-400/70 text-center">
          {translations("deploying")}
        </div>
      )}
    </motion.div>
  );
}

function LoadBalancerIcon({ activeConnections }: { activeConnections: number }) {
  const translations = useTranslations("architecture.scaling");

  return (
    <div className="flex flex-col items-center gap-1 mb-4">
      <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 flex items-center gap-2">
        <span className="text-xs">⚖️</span>
        <span className="text-[9px] font-mono text-accent">{translations("loadBalancer")}</span>
      </div>
      <div className="text-[8px] font-mono text-muted/50">
        {activeConnections} {translations("activeConnections")}
      </div>
      {/* Traffic distribution arrows */}
      <svg viewBox="0 0 200 20" className="w-48 h-5">
        <line x1={100} y1={0} x2={40} y2={20} stroke="rgba(59, 130, 246, 0.2)" strokeWidth={1} className="architecture-flow-line" strokeDasharray="3 4" />
        <line x1={100} y1={0} x2={100} y2={20} stroke="rgba(59, 130, 246, 0.2)" strokeWidth={1} className="architecture-flow-line" strokeDasharray="3 4" />
        <line x1={100} y1={0} x2={160} y2={20} stroke="rgba(59, 130, 246, 0.2)" strokeWidth={1} className="architecture-flow-line" strokeDasharray="3 4" />
      </svg>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function MicroservicesScaler() {
  const translations = useTranslations("architecture.scaling");
  const { elementReference: sectionReference, isInView } = useInView<HTMLDivElement>({ rootMargin: "100px" });

  // Controls
  const [isRunning, setIsRunning] = useState(true);
  const [loadPercent, setLoadPercent] = useState(40);
  const [strategy, setStrategy] = useState<BalancingStrategyType>("roundRobin");
  const [scaleMode, setScaleMode] = useState<"manual" | "auto">("auto");
  const [isDeploying, setIsDeploying] = useState(false);

  // Sync controls to ref
  const controlsRef = useRef({ loadPercent, strategy, scaleMode, isDeploying });
  useEffect(() => {
    controlsRef.current = { loadPercent, strategy, scaleMode, isDeploying };
  }, [loadPercent, strategy, scaleMode, isDeploying]);

  // State
  const [containers, setContainers] = useState<Container[]>([
    createContainer(1, CURRENT_VERSION),
    createContainer(2, CURRENT_VERSION),
    createContainer(3, CURRENT_VERSION),
  ]);
  const [trafficDots, setTrafficDots] = useState<TrafficDot[]>([]);

  const nextContainerIdRef = useRef(4);
  const nextDotIdRef = useRef(0);
  const roundRobinRef = useRef(0);
  const tickCountRef = useRef(0);
  const deployCooldownRef = useRef(0);
  const scaleCooldownRef = useRef(0);

  // Manual scale handlers
  const handleScaleUp = useCallback(() => {
    setContainers((previous) => {
      if (previous.length >= MAX_CONTAINERS) return previous;
      return [...previous, createContainer(nextContainerIdRef.current++, CURRENT_VERSION)];
    });
  }, []);

  const handleScaleDown = useCallback(() => {
    setContainers((previous) => {
      if (previous.length <= MIN_CONTAINERS) return previous;
      return previous.slice(0, -1);
    });
  }, []);

  // Rolling deploy
  const handleDeploy = useCallback(() => {
    if (isDeploying) return;
    setIsDeploying(true);
    deployCooldownRef.current = 0;
  }, [isDeploying]);

  // Simulation tick - pauses when off-screen to save CPU
  useEffect(() => {
    if (!isRunning || !isInView) return;

    const intervalId = setInterval(() => {
      const { loadPercent, strategy, scaleMode, isDeploying } = controlsRef.current;
      tickCountRef.current += 1;

      // Update containers
      setContainers((previousContainers) => {
        const updated = previousContainers.map((container) => {
          const loadFactor = loadPercent / 100;
          const baseCpu = container.isDeploying ? 60 + Math.random() * 30 : loadFactor * 70 + Math.random() * 20;
          const healthRoll = container.isDeploying ? 0.98 : 0.995;
          const newConnections = Math.round(loadFactor * 5 + Math.random() * 3);

          return {
            ...container,
            cpuUsage: Math.min(baseCpu, 99),
            activeConnections: newConnections,
            isHealthy: container.isHealthy ? Math.random() < healthRoll : Math.random() < 0.1,
            requestsHandled: container.requestsHandled + (container.isHealthy ? Math.round(Math.random() * 3) : 0),
          };
        });

        // Rolling deploy logic
        if (isDeploying) {
          deployCooldownRef.current += 1;
          const deployInterval = 8;
          const containerToUpgrade = updated.find(
            (container) => container.version === CURRENT_VERSION && !container.isDeploying,
          );

          if (containerToUpgrade && deployCooldownRef.current % deployInterval === 0) {
            containerToUpgrade.isDeploying = true;
          }

          // Complete deploying containers
          for (const container of updated) {
            if (container.isDeploying && deployCooldownRef.current > 5) {
              const isThisContainersDone = Math.random() < 0.3;
              if (isThisContainersDone) {
                container.isDeploying = false;
                container.version = NEXT_VERSION;
                container.isHealthy = true;
              }
            }
          }

          // Check if all deployed
          const allUpgraded = updated.every(
            (container) => container.version === NEXT_VERSION && !container.isDeploying,
          );
          if (allUpgraded) {
            controlsRef.current.isDeploying = false;
            setIsDeploying(false);
          }
        }

        // Auto-scaling
        if (scaleMode === "auto") {
          scaleCooldownRef.current = Math.max(0, scaleCooldownRef.current - 1);

          if (scaleCooldownRef.current <= 0) {
            const avgCpu = updated.reduce((sum, container) => sum + container.cpuUsage, 0) / updated.length;

            if (avgCpu > 70 && updated.length < MAX_CONTAINERS) {
              updated.push(createContainer(nextContainerIdRef.current++, isDeploying ? NEXT_VERSION : CURRENT_VERSION));
              scaleCooldownRef.current = 15;
            } else if (avgCpu < 30 && updated.length > MIN_CONTAINERS && tickCountRef.current > 20) {
              updated.pop();
              scaleCooldownRef.current = 20;
            }
          }
        }

        // Auto-recover unhealthy containers
        for (const container of updated) {
          if (!container.isHealthy && Math.random() < 0.05) {
            container.isHealthy = true;
            container.cpuUsage = 15;
          }
        }

        return updated;
      });

      // Update traffic dots
      setTrafficDots((previousDots) => {
        const updated = previousDots
          .map((dot) => ({ ...dot, progress: dot.progress + 0.15 }))
          .filter((dot) => dot.progress < 1);

        // Spawn new dots based on load
        const spawnChance = loadPercent / 100;
        if (Math.random() < spawnChance && updated.length < MAX_TRAFFIC_DOTS) {
          setContainers((currentContainers) => {
            if (currentContainers.length === 0) return currentContainers;

            let targetIndex: number;
            if (strategy === "roundRobin") {
              const healthyIndices = currentContainers
                .map((container, index) => (container.isHealthy ? index : -1))
                .filter((index) => index >= 0);

              if (healthyIndices.length > 0) {
                targetIndex = healthyIndices[roundRobinRef.current % healthyIndices.length];
                roundRobinRef.current += 1;
              } else {
                targetIndex = 0;
              }
            } else {
              // Least connections
              const healthyContainers = currentContainers
                .map((container, index) => ({ index, connections: container.activeConnections, healthy: container.isHealthy }))
                .filter((item) => item.healthy);

              if (healthyContainers.length > 0) {
                healthyContainers.sort((first, second) => first.connections - second.connections);
                targetIndex = healthyContainers[0].index;
              } else {
                targetIndex = 0;
              }
            }

            updated.push({
              id: nextDotIdRef.current++,
              targetContainerIndex: targetIndex,
              progress: 0,
            });

            return currentContainers;
          });
        }

        return updated;
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [isRunning, isInView]);

  const healthyCount = containers.filter((container) => container.isHealthy).length;
  const totalConnections = containers.reduce((sum, container) => sum + container.activeConnections, 0);
  const avgCpu = containers.length > 0
    ? Math.round(containers.reduce((sum, container) => sum + container.cpuUsage, 0) / containers.length)
    : 0;

  return (
    <div ref={sectionReference}>
      {/* Description */}
      <p className="text-[10px] text-muted/70 font-mono mb-4">
        {translations("description")}
      </p>

      {/* Load Balancer */}
      <LoadBalancerIcon activeConnections={totalConnections} />

      {/* Container Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
        <AnimatePresence mode="popLayout">
          {containers.map((container, index) => (
            <ContainerCard
              key={container.id}
              container={container}
              isReceivingTraffic={trafficDots.some(
                (dot) => dot.targetContainerIndex === index && dot.progress < 0.5,
              )}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Health summary */}
      <div className="flex items-center gap-4 mb-4 text-[9px] font-mono">
        <span className="text-muted/60">
          {healthyCount}/{containers.length} {translations("healthy")}
        </span>
        <span className="text-muted/60">
          Avg CPU: <span className={avgCpu > 70 ? "text-yellow-400" : "text-green-400"}>{avgCpu}%</span>
        </span>
        <span className="text-muted/60">
          {translations("strategy")}: <span className="text-accent">{translations(strategy)}</span>
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Load + Strategy */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="text-[10px] px-3 py-1.5 rounded border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer font-mono"
            >
              {isRunning ? `⏸ ${translations("pause")}` : `▶ ${translations("play")}`}
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="text-[10px] px-3 py-1.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer font-mono disabled:opacity-50"
            >
              {isDeploying ? `🔄 ${translations("deploying")}` : `🚀 ${translations("deploy")}`}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[9px] text-muted/70 font-mono w-12 shrink-0">
              {translations("load")}
            </label>
            <input
              type="range"
              min={5}
              max={100}
              value={loadPercent}
              onChange={(event) => setLoadPercent(Number(event.target.value))}
              className="flex-1 h-1 bg-card-border rounded-full appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[9px] text-accent font-mono w-8 text-right">{loadPercent}%</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[9px] text-muted/70 font-mono w-12 shrink-0">
              {translations("strategy")}
            </label>
            <select
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as BalancingStrategyType)}
              className="text-[9px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer font-mono"
            >
              <option value="roundRobin">{translations("roundRobin")}</option>
              <option value="leastConnections">{translations("leastConnections")}</option>
            </select>
          </div>
        </div>

        {/* Right: Scale controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-[9px] text-muted/70 font-mono w-16 shrink-0">
              {translations("scaleMode")}
            </label>
            <select
              value={scaleMode}
              onChange={(event) => setScaleMode(event.target.value as "manual" | "auto")}
              className="text-[9px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer font-mono"
            >
              <option value="auto">{translations("auto")}</option>
              <option value="manual">{translations("manual")}</option>
            </select>
          </div>

          {scaleMode === "manual" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleScaleDown}
                disabled={containers.length <= MIN_CONTAINERS}
                className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground transition-colors cursor-pointer font-mono disabled:opacity-30"
              >
                − Scale Down
              </button>
              <span className="text-[9px] font-mono text-accent">
                {containers.length}/{MAX_CONTAINERS}
              </span>
              <button
                onClick={handleScaleUp}
                disabled={containers.length >= MAX_CONTAINERS}
                className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground transition-colors cursor-pointer font-mono disabled:opacity-30"
              >
                + Scale Up
              </button>
            </div>
          )}

          {scaleMode === "auto" && (
            <div className="text-[8px] font-mono text-muted/50 space-y-0.5">
              <div>Scale up: Avg CPU &gt; 70% (max {MAX_CONTAINERS})</div>
              <div>Scale down: Avg CPU &lt; 30% (min {MIN_CONTAINERS})</div>
            </div>
          )}
        </div>
      </div>

      {/* Strategy details — advantages and disadvantages */}
      <StrategyDetails selectedStrategy={strategy} />
    </div>
  );
}
