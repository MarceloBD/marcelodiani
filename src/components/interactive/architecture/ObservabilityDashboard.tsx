"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useInView } from "@/hooks/useInView";

// ============================================
// Types
// ============================================

interface MetricPoint {
  value: number;
  timestamp: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  service: string;
  message: string;
}

interface TraceSpan {
  service: string;
  startPercent: number;
  durationPercent: number;
  status: "ok" | "slow" | "error";
  latencyMs: number;
}

interface AlertRule {
  name: string;
  condition: string;
  status: "ok" | "warning" | "critical";
  currentValue: string;
}

// ============================================
// Constants
// ============================================

const TICK_MS = 800;
const MAX_METRIC_POINTS = 30;
const MAX_LOG_ENTRIES = 15;

const LOG_TEMPLATES: { level: LogEntry["level"]; service: string; message: string }[] = [
  { level: "INFO", service: "api-gateway", message: "GET /api/users 200 42ms" },
  { level: "INFO", service: "api-gateway", message: "POST /api/orders 201 156ms" },
  { level: "INFO", service: "auth-service", message: "Token validated for user_1234" },
  { level: "INFO", service: "user-service", message: "Cache hit for profile query" },
  { level: "INFO", service: "api-gateway", message: "GET /api/products 200 28ms" },
  { level: "INFO", service: "order-service", message: "Order #8821 processed successfully" },
  { level: "INFO", service: "payment-svc", message: "Payment confirmed txn_abc123" },
  { level: "WARN", service: "database", message: "Slow query detected: 234ms" },
  { level: "WARN", service: "user-service", message: "Cache miss, fetching from DB" },
  { level: "WARN", service: "api-gateway", message: "Rate limit approaching: 450/500 rpm" },
  { level: "WARN", service: "order-service", message: "Retry attempt 2/3 for payment call" },
];

const ERROR_LOG_TEMPLATES: typeof LOG_TEMPLATES = [
  { level: "ERROR", service: "api-gateway", message: "Connection timeout to auth-service" },
  { level: "ERROR", service: "database", message: "Connection pool exhausted" },
  { level: "ERROR", service: "auth-service", message: "JWT validation failed: token expired" },
  { level: "ERROR", service: "order-service", message: "Payment gateway returned 503" },
  { level: "ERROR", service: "user-service", message: "Unhandled exception in /profile" },
];

const TRACE_SERVICES = [
  { service: "API Gateway", baseStart: 0, baseDuration: 85 },
  { service: "Auth Service", baseStart: 8, baseDuration: 60 },
  { service: "User Service", baseStart: 20, baseDuration: 45 },
  { service: "Database", baseStart: 30, baseDuration: 30 },
  { service: "Cache", baseStart: 25, baseDuration: 8 },
];

// ============================================
// Sub-components
// ============================================

