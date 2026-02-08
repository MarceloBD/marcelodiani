"use client";

import { useState, useMemo } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import {
  type IntegrationMethod,
  type CalculusMode,
  type CoordinateSystem,
  type FourierTarget,
  QUADRATIC_FUNCTION,
  INTEGRATION_METHODS,
  COORDINATE_SYSTEMS,
  FOURIER_TARGETS,
  CALCULUS_MODE_DETAILS,
  computeFourierSum,
  targetWaveform,
} from "@/data/calculusMethods";

const MODES: { key: CalculusMode; label: string }[] = [
  { key: "riemann", label: "Riemann" },
  { key: "volume", label: "Volume" },
  { key: "fourier", label: "Fourier" },
];

export function CalculusVisualizer() {
  const [activeMode, setActiveMode] = useState<CalculusMode>("riemann");

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveMode(key)}
            className={`px-3 py-1.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              activeMode === key
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-muted/60 hover:text-muted border border-card-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeMode === "riemann" && <RiemannView />}
      {activeMode === "volume" && <VolumeView />}
      {activeMode === "fourier" && <FourierView />}

      <SimulatorDetails data={CALCULUS_MODE_DETAILS[activeMode]} />
    </div>
  );
}

// ===================== RIEMANN VIEW =====================

const METHODS: { key: IntegrationMethod; label: string }[] = [
  { key: "leftRiemann", label: "Left" },
  { key: "rightRiemann", label: "Right" },
  { key: "midpoint", label: "Midpoint" },
  { key: "trapezoidal", label: "Trapezoid" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 280;
const PADDING = 40;
const PLOT_WIDTH = SVG_WIDTH - 2 * PADDING;
const PLOT_HEIGHT = SVG_HEIGHT - 2 * PADDING;

function mapToSvg(x: number, y: number, xMin: number, xMax: number, yMin: number, yMax: number) {
  const svgX = PADDING + ((x - xMin) / (xMax - xMin)) * PLOT_WIDTH;
  const svgY = PADDING + ((yMax - y) / (yMax - yMin)) * PLOT_HEIGHT;
  return { svgX, svgY };
}

function RiemannView() {
  const [selectedMethod, setSelectedMethod] = useState<IntegrationMethod>("leftRiemann");
  const [lowerBound, setLowerBound] = useState(0);
  const [upperBound, setUpperBound] = useState(3);
  const [rectangleCount, setRectangleCount] = useState(10);

  const { evaluate, exactIntegral } = QUADRATIC_FUNCTION;

  const { yMin, yMax, curvePoints, rectangles, approximate, exact, errorPercent } =
    useMemo(() => {
      const steps = 200;
      const dx = (upperBound - lowerBound) / steps;

      const points: { x: number; y: number }[] = [];
      let minY = 0;
      let maxY = 1;
      for (let i = 0; i <= steps; i++) {
        const x = lowerBound + i * dx;
        const y = evaluate(x);
        points.push({ x, y });
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const yPad = (maxY - minY) * 0.15 || 0.5;

      const rectWidth = (upperBound - lowerBound) / rectangleCount;
      const rects: { x: number; width: number; height: number }[] = [];
      let sum = 0;

      for (let i = 0; i < rectangleCount; i++) {
        const xi = lowerBound + i * rectWidth;
        let sampleY: number;
        switch (selectedMethod) {
          case "leftRiemann": sampleY = evaluate(xi); break;
          case "rightRiemann": sampleY = evaluate(xi + rectWidth); break;
          case "midpoint": sampleY = evaluate(xi + rectWidth / 2); break;
          case "trapezoidal": sampleY = (evaluate(xi) + evaluate(xi + rectWidth)) / 2; break;
        }
        sum += sampleY * rectWidth;
        rects.push({ x: xi, width: rectWidth, height: sampleY });
      }

      const exactValue = exactIntegral(lowerBound, upperBound);
      const error = exactValue !== 0 ? Math.abs((sum - exactValue) / exactValue) * 100 : 0;

      return {
        yMin: minY - yPad,
        yMax: maxY + yPad,
        curvePoints: points,
        rectangles: rects,
        approximate: sum,
        exact: exactValue,
        errorPercent: error,
      };
    }, [selectedMethod, lowerBound, upperBound, rectangleCount, evaluate, exactIntegral]);

  const curvePath = curvePoints
    .map((point, index) => {
      const { svgX, svgY } = mapToSvg(point.x, point.y, lowerBound, upperBound, yMin, yMax);
      return `${index === 0 ? "M" : "L"} ${svgX} ${svgY}`;
    })
    .join(" ");

  const xTicks = Array.from({ length: 5 }, (_, i) => lowerBound + (i * (upperBound - lowerBound)) / 4);
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Method</label>
          <div className="flex gap-1">
            {METHODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedMethod(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedMethod === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Lower Bound (a)</span>
            <span className="font-mono text-accent">{lowerBound.toFixed(1)}</span>
          </label>
          <input type="range" min={-3} max={upperBound - 0.5} step={0.1} value={lowerBound}
            onChange={(event) => setLowerBound(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Upper Bound (b)</span>
            <span className="font-mono text-accent">{upperBound.toFixed(1)}</span>
          </label>
          <input type="range" min={lowerBound + 0.5} max={6} step={0.1} value={upperBound}
            onChange={(event) => setUpperBound(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Rectangles (n)</span>
            <span className="font-mono text-accent">{rectangleCount}</span>
          </label>
          <input type="range" min={1} max={100} step={1} value={rectangleCount}
            onChange={(event) => setRectangleCount(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
          {yTicks.map((yValue) => {
            const { svgY } = mapToSvg(lowerBound, yValue, lowerBound, upperBound, yMin, yMax);
            return (
              <g key={`y-${yValue}`}>
                <line x1={PADDING} y1={svgY} x2={SVG_WIDTH - PADDING} y2={svgY} stroke="rgba(255,255,255,0.06)" />
                <text x={PADDING - 5} y={svgY + 3} textAnchor="end" className="fill-muted/40 text-[8px]">{yValue.toFixed(1)}</text>
              </g>
            );
          })}
          {xTicks.map((xValue) => {
            const { svgX } = mapToSvg(xValue, 0, lowerBound, upperBound, yMin, yMax);
            return (
              <g key={`x-${xValue}`}>
                <line x1={svgX} y1={PADDING} x2={svgX} y2={SVG_HEIGHT - PADDING} stroke="rgba(255,255,255,0.06)" />
                <text x={svgX} y={SVG_HEIGHT - PADDING + 14} textAnchor="middle" className="fill-muted/40 text-[8px]">{xValue.toFixed(1)}</text>
              </g>
            );
          })}
          {(() => {
            const { svgY: zeroY } = mapToSvg(0, 0, lowerBound, upperBound, yMin, yMax);
            return <line x1={PADDING} y1={zeroY} x2={SVG_WIDTH - PADDING} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />;
          })()}
          {rectangles.map((rect, index) => {
            const { svgX: x1 } = mapToSvg(rect.x, 0, lowerBound, upperBound, yMin, yMax);
            const { svgX: x2 } = mapToSvg(rect.x + rect.width, 0, lowerBound, upperBound, yMin, yMax);
            const { svgY: top } = mapToSvg(rect.x, rect.height, lowerBound, upperBound, yMin, yMax);
            const { svgY: bottom } = mapToSvg(rect.x, 0, lowerBound, upperBound, yMin, yMax);
            const isPositive = rect.height >= 0;
            return (
              <rect key={index} x={x1} y={isPositive ? top : bottom} width={x2 - x1} height={Math.abs(bottom - top)}
                fill={isPositive ? "rgba(109,90,207,0.25)" : "rgba(239,68,68,0.25)"}
                stroke={isPositive ? "rgba(109,90,207,0.5)" : "rgba(239,68,68,0.5)"} strokeWidth={0.5} />
            );
          })}
          <path d={curvePath} fill="none" stroke="#6d5acf" strokeWidth={2} />
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Approximate", value: approximate.toFixed(6) },
          { label: "Exact", value: exact.toFixed(6) },
          { label: "Error", value: `${errorPercent.toFixed(3)}%` },
          { label: "f(x) = x²", value: `n = ${rectangleCount}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card-border/20 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-muted/70 mb-0.5">{label}</div>
            <div className="text-[11px] font-mono text-accent font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <SimulatorDetails data={INTEGRATION_METHODS[selectedMethod]} />
    </>
  );
}

