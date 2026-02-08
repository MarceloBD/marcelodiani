"use client";

import { useState, useMemo } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type FiberMode, FIBER_MODE_INFO } from "@/data/opticalFiberModes";

const MODES: { key: FiberMode; label: string }[] = [
  { key: "singleMode", label: "Single-Mode" },
  { key: "multiModeStep", label: "Multi-Mode Step" },
  { key: "multiModeGraded", label: "Multi-Mode Graded" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 300;

export function OpticalFiberVisualizer() {
  const [selectedMode, setSelectedMode] = useState<FiberMode>("singleMode");
  const [coreIndex, setCoreIndex] = useState(1.48);
  const [claddingIndex, setCladdingIndex] = useState(1.46);
  const [incidentAngle, setIncidentAngle] = useState(10);

  const calculations = useMemo(() => {
    const criticalAngle = Math.asin(claddingIndex / coreIndex) * (180 / Math.PI);
    const numericalAperture = Math.sqrt(coreIndex ** 2 - claddingIndex ** 2);
    const acceptanceAngle = Math.asin(numericalAperture) * (180 / Math.PI);
    const coreDiameter = selectedMode === "singleMode" ? 9 : 50;
    const vNumber = (Math.PI * coreDiameter * 1e-6 * numericalAperture) / (1310e-9);
    const totalInternalReflection = incidentAngle < (90 - criticalAngle);
    return { criticalAngle, numericalAperture, acceptanceAngle, vNumber, coreDiameter, totalInternalReflection };
  }, [coreIndex, claddingIndex, incidentAngle, selectedMode]);

  const renderFiber = () => {
    const fiberStartX = 60;
    const fiberEndX = SVG_WIDTH - 30;
    const fiberLength = fiberEndX - fiberStartX;
    const centerY = 120;
    const coreHalfHeight = selectedMode === "singleMode" ? 6 : 20;
    const claddingHalfHeight = coreHalfHeight + 15;

    // Calculate ray bounces
    const angleRad = (incidentAngle * Math.PI) / 180;
    const bounceHeight = coreHalfHeight * 2;
    const bounceWidth = bounceHeight / Math.tan(angleRad || 0.01);
    const rayPoints: { x: number; y: number }[] = [{ x: fiberStartX, y: centerY }];

    if (selectedMode === "singleMode") {
      // Single mode: straight ray along center
      rayPoints.push({ x: fiberEndX, y: centerY });
    } else {
      // Multi-mode: bouncing rays
      let currentX = fiberStartX;
      let goingDown = true;

      while (currentX < fiberEndX) {
        const nextX = Math.min(currentX + bounceWidth, fiberEndX);
        const nextY = goingDown ? centerY + coreHalfHeight : centerY - coreHalfHeight;

        if (selectedMode === "multiModeGraded") {
          // Graded: curved path (simplified as quadratic curve)
          const midX = (currentX + nextX) / 2;
          const midY = goingDown ? centerY + coreHalfHeight * 0.6 : centerY - coreHalfHeight * 0.6;
          rayPoints.push({ x: midX, y: midY }, { x: nextX, y: goingDown ? centerY : centerY });
        } else {
          // Step-index: straight bounces
          rayPoints.push({ x: nextX, y: nextY });
        }

        currentX = nextX;
        goingDown = !goingDown;
      }
    }

    // Build path string
    const rayPath = selectedMode === "multiModeGraded"
      ? rayPoints.reduce((path, point, index) => {
          if (index === 0) return `M ${point.x} ${point.y}`;
          if (index % 2 === 1) return `${path} Q ${point.x} ${point.y}`;
          return `${path} ${point.x} ${point.y}`;
        }, "")
      : rayPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

    // Secondary ray for multi-mode
    const secondaryRayPoints: string[] = [];
    if (selectedMode !== "singleMode") {
      let currentX = fiberStartX;
      let goingDown = false;
      secondaryRayPoints.push(`M ${currentX} ${centerY}`);
      const secondBounceWidth = bounceWidth * 0.7;

      while (currentX < fiberEndX) {
        const nextX = Math.min(currentX + secondBounceWidth, fiberEndX);
        const nextY = goingDown ? centerY + coreHalfHeight * 0.8 : centerY - coreHalfHeight * 0.8;
        secondaryRayPoints.push(`L ${nextX} ${nextY}`);
        currentX = nextX;
        goingDown = !goingDown;
      }
    }

    return (
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
        {/* Cross section view (left side) */}
        <g>
          <text x={30} y={SVG_HEIGHT - 80} textAnchor="middle" className="fill-muted/50 text-[8px]">Cross Section</text>
          {/* Buffer */}
          <circle cx={30} cy={SVG_HEIGHT - 40} r={30} fill="rgba(100,100,100,0.3)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          {/* Cladding */}
          <circle cx={30} cy={SVG_HEIGHT - 40} r={22} fill="rgba(109,90,207,0.15)" stroke="rgba(109,90,207,0.3)" strokeWidth={1} />
          {/* Core */}
          <circle
            cx={30}
            cy={SVG_HEIGHT - 40}
            r={selectedMode === "singleMode" ? 4 : 12}
            fill="rgba(109,90,207,0.5)"
            stroke="#6d5acf"
            strokeWidth={1.5}
          />
          <text x={30} y={SVG_HEIGHT - 8} textAnchor="middle" className="fill-muted/40 text-[7px]">
            Core: {calculations.coreDiameter}μm
          </text>
        </g>

        {/* Longitudinal view - Cladding */}
        <rect
          x={fiberStartX}
          y={centerY - claddingHalfHeight}
          width={fiberLength}
          height={claddingHalfHeight * 2}
          fill="rgba(109,90,207,0.08)"
          stroke="rgba(109,90,207,0.2)"
          strokeWidth={1}
          rx={3}
        />

        {/* Core */}
        <rect
          x={fiberStartX}
          y={centerY - coreHalfHeight}
          width={fiberLength}
          height={coreHalfHeight * 2}
          fill="rgba(109,90,207,0.2)"
          stroke="rgba(109,90,207,0.4)"
          strokeWidth={1}
        />

        {/* Labels */}
        <text x={fiberEndX + 5} y={centerY - claddingHalfHeight + 10} className="fill-muted/40 text-[7px]">Cladding</text>
        <text x={fiberEndX + 5} y={centerY + 4} className="fill-accent text-[7px] font-semibold">Core</text>
        <text x={fiberEndX + 5} y={centerY + claddingHalfHeight - 2} className="fill-muted/40 text-[7px]">n₂={claddingIndex}</text>

        {/* Refractive index profile */}
        {selectedMode === "multiModeGraded" && (
          <g opacity={0.3}>
            {Array.from({ length: 20 }, (_, i) => {
              const y = centerY - coreHalfHeight + (i / 20) * coreHalfHeight * 2;
              const distFromCenter = Math.abs(y - centerY) / coreHalfHeight;
              const gradedWidth = (1 - distFromCenter ** 2) * 15;
              return (
                <rect
                  key={i}
                  x={fiberStartX - gradedWidth - 5}
                  y={y}
                  width={gradedWidth}
                  height={coreHalfHeight * 2 / 20}
                  fill="#6d5acf"
                />
              );
            })}
            <text x={fiberStartX - 25} y={centerY - coreHalfHeight - 5} textAnchor="middle" className="fill-muted/40 text-[6px]">n(r)</text>
          </g>
        )}

        {/* Light rays */}
        <path d={rayPath} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={0.9}>
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
        </path>
        {selectedMode !== "singleMode" && secondaryRayPoints.length > 0 && (
          <path d={secondaryRayPoints.join(" ")} fill="none" stroke="#22c55e" strokeWidth={1.5} opacity={0.6}>
            <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.8s" repeatCount="indefinite" />
          </path>
        )}

        {/* TIR indicator */}
        <text x={fiberStartX + 10} y={centerY - claddingHalfHeight - 8} className={`text-[9px] font-mono ${calculations.totalInternalReflection ? "fill-emerald-400" : "fill-red-400"}`}>
          {calculations.totalInternalReflection ? "✓ Total Internal Reflection" : "✗ Light escaping (angle too steep)"}
        </text>

        {/* Info box */}
        <text x={fiberStartX} y={SVG_HEIGHT - 30} className="fill-muted/40 text-[8px]">
          n₁(core) = {coreIndex.toFixed(2)} | n₂(cladding) = {claddingIndex.toFixed(2)} | NA = {calculations.numericalAperture.toFixed(3)}
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Fiber Type</label>
          <div className="flex gap-1">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedMode(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedMode === key
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

      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Core Index (n₁)</span>
            <span className="font-mono text-accent">{coreIndex.toFixed(3)}</span>
          </label>
          <input type="range" min={1.44} max={1.55} step={0.001} value={coreIndex} onChange={(event) => setCoreIndex(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Cladding Index (n₂)</span>
            <span className="font-mono text-accent">{claddingIndex.toFixed(3)}</span>
          </label>
          <input type="range" min={1.43} max={coreIndex - 0.001} step={0.001} value={claddingIndex} onChange={(event) => setCladdingIndex(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Incident Angle</span>
            <span className="font-mono text-accent">{incidentAngle}°</span>
          </label>
          <input type="range" min={1} max={45} step={1} value={incidentAngle} onChange={(event) => setIncidentAngle(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        {renderFiber()}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Critical Angle", value: `${calculations.criticalAngle.toFixed(1)}°` },
          { label: "Numerical Aperture", value: calculations.numericalAperture.toFixed(4) },
          { label: "Acceptance Angle", value: `${calculations.acceptanceAngle.toFixed(1)}°` },
          { label: "V-Number", value: calculations.vNumber.toFixed(1) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card-border/20 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-muted/70 mb-0.5">{label}</div>
            <div className="text-[10px] font-mono text-accent font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <SimulatorDetails data={FIBER_MODE_INFO[selectedMode]} />
    </div>
  );
}
