"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";

// ============================================
// Types
// ============================================

interface Particle {
  id: number;
  segment: number;
  progress: number;
  containerIndex: number;
  workerIndex: number;
  isError: boolean;
  waitingInQueue: boolean;
  ticksInQueue: number;
}

interface SimulationDisplay {
  particles: Particle[];
  queueDepth: number;
  containerCount: number;
  workerCount: number;
  dlqCount: number;
  throughput: number;
  latency: number;
  errorRate: number;
}

// ============================================
// Constants
// ============================================

const TICK_MS = 150;
const TICKS_PER_SECOND = 1000 / TICK_MS;
const MAX_PARTICLES = 50;
const MIN_CONTAINERS = 1;
const MAX_CONTAINERS = 4;
const MIN_WORKERS = 1;
const MAX_WORKERS = 4;
const PARTICLE_SPEED = 0.25; // ~4 ticks per segment → 20 ticks travel + 4 queue = ~3.6s lifetime
const WORKER_PROCESS_RATE = 1.5; // per worker per tick → 4 workers = 6/tick = ~40/s
const MIN_QUEUE_TICKS = 3;

const SERVICES = {
  users: { x: 55, y: 140, width: 60, height: 40 },
  alb: { x: 165, y: 140, width: 65, height: 40 },
  sqs: { x: 490, y: 140, width: 70, height: 52 },
  database: { x: 780, y: 140, width: 60, height: 48 },
  cloudwatch: { x: 325, y: 265, width: 85, height: 26 },
};

function getContainerPosition(index: number) {
  return { x: 325, y: 78 + index * 38 };
}

function getWorkerPosition(index: number) {
  return { x: 650, y: 78 + index * 38 };
}

// ============================================
// Memoized SVG Sub-components
// ============================================

interface ServiceBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  count?: number;
  countLabel?: string;
  isError?: boolean;
  isHighlighted?: boolean;
}

const ServiceBox = memo(function ServiceBox({
  x, y, width, height, label, count, countLabel, isError, isHighlighted,
}: ServiceBoxProps) {
  const fillColor = isError
    ? "rgba(239, 68, 68, 0.1)"
    : isHighlighted
      ? "rgba(59, 130, 246, 0.15)"
      : "rgba(59, 130, 246, 0.06)";
  const strokeColor = isError
    ? "rgba(239, 68, 68, 0.3)"
    : isHighlighted
      ? "rgba(59, 130, 246, 0.4)"
      : "rgba(59, 130, 246, 0.2)";

  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={6}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
      />
      <text
        x={x}
        y={count !== undefined ? y - 4 : y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(228, 228, 231, 0.75)"
        fontSize={9}
        fontFamily="var(--font-mono), monospace"
      >
        {label}
      </text>
      {count !== undefined && (
        <text
          x={x}
          y={y + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isHighlighted ? "rgba(59, 130, 246, 0.9)" : "rgba(59, 130, 246, 0.7)"}
          fontSize={8}
          fontFamily="var(--font-mono), monospace"
          fontWeight="bold"
        >
          {count} {countLabel || ""}
        </text>
      )}
    </g>
  );
});

const ConnectionLine = memo(function ConnectionLine({
  x1, y1, x2, y2, animated = true, dashed = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  animated?: boolean; dashed?: boolean;
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(59, 130, 246, 0.15)"
      strokeWidth={1.5}
      strokeDasharray={animated ? "4 6" : dashed ? "3 5" : undefined}
      className={animated ? "architecture-flow-line" : undefined}
    />
  );
});

// ============================================
// Helper: get particle screen position
// ============================================