function MiniChart({
  data,
  color,
  warningThreshold,
  maxValue,
}: {
  data: MetricPoint[];
  color: string;
  warningThreshold?: number;
  maxValue: number;
}) {
  if (data.length < 2) return null;

  const chartWidth = 280;
  const chartHeight = 50;
  const stepX = chartWidth / (MAX_METRIC_POINTS - 1);

  const points = data.map((point, index) => {
    const x = index * stepX;
    const y = chartHeight - (point.value / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  const fillPoints = `0,${chartHeight} ${points} ${(data.length - 1) * stepX},${chartHeight}`;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-12" preserveAspectRatio="none">
      {/* Warning threshold line */}
      {warningThreshold !== undefined && (
        <line
          x1={0}
          y1={chartHeight - (warningThreshold / maxValue) * chartHeight}
          x2={chartWidth}
          y2={chartHeight - (warningThreshold / maxValue) * chartHeight}
          stroke="rgba(239, 68, 68, 0.2)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
      {/* Fill area */}
      <polygon
        points={fillPoints}
        fill={`${color}15`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest point dot */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) * stepX}
          cy={chartHeight - (data[data.length - 1].value / maxValue) * chartHeight}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
}

function LogStream({ logs }: { logs: LogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs.length]);

  const levelColors: Record<LogEntry["level"], string> = {
    INFO: "text-green-400/70",
    WARN: "text-yellow-400/70",
    ERROR: "text-red-400/70",
  };

  return (
    <div
      ref={containerRef}
      className="h-36 overflow-y-auto font-mono text-[8px] leading-relaxed space-y-px pr-1"
    >
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 py-px"
          >
            <span className="text-muted/40 shrink-0">{log.timestamp}</span>
            <span className={`${levelColors[log.level]} shrink-0 w-8`}>{log.level}</span>
            <span className="text-accent/50 shrink-0">[{log.service}]</span>
            <span className="text-foreground/60 truncate">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function TraceWaterfall({ spans, hasError }: { spans: TraceSpan[]; hasError: boolean }) {
  return (
    <div className="space-y-1.5">
      {spans.map((span, index) => {
        const barColor = span.status === "error"
          ? "bg-red-500/60"
          : span.status === "slow"
            ? "bg-yellow-500/50"
            : "bg-accent/50";

        return (
          <div key={span.service} className="flex items-center gap-2">
            <span className="text-[8px] text-muted/60 font-mono w-20 shrink-0 text-right truncate">
              {span.service}
            </span>
            <div className="flex-1 h-4 relative">
              <motion.div
                className={`absolute h-full rounded-sm ${barColor}`}
                style={{ left: `${span.startPercent}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${span.durationPercent}%` }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              />
              <span className="absolute right-0 top-0 text-[7px] text-muted/40 font-mono leading-4">
                {span.latencyMs}ms
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlertPanel({ alerts }: { alerts: AlertRule[] }) {
  const statusIcons: Record<AlertRule["status"], string> = {
    ok: "🟢",
    warning: "🟡",
    critical: "🔴",
  };

  const statusColors: Record<AlertRule["status"], string> = {
    ok: "text-green-400/70",
    warning: "text-yellow-400/70",
    critical: "text-red-400/70",
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.name} className="flex items-center gap-2">
          <span className="text-xs">{statusIcons[alert.status]}</span>
          <div className="flex-1">
            <div className="text-[9px] font-mono text-foreground/70">{alert.name}</div>
            <div className="text-[7px] font-mono text-muted/50">{alert.condition}</div>
          </div>
          <span className={`text-[9px] font-mono ${statusColors[alert.status]}`}>
            {alert.currentValue}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ObservabilityDashboard() {
  const translations = useTranslations("architecture.observability");
  const { elementReference: sectionReference, isInView } = useInView<HTMLDivElement>({ rootMargin: "100px" });

  const [isRunning, setIsRunning] = useState(true);
  const [errorMode, setErrorMode] = useState(false);

  const controlsRef = useRef({ errorMode });
  useEffect(() => {
    controlsRef.current = { errorMode };
  }, [errorMode]);

  // Metric histories
  const [cpuHistory, setCpuHistory] = useState<MetricPoint[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<MetricPoint[]>([]);
  const [throughputHistory, setThroughputHistory] = useState<MetricPoint[]>([]);

  // Log entries
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const nextLogIdRef = useRef(0);

  // Trace spans
  const [traceSpans, setTraceSpans] = useState<TraceSpan[]>([]);

  // Alerts
  const [alerts, setAlerts] = useState<AlertRule[]>([
    { name: translations("alertCpuUsage"), condition: "< 80%", status: "ok", currentValue: "45%" },
    { name: translations("alertP99Latency"), condition: "< 500ms", status: "ok", currentValue: "120ms" },
    { name: translations("alertErrorRate"), condition: "< 5%", status: "ok", currentValue: "0.3%" },
    { name: translations("alertMemory"), condition: "< 85%", status: "ok", currentValue: "62%" },
  ]);

  // Generate current time string
  function getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }

  // Simulation tick - pauses when off-screen to save CPU
  useEffect(() => {
    if (!isRunning || !isInView) return;

    const intervalId = setInterval(() => {
      const { errorMode } = controlsRef.current;
      const timestamp = Date.now();
      const timeString = getCurrentTime();

      // Update CPU metric
      setCpuHistory((previous) => {
        const baseCpu = errorMode ? 72 + Math.random() * 25 : 35 + Math.random() * 30;
        const newPoint = { value: Math.min(baseCpu, 99), timestamp };
        const updated = [...previous, newPoint];
        return updated.length > MAX_METRIC_POINTS ? updated.slice(-MAX_METRIC_POINTS) : updated;
      });

      // Update latency metric
      setLatencyHistory((previous) => {
        const baseLatency = errorMode ? 200 + Math.random() * 400 : 60 + Math.random() * 100;
        const newPoint = { value: baseLatency, timestamp };
        const updated = [...previous, newPoint];
        return updated.length > MAX_METRIC_POINTS ? updated.slice(-MAX_METRIC_POINTS) : updated;
      });

      // Update throughput metric — ranges match the flow simulator (max ~35 req/s)
      setThroughputHistory((previous) => {
        const baseThroughput = errorMode ? 5 + Math.random() * 10 : 18 + Math.random() * 17;
        const newPoint = { value: baseThroughput, timestamp };
        const updated = [...previous, newPoint];
        return updated.length > MAX_METRIC_POINTS ? updated.slice(-MAX_METRIC_POINTS) : updated;
      });

      // Generate log entry
      setLogs((previous) => {
        const templates = errorMode && Math.random() < 0.4
          ? ERROR_LOG_TEMPLATES
          : LOG_TEMPLATES;
        const template = templates[Math.floor(Math.random() * templates.length)];
        const newLog: LogEntry = {
          id: nextLogIdRef.current++,
          timestamp: timeString,
          level: template.level,
          service: template.service,
          message: template.message,
        };
        const updated = [...previous, newLog];
        return updated.length > MAX_LOG_ENTRIES ? updated.slice(-MAX_LOG_ENTRIES) : updated;
      });

      // Update trace spans
      setTraceSpans(
        TRACE_SERVICES.map((template) => {
          const jitter = Math.random() * 15;
          const errorMultiplier = errorMode ? 2 + Math.random() : 1;
          const duration = template.baseDuration * errorMultiplier + jitter;
          const isError = errorMode && Math.random() < 0.15;
          const isSlow = duration > template.baseDuration * 1.5;

          return {
            service: template.service,
            startPercent: template.baseStart + Math.random() * 5,
            durationPercent: Math.min(duration, 95 - template.baseStart),
            status: isError ? "error" : isSlow ? "slow" : "ok",
            latencyMs: Math.round(duration * 2.5),
          };
        }),
      );

      // Update alerts
      setAlerts((previousAlerts) => {
        const latestCpu = errorMode ? 75 + Math.random() * 20 : 40 + Math.random() * 25;
        const latestLatency = errorMode ? 300 + Math.random() * 300 : 80 + Math.random() * 80;
        const latestErrorRate = errorMode ? 4 + Math.random() * 8 : Math.random() * 2;
        const latestMemory = errorMode ? 70 + Math.random() * 20 : 50 + Math.random() * 20;

        return [
          {
            name: translations("alertCpuUsage"),
            condition: "< 80%",
            status: latestCpu > 80 ? "critical" : latestCpu > 65 ? "warning" : "ok",
            currentValue: `${Math.round(latestCpu)}%`,
          },
          {
            name: translations("alertP99Latency"),
            condition: "< 500ms",
            status: latestLatency > 500 ? "critical" : latestLatency > 300 ? "warning" : "ok",
            currentValue: `${Math.round(latestLatency)}ms`,
          },
          {
            name: translations("alertErrorRate"),
            condition: "< 5%",
            status: latestErrorRate > 5 ? "critical" : latestErrorRate > 3 ? "warning" : "ok",
            currentValue: `${latestErrorRate.toFixed(1)}%`,
          },
          {
            name: translations("alertMemory"),
            condition: "< 85%",
            status: latestMemory > 85 ? "critical" : latestMemory > 70 ? "warning" : "ok",
            currentValue: `${Math.round(latestMemory)}%`,
          },
        ];
      });
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [isRunning, isInView]);

  const latestCpu = cpuHistory.length > 0 ? Math.round(cpuHistory[cpuHistory.length - 1].value) : 0;
  const latestLatency = latencyHistory.length > 0 ? Math.round(latencyHistory[latencyHistory.length - 1].value) : 0;
  const latestThroughput = throughputHistory.length > 0 ? Math.round(throughputHistory[throughputHistory.length - 1].value) : 0;

  return (
    <div ref={sectionReference}>
      {/* Description */}
      <p className="text-[10px] text-muted/70 font-mono mb-4">
        {translations("description")}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="text-[10px] px-3 py-1.5 rounded border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer font-mono"
        >
          {isRunning ? `⏸ ${translations("pause")}` : `▶ ${translations("play")}`}
        </button>
        <button
          onClick={() => setErrorMode(!errorMode)}
          className={`text-[10px] px-3 py-1.5 rounded border transition-colors cursor-pointer font-mono ${
            errorMode
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-card-border text-muted hover:text-foreground hover:border-accent/30"
          }`}
        >
          {errorMode ? "🔴 " : "💥 "}{translations("triggerError")}
        </button>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metrics Panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-[9px] text-muted/60 font-mono uppercase tracking-wider">
            {translations("metrics")}
          </div>

          {/* CPU Chart */}
          <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-foreground/60">CPU Usage</span>
              <span className={`text-[9px] font-mono ${latestCpu > 80 ? "text-red-400" : latestCpu > 65 ? "text-yellow-400" : "text-green-400"}`}>
                {latestCpu}%
              </span>
            </div>
            <MiniChart data={cpuHistory} color="#3b82f6" warningThreshold={80} maxValue={100} />
          </div>

          {/* Latency Chart */}
          <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-foreground/60">{translations("p99Latency")}</span>
              <span className={`text-[9px] font-mono ${latestLatency > 500 ? "text-red-400" : latestLatency > 300 ? "text-yellow-400" : "text-green-400"}`}>
                {latestLatency}ms
              </span>
            </div>
            <MiniChart data={latencyHistory} color="#a855f7" warningThreshold={500} maxValue={700} />
          </div>

          {/* Throughput Chart */}
          <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono text-foreground/60">{translations("throughput")}</span>
              <span className="text-[9px] font-mono text-green-400">{latestThroughput} {translations("reqPerSecond")}</span>
            </div>
            <MiniChart data={throughputHistory} color="#22c55e" maxValue={45} />
          </div>
        </div>

        {/* Right column: Alerts + Traces */}
        <div className="space-y-4">
          {/* Alerts */}
          <div>
            <div className="text-[9px] text-muted/60 font-mono uppercase tracking-wider mb-2">
              {translations("alerts")}
            </div>
            <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
              <AlertPanel alerts={alerts} />
            </div>
          </div>

          {/* Trace Waterfall */}
          <div>
            <div className="text-[9px] text-muted/60 font-mono uppercase tracking-wider mb-2">
              {translations("traces")}
            </div>
            <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
              <TraceWaterfall spans={traceSpans} hasError={errorMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Log Stream */}
      <div className="mt-4">
        <div className="text-[9px] text-muted/60 font-mono uppercase tracking-wider mb-2">
          {translations("logs")}
        </div>
        <div className="rounded-lg border border-card-border/50 bg-background/30 p-3">
          <LogStream logs={logs} />
        </div>
      </div>
    </div>
  );
}