// ===================== VOLUME VIEW =====================

const VOL_WIDTH = 600;
const VOL_HEIGHT = 300;

function VolumeView() {
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystem>("cartesian");
  const [radius, setRadius] = useState(3);
  const [sliceCount, setSliceCount] = useState(12);

  const systemInfo = COORDINATE_SYSTEMS[coordinateSystem];
  const exactVolume = (4 / 3) * Math.PI * radius ** 3;

  const approximateVolume = useMemo(() => {
    switch (coordinateSystem) {
      case "cartesian": {
        // Disk method: V ≈ Σ π·r(x)²·Δx where r(x) = sqrt(R²-x²)
        const dx = (2 * radius) / sliceCount;
        let sum = 0;
        for (let i = 0; i < sliceCount; i++) {
          const x = -radius + (i + 0.5) * dx;
          const diskRadius = Math.sqrt(Math.max(0, radius * radius - x * x));
          sum += Math.PI * diskRadius * diskRadius * dx;
        }
        return sum;
      }
      case "cylindrical": {
        // Shell method: V ≈ Σ 2π·r·h(r)·Δr where h(r) = 2·sqrt(R²-r²)
        const dr = radius / sliceCount;
        let sum = 0;
        for (let i = 0; i < sliceCount; i++) {
          const r = (i + 0.5) * dr;
          const shellHeight = 2 * Math.sqrt(Math.max(0, radius * radius - r * r));
          sum += 2 * Math.PI * r * shellHeight * dr;
        }
        return sum;
      }
      case "spherical": {
        // Spherical shells: V ≈ Σ 4π·ρ²·Δρ
        const drho = radius / sliceCount;
        let sum = 0;
        for (let i = 0; i < sliceCount; i++) {
          const rho = (i + 0.5) * drho;
          sum += 4 * Math.PI * rho * rho * drho;
        }
        return sum;
      }
    }
  }, [coordinateSystem, radius, sliceCount]);

  const errorPercent = exactVolume > 0 ? Math.abs((approximateVolume - exactVolume) / exactVolume) * 100 : 0;

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Coordinate System</label>
          <div className="flex gap-1">
            {(Object.keys(COORDINATE_SYSTEMS) as CoordinateSystem[]).map((key) => (
              <button
                key={key}
                onClick={() => setCoordinateSystem(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  coordinateSystem === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}
              >
                {COORDINATE_SYSTEMS[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Radius (R)</span>
            <span className="font-mono text-accent">{radius}</span>
          </label>
          <input type="range" min={1} max={5} step={0.5} value={radius}
            onChange={(event) => setRadius(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Slices</span>
            <span className="font-mono text-accent">{sliceCount}</span>
          </label>
          <input type="range" min={4} max={50} step={1} value={sliceCount}
            onChange={(event) => setSliceCount(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${VOL_WIDTH} ${VOL_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
          <VolumeVisualization coordinateSystem={coordinateSystem} radius={radius} sliceCount={sliceCount} />
        </svg>
      </div>

      <div className="bg-card-border/20 rounded-lg p-3">
        <div className="text-[10px] font-mono text-accent mb-1">{systemInfo.integralSetup}</div>
        <div className="text-[10px] text-muted">{systemInfo.description}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Approximate V", value: approximateVolume.toFixed(4) },
          { label: "Exact V", value: exactVolume.toFixed(4) },
          { label: "Error", value: `${errorPercent.toFixed(3)}%` },
          { label: "(4/3)πR³", value: `R = ${radius}` },
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

function VolumeVisualization({ coordinateSystem, radius, sliceCount }: { coordinateSystem: CoordinateSystem; radius: number; sliceCount: number }) {
  const centerX = VOL_WIDTH / 2;
  const centerY = VOL_HEIGHT / 2;
  const maxVisualRadius = 100;
  const scale = maxVisualRadius / Math.max(radius, 1);

  // Draw sphere outline (circle cross-section)
  const sphereOutlinePath = Array.from({ length: 100 }, (_, i) => {
    const angle = (i / 99) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * radius * scale;
    const y = centerY - Math.sin(angle) * radius * scale;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ") + " Z";

  if (coordinateSystem === "cartesian") {
    // Disk method: show vertical slices (disks seen from the side)
    const dx = (2 * radius) / sliceCount;
    return (
      <>
        {/* Axes */}
        <line x1={centerX - maxVisualRadius - 20} y1={centerY} x2={centerX + maxVisualRadius + 20} y2={centerY} stroke="rgba(255,255,255,0.15)" />
        <line x1={centerX} y1={centerY - maxVisualRadius - 20} x2={centerX} y2={centerY + maxVisualRadius + 20} stroke="rgba(255,255,255,0.15)" />
        <text x={centerX + maxVisualRadius + 25} y={centerY + 4} className="fill-muted/40 text-[9px]">x</text>
        <text x={centerX + 5} y={centerY - maxVisualRadius - 10} className="fill-muted/40 text-[9px]">y</text>

        {/* Sphere outline */}
        <path d={sphereOutlinePath} fill="none" stroke="rgba(109,90,207,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Disk slices */}
        {Array.from({ length: sliceCount }, (_, i) => {
          const x = -radius + (i + 0.5) * dx;
          const diskRadius = Math.sqrt(Math.max(0, radius * radius - x * x));
          const svgX = centerX + x * scale;
          const svgR = diskRadius * scale;
          return (
            <line key={i} x1={svgX} y1={centerY - svgR} x2={svgX} y2={centerY + svgR}
              stroke="rgba(109,90,207,0.6)" strokeWidth={Math.max(1, (dx * scale) - 1)} opacity={0.5} />
          );
        })}

        {/* Label */}
        <text x={centerX} y={centerY + maxVisualRadius + 35} textAnchor="middle" className="fill-muted/50 text-[9px]">
          Disk slices along x-axis
        </text>
      </>
    );
  }

  if (coordinateSystem === "cylindrical") {
    // Shell method: show concentric cylindrical shells as concentric circles
    const dr = radius / sliceCount;
    return (
      <>
        <line x1={centerX - maxVisualRadius - 20} y1={centerY} x2={centerX + maxVisualRadius + 20} y2={centerY} stroke="rgba(255,255,255,0.15)" />
        <line x1={centerX} y1={centerY - maxVisualRadius - 20} x2={centerX} y2={centerY + maxVisualRadius + 20} stroke="rgba(255,255,255,0.15)" />
        <text x={centerX + maxVisualRadius + 25} y={centerY + 4} className="fill-muted/40 text-[9px]">r</text>
        <text x={centerX + 5} y={centerY - maxVisualRadius - 10} className="fill-muted/40 text-[9px]">z</text>

        <path d={sphereOutlinePath} fill="none" stroke="rgba(109,90,207,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Concentric shells */}
        {Array.from({ length: sliceCount }, (_, i) => {
          const r = (i + 0.5) * dr;
          const svgR = r * scale;
          return (
            <circle key={i} cx={centerX} cy={centerY} r={svgR}
              fill="none" stroke="rgba(109,90,207,0.5)" strokeWidth={Math.max(0.5, (dr * scale) * 0.6)} opacity={0.5} />
          );
        })}

        <text x={centerX} y={centerY + maxVisualRadius + 35} textAnchor="middle" className="fill-muted/50 text-[9px]">
          Cylindrical shells (top view)
        </text>
      </>
    );
  }

  // Spherical: show radial shells as concentric circles with different opacity
  const drho = radius / sliceCount;
  return (
    <>
      <line x1={centerX - maxVisualRadius - 20} y1={centerY} x2={centerX + maxVisualRadius + 20} y2={centerY} stroke="rgba(255,255,255,0.15)" />
      <line x1={centerX} y1={centerY - maxVisualRadius - 20} x2={centerX} y2={centerY + maxVisualRadius + 20} stroke="rgba(255,255,255,0.15)" />
      <text x={centerX + maxVisualRadius + 25} y={centerY + 4} className="fill-muted/40 text-[9px]">ρ</text>
      <text x={centerX + 5} y={centerY - maxVisualRadius - 10} className="fill-muted/40 text-[9px]">φ</text>

      {/* Spherical shells (filled bands) */}
      {Array.from({ length: sliceCount }, (_, i) => {
        const rhoOuter = (i + 1) * drho;
        const rhoInner = i * drho;
        const outerR = rhoOuter * scale;
        const innerR = rhoInner * scale;
        const opacity = 0.15 + (i / sliceCount) * 0.3;
        return (
          <g key={i}>
            <circle cx={centerX} cy={centerY} r={outerR} fill={`rgba(109,90,207,${opacity})`}
              stroke="rgba(109,90,207,0.4)" strokeWidth={0.5} />
            <circle cx={centerX} cy={centerY} r={innerR} fill="transparent" />
          </g>
        );
      }).reverse()}

      {/* Radius line */}
      <line x1={centerX} y1={centerY} x2={centerX + radius * scale} y2={centerY}
        stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 2" />
      <text x={centerX + radius * scale / 2} y={centerY - 8} textAnchor="middle"
        className="fill-green-400 text-[9px] font-mono">R</text>

      <text x={centerX} y={centerY + maxVisualRadius + 35} textAnchor="middle" className="fill-muted/50 text-[9px]">
        Spherical shells (cross-section)
      </text>
    </>
  );
}

// ===================== FOURIER VIEW =====================

const FOURIER_WIDTH = 600;
const FOURIER_HEIGHT = 280;
const F_PADDING = 40;
const F_PLOT_WIDTH = FOURIER_WIDTH - 2 * F_PADDING;
const F_PLOT_HEIGHT = FOURIER_HEIGHT - 2 * F_PADDING;

function FourierView() {
  const [targetWave, setTargetWave] = useState<FourierTarget>("square");
  const [termCount, setTermCount] = useState(5);
  const [showIndividual, setShowIndividual] = useState(false);

  const xMin = -Math.PI;
  const xMax = 3 * Math.PI;
  const yMin = -1.5;
  const yMax = 1.5;

  const mapF = (x: number, y: number) => ({
    svgX: F_PADDING + ((x - xMin) / (xMax - xMin)) * F_PLOT_WIDTH,
    svgY: F_PADDING + ((yMax - y) / (yMax - yMin)) * F_PLOT_HEIGHT,
  });

  const steps = 400;
  const dx = (xMax - xMin) / steps;

  // Target waveform path
  const targetPath = Array.from({ length: steps + 1 }, (_, i) => {
    const x = xMin + i * dx;
    const y = targetWaveform(targetWave, x);
    const { svgX, svgY } = mapF(x, y);
    return `${i === 0 ? "M" : "L"} ${svgX} ${svgY}`;
  }).join(" ");

  // Fourier approximation path
  const approxPath = Array.from({ length: steps + 1 }, (_, i) => {
    const x = xMin + i * dx;
    const y = computeFourierSum(targetWave, termCount, x);
    const { svgX, svgY } = mapF(x, y);
    return `${i === 0 ? "M" : "L"} ${svgX} ${svgY}`;
  }).join(" ");

  // Individual harmonic paths
  const harmonicColors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Target Waveform</label>
          <div className="flex gap-1">
            {(Object.keys(FOURIER_TARGETS) as FourierTarget[]).map((key) => (
              <button
                key={key}
                onClick={() => setTargetWave(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  targetWave === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}
              >
                {FOURIER_TARGETS[key].label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowIndividual(!showIndividual)}
          className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
            showIndividual
              ? "bg-accent/20 text-accent border border-accent/30"
              : "text-muted/60 hover:text-muted border border-card-border"
          }`}
        >
          {showIndividual ? "Hide Harmonics" : "Show Harmonics"}
        </button>
      </div>

      <div className="flex-1 min-w-[120px]">
        <label className="text-[10px] text-muted flex justify-between">
          <span>Number of Terms</span>
          <span className="font-mono text-accent">{termCount}</span>
        </label>
        <input type="range" min={1} max={20} step={1} value={termCount}
          onChange={(event) => setTermCount(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
      </div>

      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${FOURIER_WIDTH} ${FOURIER_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
          {/* Grid */}
          {[-1, -0.5, 0, 0.5, 1].map((yValue) => {
            const { svgY } = mapF(xMin, yValue);
            return (
              <g key={`fy-${yValue}`}>
                <line x1={F_PADDING} y1={svgY} x2={FOURIER_WIDTH - F_PADDING} y2={svgY}
                  stroke={yValue === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"} />
                <text x={F_PADDING - 5} y={svgY + 3} textAnchor="end" className="fill-muted/40 text-[8px]">{yValue}</text>
              </g>
            );
          })}
          {[0, Math.PI, 2 * Math.PI].map((xValue) => {
            const { svgX } = mapF(xValue, 0);
            const labels: Record<number, string> = { 0: "0", [Math.PI]: "π", [2 * Math.PI]: "2π" };
            return (
              <g key={`fx-${xValue}`}>
                <line x1={svgX} y1={F_PADDING} x2={svgX} y2={FOURIER_HEIGHT - F_PADDING} stroke="rgba(255,255,255,0.06)" />
                <text x={svgX} y={FOURIER_HEIGHT - F_PADDING + 14} textAnchor="middle" className="fill-muted/40 text-[8px]">{labels[xValue]}</text>
              </g>
            );
          })}

          {/* Individual harmonics */}
          {showIndividual && Array.from({ length: Math.min(termCount, 8) }, (_, harmonicIndex) => {
            const harmonicPath = Array.from({ length: steps + 1 }, (__, i) => {
              const x = xMin + i * dx;
              const { svgX, svgY } = mapF(x, computeFourierSum(targetWave, harmonicIndex + 1, x) - computeFourierSum(targetWave, harmonicIndex, x));
              return `${i === 0 ? "M" : "L"} ${svgX} ${svgY}`;
            }).join(" ");
            return <path key={harmonicIndex} d={harmonicPath} fill="none" stroke={harmonicColors[harmonicIndex % harmonicColors.length]} strokeWidth={0.8} opacity={0.5} />;
          })}

          {/* Target waveform */}
          <path d={targetPath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />

          {/* Fourier approximation */}
          <path d={approxPath} fill="none" stroke="#6d5acf" strokeWidth={2} />
        </svg>
      </div>

      <div className="bg-card-border/20 rounded-lg p-3">
        <div className="text-[10px] font-mono text-accent mb-1">{FOURIER_TARGETS[targetWave].label}</div>
        <div className="text-[10px] text-muted">{FOURIER_TARGETS[targetWave].description}</div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[9px]">
        <span className="text-muted/50 flex items-center gap-1">
          <span className="w-4 h-0.5 bg-white/25 inline-block" style={{ borderTop: "1.5px dashed rgba(255,255,255,0.25)" }} /> Target
        </span>
        <span className="text-muted/50 flex items-center gap-1">
          <span className="w-4 h-0.5 bg-[#6d5acf] inline-block" /> Fourier ({termCount} terms)
        </span>
      </div>
    </>
  );
}