function getParticlePosition(
  particle: Particle,
  containerCount: number,
  workerCount: number,
  queueIndex: number,
): { x: number; y: number } {
  if (particle.waitingInQueue) {
    const column = queueIndex % 5;
    const row = Math.floor(queueIndex / 5);
    return {
      x: SERVICES.sqs.x - 14 + column * 7,
      y: SERVICES.sqs.y - 10 + row * 7,
    };
  }

  const containerPosition = getContainerPosition(particle.containerIndex % containerCount);
  const workerPosition = getWorkerPosition(particle.workerIndex % workerCount);

  const segments = [
    { startX: 85, startY: 140, endX: 133, endY: 140 },
    { startX: 198, startY: 140, endX: containerPosition.x - 40, endY: containerPosition.y },
    { startX: containerPosition.x + 40, startY: containerPosition.y, endX: 455, endY: 140 },
    { startX: 525, startY: 140, endX: workerPosition.x - 35, endY: workerPosition.y },
    { startX: workerPosition.x + 35, startY: workerPosition.y, endX: 750, endY: 140 },
  ];

  const seg = segments[particle.segment];
  if (!seg) return { x: 55, y: 140 };

  const progress = Math.min(particle.progress, 1);
  return {
    x: seg.startX + (seg.endX - seg.startX) * progress,
    y: seg.startY + (seg.endY - seg.startY) * progress,
  };
}

// ============================================
// Component
// ============================================

