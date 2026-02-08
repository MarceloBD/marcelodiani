"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import {
  type TransmissionLineMode,
  CABLE_TYPES,
  TL_MODE_INFO,
} from "@/data/transmissionLines";

const MODES: { key: TransmissionLineMode; label: string }[] = [
  { key: "propagation", label: "Propagation" },
  { key: "standingWave", label: "Standing Waves" },
  { key: "smithChart", label: "Smith Chart" },
  { key: "types", label: "Types" },
];

export function TransmissionLineVisualizer() {
  const [selectedMode, setSelectedMode] = useState<TransmissionLineMode>("propagation");

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedMode(key)}
            className={`px-3 py-1.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              selectedMode === key
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/60 hover:text-muted border border-card-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {selectedMode === "propagation" && <PropagationView />}
      {selectedMode === "standingWave" && <StandingWaveView />}
      {selectedMode === "smithChart" && <SmithChartView />}
      {selectedMode === "types" && <TypesView />}

      <SimulatorDetails data={TL_MODE_INFO[selectedMode]} />
    </div>
  );
}

// ===================== PROPAGATION VIEW =====================

function PropagationView() {
  const [lineImpedance, setLineImpedance] = useState(50);
  const [loadImpedance, setLoadImpedance] = useState(50);
  const [frequency, setFrequency] = useState(5);

  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const animationReference = useRef(0);
  const timeReference = useRef(0);

  const paramsReference = useRef({ lineImpedance, loadImpedance, frequency });
  useEffect(() => {
    paramsReference.current = { lineImpedance, loadImpedance, frequency };
  }, [lineImpedance, loadImpedance, frequency]);

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 260;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    const drawFrame = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = "rgba(0,0,0,0.3)";
      context.fillRect(0, 0, width, height);

      const { lineImpedance: z0, loadImpedance: zl, frequency: freq } = paramsReference.current;
      const gamma = (zl - z0) / (zl + z0); // reflection coefficient
      const time = timeReference.current;

      const padding = 40;
      const lineLength = width - 2 * padding;
      const midY = height / 2;
      const amplitude = 50;

      // Transmission line
      context.strokeStyle = "rgba(255,255,255,0.15)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(padding, midY);
      context.lineTo(padding + lineLength, midY);
      context.stroke();

      // Source label
      context.fillStyle = "rgba(255,255,255,0.4)";
      context.font = "9px monospace";
      context.textAlign = "center";
      context.fillText("Source", padding, height - 10);
      context.fillText(`Load (Z_L=${zl}Ω)`, padding + lineLength, height - 10);

      // Load impedance indicator
      context.fillStyle = "rgba(109,90,207,0.3)";
      context.fillRect(padding + lineLength - 4, midY - 40, 8, 80);
      context.strokeStyle = "rgba(109,90,207,0.6)";
      context.strokeRect(padding + lineLength - 4, midY - 40, 8, 80);

      // Incident wave (traveling right)
      context.beginPath();
      context.strokeStyle = "#6d5acf";
      context.lineWidth = 2;
      for (let i = 0; i <= lineLength; i++) {
        const x = padding + i;
        const normalizedPosition = i / lineLength;
        const waveY = amplitude * Math.sin(2 * Math.PI * freq * normalizedPosition - time * 3);
        if (i === 0) context.moveTo(x, midY - waveY);
        else context.lineTo(x, midY - waveY);
      }
      context.stroke();

      // Reflected wave (traveling left) if there's a mismatch
      if (Math.abs(gamma) > 0.01) {
        context.beginPath();
        context.strokeStyle = "#ef4444";
        context.lineWidth = 1.5;
        for (let i = 0; i <= lineLength; i++) {
          const x = padding + i;
          const normalizedPosition = i / lineLength;
          const reflectedAmplitude = amplitude * Math.abs(gamma);
          const waveY = reflectedAmplitude * Math.sin(2 * Math.PI * freq * normalizedPosition + time * 3);
          if (i === 0) context.moveTo(x, midY - waveY);
          else context.lineTo(x, midY - waveY);
        }
        context.stroke();
      }

      // Info text
      context.fillStyle = "rgba(255,255,255,0.5)";
      context.font = "9px monospace";
      context.textAlign = "left";
      context.fillText(`Z₀ = ${z0}Ω`, 10, 15);
      context.fillText(`Γ = ${gamma.toFixed(3)}`, 10, 27);
      context.fillText(`|Γ| = ${Math.abs(gamma).toFixed(3)}`, 10, 39);
      const vswr = Math.abs(gamma) < 0.999 ? (1 + Math.abs(gamma)) / (1 - Math.abs(gamma)) : Infinity;
      context.fillText(`VSWR = ${vswr === Infinity ? "∞" : vswr.toFixed(2)}`, 10, 51);

      // Legend
      context.textAlign = "right";
      context.strokeStyle = "#6d5acf";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(width - 100, 12);
      context.lineTo(width - 75, 12);
      context.stroke();
      context.fillText("Incident", width - 10, 15);

      if (Math.abs(gamma) > 0.01) {
        context.strokeStyle = "#ef4444";
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(width - 100, 24);
        context.lineTo(width - 75, 24);
        context.stroke();
        context.fillText("Reflected", width - 10, 27);
      }

      timeReference.current += 0.016;
      animationReference.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => cancelAnimationFrame(animationReference.current);
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Line Z₀</span>
            <span className="font-mono text-accent">{lineImpedance}Ω</span>
          </label>
          <input type="range" min={10} max={200} step={5} value={lineImpedance}
            onChange={(event) => setLineImpedance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Load ZL</span>
            <span className="font-mono text-accent">{loadImpedance}Ω</span>
          </label>
          <input type="range" min={0} max={300} step={5} value={loadImpedance}
            onChange={(event) => setLoadImpedance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Frequency</span>
            <span className="font-mono text-accent">{frequency}</span>
          </label>
          <input type="range" min={1} max={15} step={1} value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      <div ref={containerReference} className="rounded-lg overflow-hidden">
        <canvas ref={canvasReference} />
      </div>
    </>
  );
}

// ===================== STANDING WAVE VIEW =====================

function StandingWaveView() {
  const [lineImpedance, setLineImpedance] = useState(50);
  const [loadImpedance, setLoadImpedance] = useState(0); // short circuit default
  const [frequency, setFrequency] = useState(5);

  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const animationReference = useRef(0);
  const timeReference = useRef(0);

  const paramsReference = useRef({ lineImpedance, loadImpedance, frequency });
  useEffect(() => {
    paramsReference.current = { lineImpedance, loadImpedance, frequency };
  }, [lineImpedance, loadImpedance, frequency]);

  const gamma = loadImpedance !== lineImpedance
    ? (loadImpedance - lineImpedance) / (loadImpedance + lineImpedance)
    : 0;

  const vswr = Math.abs(gamma) < 0.999
    ? (1 + Math.abs(gamma)) / (1 - Math.abs(gamma))
    : Infinity;

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 260;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    const drawFrame = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = "rgba(0,0,0,0.3)";
      context.fillRect(0, 0, width, height);

      const params = paramsReference.current;
      const reflectionCoefficient = params.loadImpedance !== params.lineImpedance
        ? (params.loadImpedance - params.lineImpedance) / (params.loadImpedance + params.lineImpedance)
        : 0;
      const time = timeReference.current;

      const padding = 40;
      const lineLength = width - 2 * padding;
      const midY = height / 2;
      const amplitude = 50;

      // Center line
      context.strokeStyle = "rgba(255,255,255,0.1)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(padding, midY);
      context.lineTo(padding + lineLength, midY);
      context.stroke();

      // Standing wave envelope (max/min)
      context.beginPath();
      context.strokeStyle = "rgba(109,90,207,0.3)";
      context.lineWidth = 1;
      context.setLineDash([3, 3]);
      for (let i = 0; i <= lineLength; i++) {
        const normalizedPosition = i / lineLength;
        const envelopeMax = amplitude * (1 + Math.abs(reflectionCoefficient) * Math.abs(Math.cos(2 * Math.PI * params.frequency * normalizedPosition)));
        const x = padding + i;
        if (i === 0) context.moveTo(x, midY - envelopeMax);
        else context.lineTo(x, midY - envelopeMax);
      }
      context.stroke();

      context.beginPath();
      for (let i = 0; i <= lineLength; i++) {
        const normalizedPosition = i / lineLength;
        const envelopeMin = amplitude * (1 + Math.abs(reflectionCoefficient) * Math.abs(Math.cos(2 * Math.PI * params.frequency * normalizedPosition)));
        const x = padding + i;
        if (i === 0) context.moveTo(x, midY + envelopeMin);
        else context.lineTo(x, midY + envelopeMin);
      }
      context.stroke();
      context.setLineDash([]);

      // Resulting wave (incident + reflected)
      context.beginPath();
      context.strokeStyle = "#6d5acf";
      context.lineWidth = 2;
      for (let i = 0; i <= lineLength; i++) {
        const x = padding + i;
        const normalizedPosition = i / lineLength;
        const incident = amplitude * Math.sin(2 * Math.PI * params.frequency * normalizedPosition - time * 3);
        const reflected = amplitude * reflectionCoefficient * Math.sin(2 * Math.PI * params.frequency * normalizedPosition + time * 3);
        const total = incident + reflected;
        if (i === 0) context.moveTo(x, midY - total);
        else context.lineTo(x, midY - total);
      }
      context.stroke();

      // Load indicator
      context.fillStyle = "rgba(239,68,68,0.3)";
      context.fillRect(padding + lineLength - 4, midY - 50, 8, 100);
      context.strokeStyle = "rgba(239,68,68,0.6)";
      context.strokeRect(padding + lineLength - 4, midY - 50, 8, 100);

      // Labels
      context.fillStyle = "rgba(255,255,255,0.4)";
      context.font = "9px monospace";
      context.textAlign = "center";
      context.fillText("Source", padding, height - 10);
      context.fillText(`Load (${params.loadImpedance === 0 ? "Short" : params.loadImpedance + "Ω"})`, padding + lineLength, height - 10);

      timeReference.current += 0.016;
      animationReference.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => cancelAnimationFrame(animationReference.current);
  }, []);

  return (
    <>
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Line Z₀</span>
            <span className="font-mono text-accent">{lineImpedance}Ω</span>
          </label>
          <input type="range" min={10} max={200} step={5} value={lineImpedance}
            onChange={(event) => setLineImpedance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Load ZL</span>
            <span className="font-mono text-accent">{loadImpedance === 0 ? "Short" : `${loadImpedance}Ω`}</span>
          </label>
          <input type="range" min={0} max={300} step={5} value={loadImpedance}
            onChange={(event) => setLoadImpedance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Frequency</span>
            <span className="font-mono text-accent">{frequency}</span>
          </label>
          <input type="range" min={1} max={15} step={1} value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      <div ref={containerReference} className="rounded-lg overflow-hidden">
        <canvas ref={canvasReference} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Γ", value: gamma.toFixed(3) },
          { label: "VSWR", value: vswr === Infinity ? "∞" : vswr.toFixed(2) },
          { label: "Match", value: Math.abs(gamma) < 0.01 ? "Perfect" : Math.abs(gamma) < 0.3 ? "Good" : "Poor" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card-border/20 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-muted/70 mb-0.5">{label}</div>
            <div className="text-[11px] font-mono text-accent font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ===================== SMITH CHART VIEW =====================

const SMITH_SIZE = 400;
const SMITH_CENTER = SMITH_SIZE / 2;
const SMITH_RADIUS = 160;

function SmithChartView() {
  const [loadResistance, setLoadResistance] = useState(100);
  const [loadReactance, setLoadReactance] = useState(0);
  const [lineImpedance, setLineImpedance] = useState(50);

  // Normalized impedance
  const normalizedR = loadResistance / lineImpedance;
  const normalizedX = loadReactance / lineImpedance;

  // Reflection coefficient: Γ = (z - 1) / (z + 1) where z = r + jx
  const denominator = (normalizedR + 1) ** 2 + normalizedX ** 2;
  const gammaReal = ((normalizedR - 1) * (normalizedR + 1) + normalizedX ** 2) / denominator;
  const gammaImag = (2 * normalizedX) / denominator;
  const gammaMagnitude = Math.sqrt(gammaReal ** 2 + gammaImag ** 2);
  const gammaAngleDeg = Math.atan2(gammaImag, gammaReal) * (180 / Math.PI);

  // Map Γ to Smith chart pixel coordinates
  const pointX = SMITH_CENTER + gammaReal * SMITH_RADIUS;
  const pointY = SMITH_CENTER - gammaImag * SMITH_RADIUS;

  const vswr = gammaMagnitude < 0.999
    ? (1 + gammaMagnitude) / (1 - gammaMagnitude)
    : Infinity;

  // Constant-resistance circles: center at (r/(r+1), 0), radius 1/(r+1)
  const resistanceCircles = [0, 0.2, 0.5, 1, 2, 5];
  // Constant-reactance arcs: center at (1, 1/x), radius 1/|x|
  const reactanceArcs = [0.2, 0.5, 1, 2, 5];

  return (
    <>
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Load R</span>
            <span className="font-mono text-accent">{loadResistance}Ω</span>
          </label>
          <input type="range" min={0} max={300} step={5} value={loadResistance}
            onChange={(event) => setLoadResistance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Load jX</span>
            <span className="font-mono text-accent">{loadReactance >= 0 ? "+" : ""}{loadReactance}Ω</span>
          </label>
          <input type="range" min={-200} max={200} step={5} value={loadReactance}
            onChange={(event) => setLoadReactance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Z₀</span>
            <span className="font-mono text-accent">{lineImpedance}Ω</span>
          </label>
          <input type="range" min={10} max={200} step={5} value={lineImpedance}
            onChange={(event) => setLineImpedance(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto flex justify-center">
        <svg viewBox={`0 0 ${SMITH_SIZE} ${SMITH_SIZE}`} className="w-full max-w-[400px]">
          {/* Outer boundary circle (|Γ|=1) */}
          <circle cx={SMITH_CENTER} cy={SMITH_CENTER} r={SMITH_RADIUS}
            fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

          {/* Horizontal axis (real axis) */}
          <line x1={SMITH_CENTER - SMITH_RADIUS} y1={SMITH_CENTER} x2={SMITH_CENTER + SMITH_RADIUS} y2={SMITH_CENTER}
            stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />

          {/* Constant-resistance circles */}
          {resistanceCircles.map((r) => {
            const circleRadius = SMITH_RADIUS / (r + 1);
            const circleCenter = SMITH_CENTER + SMITH_RADIUS * (r / (r + 1));
            return (
              <g key={`r-${r}`}>
                <circle cx={circleCenter} cy={SMITH_CENTER} r={circleRadius}
                  fill="none" stroke="rgba(109,90,207,0.2)" strokeWidth={0.5} />
                <SmithChartClipCircle cx={circleCenter} cy={SMITH_CENTER} r={circleRadius} />
                {r > 0 && (
                  <text x={circleCenter - circleRadius + 3} y={SMITH_CENTER - 3}
                    className="fill-muted/30 text-[7px] font-mono">{r}</text>
                )}
              </g>
            );
          })}

          {/* Constant-reactance arcs (positive and negative) */}
          {reactanceArcs.map((x) => {
            const arcRadius = SMITH_RADIUS / x;
            const arcCenterX = SMITH_CENTER + SMITH_RADIUS;
            return (
              <g key={`x-${x}`}>
                {/* Positive reactance (inductive, above axis) */}
                <SmithReactanceArc cx={arcCenterX} cy={SMITH_CENTER - arcRadius} r={arcRadius} positive />
                {/* Negative reactance (capacitive, below axis) */}
                <SmithReactanceArc cx={arcCenterX} cy={SMITH_CENTER + arcRadius} r={arcRadius} positive={false} />
              </g>
            );
          })}

          {/* VSWR circle */}
          {gammaMagnitude > 0.01 && gammaMagnitude < 0.99 && (
            <circle cx={SMITH_CENTER} cy={SMITH_CENTER} r={gammaMagnitude * SMITH_RADIUS}
              fill="none" stroke="rgba(34,197,94,0.3)" strokeWidth={1} strokeDasharray="4 3" />
          )}

          {/* Impedance point */}
          <circle cx={pointX} cy={pointY} r={6} fill="rgba(239,68,68,0.6)" stroke="#ef4444" strokeWidth={1.5}>
            <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Line from center to point (Γ vector) */}
          <line x1={SMITH_CENTER} y1={SMITH_CENTER} x2={pointX} y2={pointY}
            stroke="rgba(239,68,68,0.4)" strokeWidth={1} strokeDasharray="3 2" />

          {/* Center marker */}
          <circle cx={SMITH_CENTER} cy={SMITH_CENTER} r={2} fill="rgba(34,197,94,0.6)" />

          {/* Labels */}
          <text x={SMITH_CENTER + SMITH_RADIUS + 5} y={SMITH_CENTER + 3}
            className="fill-muted/40 text-[7px] font-mono">∞</text>
          <text x={SMITH_CENTER - SMITH_RADIUS - 10} y={SMITH_CENTER + 3}
            className="fill-muted/40 text-[7px] font-mono">0</text>
          <text x={SMITH_CENTER + 4} y={SMITH_CENTER - SMITH_RADIUS - 4}
            className="fill-muted/40 text-[7px] font-mono">+jX</text>
          <text x={SMITH_CENTER + 4} y={SMITH_CENTER + SMITH_RADIUS + 10}
            className="fill-muted/40 text-[7px] font-mono">−jX</text>

          {/* Impedance value label */}
          <text x={pointX + 10} y={pointY - 8}
            className="fill-red-400 text-[8px] font-mono">
            z = {normalizedR.toFixed(2)} {normalizedX >= 0 ? "+" : ""}{normalizedX.toFixed(2)}j
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Z (normalized)", value: `${normalizedR.toFixed(2)} ${normalizedX >= 0 ? "+" : ""}${normalizedX.toFixed(2)}j` },
          { label: "|Γ|", value: gammaMagnitude.toFixed(3) },
          { label: "∠Γ", value: `${gammaAngleDeg.toFixed(1)}°` },
          { label: "VSWR", value: vswr === Infinity ? "∞" : vswr.toFixed(2) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card-border/20 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-muted/70 mb-0.5">{label}</div>
            <div className="text-[11px] font-mono text-accent font-semibold">{value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// Clip constant-r circle to the unit circle boundary
function SmithChartClipCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // This is just a visual helper — the circles are already drawn, this clips them
  // We rely on the outer boundary circle and SVG overflow:hidden for clipping
  return null;
}

// Draw reactance arc clipped to the unit circle
function SmithReactanceArc({ cx, cy, r, positive }: { cx: number; cy: number; r: number; positive: boolean }) {
  // Generate arc points clipped to unit circle
  const points: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const angle = positive
      ? -Math.PI / 2 + (i / steps) * Math.PI
      : Math.PI / 2 - (i / steps) * Math.PI;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);

    // Check if point is inside the unit circle
    const distFromCenter = Math.sqrt((px - SMITH_CENTER) ** 2 + (py - SMITH_CENTER) ** 2);
    if (distFromCenter <= SMITH_RADIUS + 1) {
      points.push(`${points.length === 0 ? "M" : "L"} ${px} ${py}`);
    }
  }

  if (points.length < 2) return null;
  return <path d={points.join(" ")} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth={0.5} />;
}

// ===================== TYPES VIEW =====================

function TypesView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {CABLE_TYPES.map((cable) => (
        <div key={cable.name} className="bg-card-border/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono text-accent font-semibold">{cable.name}</h4>
            <span className="text-[9px] font-mono text-muted bg-card-border/30 px-2 py-0.5 rounded">{cable.impedance}</span>
          </div>

          {/* Cross-section diagram */}
          <div className="flex justify-center py-2">
            <CableDiagram type={cable.diagram} />
          </div>

          <p className="text-[9px] text-muted leading-relaxed">{cable.description}</p>

          <div className="flex flex-wrap gap-1">
            {cable.applications.map((application) => (
              <span key={application} className="text-[8px] text-muted/70 bg-card-border/20 px-1.5 py-0.5 rounded">{application}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CableDiagram({ type }: { type: string }) {
  const size = 80;
  const center = size / 2;

  switch (type) {
    case "coaxial":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={35} fill="none" stroke="rgba(109,90,207,0.5)" strokeWidth={3} />
          <circle cx={center} cy={center} r={22} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.4)" strokeWidth={1} />
          <circle cx={center} cy={center} r={6} fill="rgba(109,90,207,0.6)" stroke="rgba(109,90,207,0.8)" strokeWidth={1} />
          <text x={center} y={size - 2} textAnchor="middle" className="fill-muted/40 text-[7px]">Coaxial</text>
        </svg>
      );
    case "microstrip":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={5} y={50} width={70} height={6} fill="rgba(109,90,207,0.5)" rx={1} />
          <rect x={5} y={30} width={70} height={18} fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth={0.5} rx={1} />
          <rect x={20} y={26} width={30} height={5} fill="rgba(109,90,207,0.7)" rx={1} />
          <text x={center} y={size - 2} textAnchor="middle" className="fill-muted/40 text-[7px]">Microstrip</text>
        </svg>
      );
    case "twistedPair":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {Array.from({ length: 5 }, (_, i) => {
            const x = 10 + i * 15;
            const offset = i % 2 === 0 ? -5 : 5;
            return (
              <g key={i}>
                <circle cx={x} cy={center + offset} r={5} fill="rgba(109,90,207,0.5)" stroke="rgba(109,90,207,0.7)" strokeWidth={1} />
                <circle cx={x} cy={center - offset} r={5} fill="rgba(59,130,246,0.4)" stroke="rgba(59,130,246,0.6)" strokeWidth={1} />
              </g>
            );
          })}
          <text x={center} y={size - 2} textAnchor="middle" className="fill-muted/40 text-[7px]">Twisted Pair</text>
        </svg>
      );
    case "waveguide":
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <rect x={10} y={15} width={60} height={40} fill="none" stroke="rgba(109,90,207,0.6)" strokeWidth={3} rx={3} />
          <rect x={15} y={20} width={50} height={30} fill="rgba(109,90,207,0.1)" />
          {/* Wave inside */}
          <path d="M 20 35 Q 30 20, 40 35 Q 50 50, 60 35" fill="none" stroke="rgba(109,90,207,0.4)" strokeWidth={1} />
          <text x={center} y={size - 2} textAnchor="middle" className="fill-muted/40 text-[7px]">Waveguide</text>
        </svg>
      );
    default:
      return null;
  }
}