export function CloudFlowDiagram() {
  const translations = useTranslations("architecture.cloudFlow");
  const { elementReference: sectionReference, isInView } = useInView<HTMLDivElement>({ rootMargin: "100px" });

  // Controls
  const [isRunning, setIsRunning] = useState(true);
  const [requestRate, setRequestRate] = useState(5);
  const [autoScale, setAutoScale] = useState(true);
  const [failureMode, setFailureMode] = useState(false);

  // Sync controls to ref so interval doesn't restart
  const controlsRef = useRef({ requestRate, autoScale, failureMode });
  useEffect(() => {
    controlsRef.current = { requestRate, autoScale, failureMode };
  }, [requestRate, autoScale, failureMode]);

  // Non-rendered simulation counters
  const spawnAccumulatorRef = useRef(0);
  const processedWindowRef = useRef(0);
  const errorsWindowRef = useRef(0);
  const tickCountRef = useRef(0);
  const nextIdRef = useRef(0);

  // Rendered simulation state
  const [simulation, setSimulation] = useState<SimulationDisplay>({
    particles: [],
    queueDepth: 0,
    containerCount: 1,
    workerCount: 1,
    dlqCount: 0,
    throughput: 0,
    latency: 0,
    errorRate: 0,
  });

  // Reset simulation
  const handleReset = useCallback(() => {
    spawnAccumulatorRef.current = 0;
    processedWindowRef.current = 0;
    errorsWindowRef.current = 0;
    tickCountRef.current = 0;
    nextIdRef.current = 0;
    setSimulation({
      particles: [],
      queueDepth: 0,
      containerCount: 1,
      workerCount: 1,
      dlqCount: 0,
      throughput: 0,
      latency: 0,
      errorRate: 0,
    });
  }, []);

  // Simulation loop - pauses when off-screen to save CPU
  useEffect(() => {
    if (!isRunning || !isInView) return;

    const intervalId = setInterval(() => {
      const { requestRate, autoScale, failureMode } = controlsRef.current;
      tickCountRef.current += 1;

      setSimulation((previous) => {
        const particles = previous.particles.map((particle) => ({ ...particle }));
        let { containerCount, workerCount, dlqCount } = previous;
        let newProcessed = 0;
        let newErrors = 0;

        // 1. Increment wait time for queued particles
        for (const particle of particles) {
          if (particle.waitingInQueue) {
            particle.ticksInQueue += 1;
          }
        }

        // 2. Capture queue-eligible particles (waited long enough)
        const eligibleForProcessing = particles.filter(
          (particle) => particle.waitingInQueue && particle.ticksInQueue >= MIN_QUEUE_TICKS,
        );

        // 3. Move active particles forward
        for (const particle of particles) {
          if (particle.waitingInQueue) continue;
          particle.progress += PARTICLE_SPEED;
        }

        // 4. Handle segment completions
        for (let index = particles.length - 1; index >= 0; index--) {
          const particle = particles[index];
          if (particle.waitingInQueue || particle.progress < 1) continue;

          if (particle.segment === 4) {
            newProcessed += 1;
            particles.splice(index, 1);
          } else if (particle.segment === 2) {
            if (particle.isError) {
              dlqCount += 1;
              newErrors += 1;
              particles.splice(index, 1);
            } else {
              particle.waitingInQueue = true;
              particle.progress = 0;
            }
          } else {
            particle.segment += 1;
            particle.progress = 0;
          }
        }

        // 5. Workers process eligible particles
        const processCapacity = Math.max(1, Math.round(workerCount * WORKER_PROCESS_RATE));
        const toProcess = Math.min(processCapacity, eligibleForProcessing.length);

        for (let index = 0; index < toProcess; index++) {
          const eligibleParticle = eligibleForProcessing[index];
          const particleInArray = particles.find(
            (particle) => particle.id === eligibleParticle.id && particle.waitingInQueue,
          );
          if (particleInArray) {
            particleInArray.waitingInQueue = false;
            particleInArray.ticksInQueue = 0;
            particleInArray.segment = 3;
            particleInArray.progress = 0;
            particleInArray.workerIndex = Math.floor(Math.random() * workerCount);
          }
        }

        // 6. Spawn new particles — 1 particle = 1 request
        const spawnPerTick = requestRate / TICKS_PER_SECOND;
        spawnAccumulatorRef.current += spawnPerTick;

        while (spawnAccumulatorRef.current >= 1 && particles.length < MAX_PARTICLES) {
          spawnAccumulatorRef.current -= 1;
          const isError = failureMode && Math.random() < 0.2;
          particles.push({
            id: nextIdRef.current++,
            segment: 0,
            progress: 0,
            containerIndex: Math.floor(Math.random() * containerCount),
            workerIndex: Math.floor(Math.random() * workerCount),
            isError,
            waitingInQueue: false,
            ticksInQueue: 0,
          });
        }

        // 7. Calculate queue depth
        const queueDepth = particles.filter((particle) => particle.waitingInQueue).length;

        // 8. Auto-scaling (tick-modulo, no ref cooldowns)
        if (autoScale) {
          const tick = tickCountRef.current;

          // Containers scale with request rate every 10 ticks (~1.5s)
          // rate 1-8 → 1, 9-17 → 2, 18-26 → 3, 27-35 → 4
          if (tick % 10 === 0) {
            const targetContainers = Math.min(
              MAX_CONTAINERS,
              Math.max(MIN_CONTAINERS, Math.ceil(requestRate / 9)),
            );
            if (containerCount < targetContainers) {
              containerCount = containerCount + 1;
            } else if (containerCount > targetContainers) {
              containerCount = containerCount - 1;
            }
          }

          // Workers scale with request rate every 8 ticks (~1.2s)
          // Same thresholds as containers: rate 1-9 → 1, 10-18 → 2, 19-27 → 3, 28-35 → 4
          if (tick % 8 === 0 && tick > 10) {
            const targetWorkers = Math.min(
              MAX_WORKERS,
              Math.max(MIN_WORKERS, Math.ceil(requestRate / 9)),
            );
            if (workerCount < targetWorkers) {
              workerCount = workerCount + 1;
            } else if (workerCount > targetWorkers) {
              workerCount = workerCount - 1;
            }
          }
        }

        // 9. Metrics
        processedWindowRef.current += newProcessed;
        errorsWindowRef.current += newErrors;

        let { throughput, latency, errorRate } = previous;
        if (tickCountRef.current % 5 === 0) {
          throughput = Math.round(processedWindowRef.current * TICKS_PER_SECOND / 5);
          latency = Math.round(80 + queueDepth * 8 + Math.random() * 15);
          const totalInWindow = processedWindowRef.current + errorsWindowRef.current;
          errorRate = totalInWindow > 0
            ? Math.round((errorsWindowRef.current / totalInWindow) * 100)
            : 0;
          processedWindowRef.current = 0;
          errorsWindowRef.current = 0;
        }

        return {
          particles, queueDepth, containerCount, workerCount,
          dlqCount, throughput, latency, errorRate,
        };
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [isRunning, isInView]);

  const {
    particles, queueDepth, containerCount, workerCount,
    dlqCount, throughput, latency, errorRate,
  } = simulation;

  // Pre-compute queue indices in O(n) instead of O(n²) per render
  const queueIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 0;
    for (const particle of particles) {
      if (particle.waitingInQueue) {
        map.set(particle.id, counter++);
      }
    }
    return map;
  }, [particles]);

  return (
    <div ref={sectionReference}>
      <p className="text-[10px] text-muted/70 font-mono mb-4">
        {translations("description")}
      </p>

      {/* SVG Diagram */}
      <div className="rounded-lg border border-card-border/50 bg-background/30 overflow-hidden mb-4">
        <svg viewBox="0 0 850 300" className="w-full h-auto" role="img" aria-label="Cloud architecture flow diagram">
          {/* Connection lines: Users → ALB */}
          <ConnectionLine x1={85} y1={140} x2={133} y2={140} />

          {/* ALB → containers */}
          {Array.from({ length: containerCount }).map((_, index) => {
            const position = getContainerPosition(index);
            return (
              <g key={`conn-alb-c${index}`}>
                <ConnectionLine x1={198} y1={140} x2={position.x - 40} y2={position.y} />
                <ConnectionLine x1={position.x + 40} y1={position.y} x2={455} y2={140} />
              </g>
            );
          })}

          {/* SQS → workers */}
          {Array.from({ length: workerCount }).map((_, index) => {
            const position = getWorkerPosition(index);
            return (
              <g key={`conn-sqs-w${index}`}>
                <ConnectionLine x1={525} y1={140} x2={position.x - 35} y2={position.y} />
                <ConnectionLine x1={position.x + 35} y1={position.y} x2={750} y2={140} />
              </g>
            );
          })}

          {/* CloudWatch dashed */}
          <ConnectionLine x1={325} y1={78 + containerCount * 38 + 5} x2={325} y2={252} animated={false} dashed />

          {/* Static service boxes */}
          <ServiceBox {...SERVICES.users} label={translations("services.users")} />
          <ServiceBox {...SERVICES.alb} label={translations("services.alb")} isHighlighted />

          {/* Dynamic Fargate containers */}
          <AnimatePresence>
            {Array.from({ length: containerCount }).map((_, index) => {
              const position = getContainerPosition(index);
              return (
                <motion.g
                  key={`container-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ServiceBox
                    x={position.x} y={position.y} width={80} height={30}
                    label={`${translations("services.fargate")} ${index + 1}`}
                    isHighlighted
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          <text x={325} y={78 + containerCount * 38 + 5} textAnchor="middle" fill="rgba(161,161,170,0.5)" fontSize={7} fontFamily="var(--font-mono), monospace">
            {containerCount}/{MAX_CONTAINERS} {translations("tasks")}
          </text>

          {/* Queue fill bar */}
          {queueDepth > 0 && (
            <rect
              x={SERVICES.sqs.x - 30}
              y={SERVICES.sqs.y + 26 - Math.min(queueDepth, 16) * 2.5}
              width={60}
              height={Math.min(queueDepth, 16) * 2.5}
              rx={3}
              fill="rgba(59, 130, 246, 0.15)"
              className="transition-all duration-300"
            />
          )}

          <ServiceBox
            {...SERVICES.sqs}
            label={translations("services.sqs")}
            count={queueDepth}
            countLabel={translations("msgs")}
            isHighlighted={queueDepth > 3}
          />

          {/* Dynamic workers */}
          <AnimatePresence>
            {Array.from({ length: workerCount }).map((_, index) => {
              const position = getWorkerPosition(index);
              return (
                <motion.g
                  key={`worker-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <ServiceBox
                    x={position.x} y={position.y} width={70} height={30}
                    label={`${translations("services.workers")} ${index + 1}`}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          <text x={650} y={78 + workerCount * 38 + 5} textAnchor="middle" fill="rgba(161,161,170,0.5)" fontSize={7} fontFamily="var(--font-mono), monospace">
            {workerCount}/{MAX_WORKERS} {translations("workers")}
          </text>

          <ServiceBox {...SERVICES.database} label={translations("services.database")} />
          <ServiceBox {...SERVICES.cloudwatch} label={translations("services.cloudwatch")} />

          {/* DLQ */}
          {dlqCount > 0 && (
            <g>
              <rect x={530} y={185} width={55} height={22} rx={4} fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" strokeWidth={1} />
              <text x={557} y={193} textAnchor="middle" dominantBaseline="middle" fill="rgba(239,68,68,0.7)" fontSize={7} fontFamily="var(--font-mono), monospace">
                {translations("dlq")}
              </text>
              <text x={557} y={203} textAnchor="middle" dominantBaseline="middle" fill="rgba(239,68,68,0.5)" fontSize={7} fontFamily="var(--font-mono), monospace">
                {dlqCount}
              </text>
            </g>
          )}

          {/* Particles — plain SVG circles with CSS transitions (no framer-motion) */}
          {particles.map((particle) => {
            const queueIndex = queueIndexMap.get(particle.id) ?? 0;
            const position = getParticlePosition(particle, containerCount, workerCount, queueIndex);
            const color = particle.isError ? "#ef4444" : "#3b82f6";
            const glowColor = particle.isError ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)";

            return (
              <g key={particle.id} className="particle-group">
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={6}
                  fill={glowColor}
                />
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={particle.waitingInQueue ? 2.5 : 3}
                  fill={color}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls + Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="text-[10px] px-3 py-1.5 rounded border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer font-mono"
            >
              {isRunning ? `⏸ ${translations("pause")}` : `▶ ${translations("play")}`}
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] px-3 py-1.5 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/30 transition-colors cursor-pointer font-mono"
            >
              ↺ {translations("reset")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[9px] text-muted/70 font-mono w-24 shrink-0">
              {translations("requestRate")}
            </label>
            <input
              type="range"
              min={1}
              max={35}
              value={requestRate}
              onChange={(event) => setRequestRate(Number(event.target.value))}
              className="flex-1 h-1 bg-card-border rounded-full appearance-none cursor-pointer accent-accent"
            />
            <span className="text-[9px] text-accent font-mono w-10 text-right">{requestRate}{translations("perSecond")}</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScale}
                onChange={(event) => setAutoScale(event.target.checked)}
                className="accent-accent cursor-pointer"
              />
              <span className="text-[9px] text-muted/70 font-mono">{translations("autoScale")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={failureMode}
                onChange={(event) => setFailureMode(event.target.checked)}
                className="accent-accent cursor-pointer"
              />
              <span className="text-[9px] text-muted/70 font-mono">{translations("failureMode")}</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricCard label={translations("metrics.throughput")} value={`${throughput}${translations("perSecond")}`} />
          <MetricCard label={translations("metrics.latency")} value={`${latency}ms`} warning={latency > 200} />
          <MetricCard label={translations("metrics.queueDepth")} value={`${queueDepth} ${translations("msgs")}`} warning={queueDepth > 4} />
          <MetricCard label={translations("metrics.errorRate")} value={`${errorRate}%`} error={errorRate > 5} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Metric card
// ============================================

const MetricCard = memo(function MetricCard({
  label, value, warning, error,
}: {
  label: string; value: string; warning?: boolean; error?: boolean;
}) {
  const valueColor = error
    ? "text-red-400"
    : warning
      ? "text-yellow-400"
      : "text-accent";

  return (
    <div className="rounded-lg border border-card-border/50 bg-background/30 px-3 py-2">
      <div className="text-[8px] text-muted/60 font-mono uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-sm font-mono font-semibold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
});
