"use client";

import { useState, useMemo } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type TransistorMode, TRANSISTOR_MODE_INFO } from "@/data/transistorTypes";

const MODES: { key: TransistorMode; label: string }[] = [
  { key: "mosfet", label: "MOSFET" },
  { key: "bjt", label: "BJT" },
  { key: "cmosInverter", label: "CMOS Inverter" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 320;

function getOperatingRegion(mode: TransistorMode, voltage: number): { region: string; current: number; description: string } {
  if (mode === "mosfet") {
    const vth = 0.7;
    if (voltage < vth) return { region: "Cutoff", current: 0, description: "VGS < Vth: No channel formed, no current flows" };
    if (voltage < 2) return { region: "Linear/Triode", current: (voltage - vth) * 2, description: "Channel acts as a voltage-controlled resistor" };
    return { region: "Saturation", current: 0.5 * (voltage - vth) ** 2, description: "Current determined by VGS, independent of VDS" };
  }
  if (mode === "bjt") {
    const vbe = 0.6;
    if (voltage < vbe) return { region: "Cutoff", current: 0, description: "VBE < 0.6V: No base current, transistor OFF" };
    if (voltage < 1.5) return { region: "Active", current: (voltage - vbe) * 50, description: "IC = β × IB, linear amplification region" };
    return { region: "Saturation", current: 45, description: "Both junctions forward-biased, transistor fully ON" };
  }
  // CMOS
  const threshold = 2.5;
  if (voltage < threshold - 1) return { region: "Output HIGH", current: 0.01, description: "PMOS ON, NMOS OFF: Output pulled to VDD" };
  if (voltage > threshold + 1) return { region: "Output LOW", current: 0.01, description: "PMOS OFF, NMOS ON: Output pulled to GND" };
  return { region: "Transition", current: Math.abs(voltage - threshold) * 5, description: "Both transistors partially on, current spike" };
}

function MosfetDiagram({ gateVoltage }: { gateVoltage: number }) {
  const vth = 0.7;
  const isOn = gateVoltage >= vth;
  const channelOpacity = isOn ? Math.min(1, (gateVoltage - vth) / 3) : 0;

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      <text x={SVG_WIDTH / 2} y={18} textAnchor="middle" className="fill-accent text-[11px] font-semibold">N-Channel Enhancement MOSFET Cross-Section</text>

      {/* P-type substrate */}
      <rect x={80} y={120} width={440} height={140} fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
      <text x={300} y={245} textAnchor="middle" className="fill-red-400/50 text-[10px]">P-type Substrate</text>

      {/* N+ Source region */}
      <rect x={110} y={120} width={80} height={50} fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth={1.5} />
      <text x={150} y={150} textAnchor="middle" className="fill-blue-400 text-[9px] font-semibold">n+ Source</text>

      {/* N+ Drain region */}
      <rect x={410} y={120} width={80} height={50} fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth={1.5} />
      <text x={450} y={150} textAnchor="middle" className="fill-blue-400 text-[9px] font-semibold">n+ Drain</text>

      {/* Gate oxide */}
      <rect x={190} y={105} width={220} height={15} fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth={1} />
      <text x={300} y={115} textAnchor="middle" className="fill-yellow-400/70 text-[7px]">SiO₂ (Gate Oxide)</text>

      {/* Gate metal */}
      <rect x={200} y={80} width={200} height={25} fill="rgba(168,85,247,0.3)" stroke="#a855f7" strokeWidth={1.5} />
      <text x={300} y={97} textAnchor="middle" className="fill-purple-400 text-[9px] font-semibold">Gate (Metal)</text>

      {/* Channel (when ON) */}
      {isOn && (
        <rect x={190} y={120} width={220} height={8} fill={`rgba(109,90,207,${channelOpacity * 0.5})`} stroke={`rgba(109,90,207,${channelOpacity})`} strokeWidth={1}>
          <animate attributeName="opacity" values={`${channelOpacity};${channelOpacity * 0.5};${channelOpacity}`} dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Depletion regions */}
      <rect x={190} y={128} width={220} height={Math.max(2, (gateVoltage / 5) * 20)} fill="rgba(109,90,207,0.08)" stroke="none" rx={2}>
        {isOn && <animate attributeName="height" values={`${(gateVoltage / 5) * 20};${(gateVoltage / 5) * 25};${(gateVoltage / 5) * 20}`} dur="2s" repeatCount="indefinite" />}
      </rect>

      {/* Charge carriers (electrons) when ON */}
      {isOn && Array.from({ length: 8 }, (_, i) => {
        const startX = 190 + (i / 8) * 220;
        return (
          <circle key={i} cx={startX} cy={124} r={2} fill="#6d5acf" opacity={channelOpacity}>
            <animate attributeName="cx" from={`${190}`} to={`${410}`} dur={`${1.5 + i * 0.1}s`} repeatCount="indefinite" />
          </circle>
        );
      })}

      {/* Terminal connections */}
      <line x1={150} y1={80} x2={150} y2={40} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={150} y={35} textAnchor="middle" className="fill-muted/60 text-[9px]">S</text>

      <line x1={300} y1={80} x2={300} y2={40} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={300} y={35} textAnchor="middle" className="fill-purple-400 text-[9px] font-semibold">G ({gateVoltage.toFixed(1)}V)</text>

      <line x1={450} y1={80} x2={450} y2={40} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={450} y={35} textAnchor="middle" className="fill-muted/60 text-[9px]">D</text>

      {/* State label */}
      <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 10} textAnchor="middle" className={`text-[10px] font-mono ${isOn ? "fill-emerald-400" : "fill-red-400"}`}>
        {isOn ? "✓ Channel formed — current flows" : "✗ No channel — transistor OFF"}
      </text>
    </svg>
  );
}

function BjtDiagram({ baseVoltage }: { baseVoltage: number }) {
  const vbe = 0.6;
  const isOn = baseVoltage >= vbe;
  const currentMagnitude = isOn ? Math.min(1, (baseVoltage - vbe) / 1.5) : 0;

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      <text x={SVG_WIDTH / 2} y={18} textAnchor="middle" className="fill-accent text-[11px] font-semibold">NPN Bipolar Junction Transistor Cross-Section</text>

      {/* Collector (N) */}
      <rect x={140} y={50} width={320} height={50} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1.5} rx={3} />
      <text x={300} y={80} textAnchor="middle" className="fill-blue-400 text-[10px] font-semibold">N (Collector)</text>

      {/* Base (P) */}
      <rect x={140} y={100} width={320} height={60} fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth={1.5} rx={3} />
      <text x={300} y={135} textAnchor="middle" className="fill-red-400 text-[10px] font-semibold">P (Base)</text>

      {/* Emitter (N) */}
      <rect x={140} y={160} width={320} height={50} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1.5} rx={3} />
      <text x={300} y={190} textAnchor="middle" className="fill-blue-400 text-[10px] font-semibold">N (Emitter)</text>

      {/* Terminal labels */}
      <line x1={300} y1={50} x2={300} y2={30} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={300} y={25} textAnchor="middle" className="fill-muted/60 text-[9px]">C (Collector)</text>

      <line x1={100} y1={130} x2={140} y2={130} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={80} y={134} textAnchor="middle" className="fill-red-400 text-[9px] font-semibold">B ({baseVoltage.toFixed(1)}V)</text>

      <line x1={300} y1={210} x2={300} y2={235} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={300} y={248} textAnchor="middle" className="fill-muted/60 text-[9px]">E (Emitter)</text>

      {/* Current flow arrows when ON */}
      {isOn && (
        <>
          {/* Base current (small) */}
          <line x1={120} y1={130} x2={140} y2={130} stroke="#fbbf24" strokeWidth={2}>
            <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
          </line>
          <text x={130} y={120} textAnchor="middle" className="fill-yellow-400/70 text-[7px]">IB</text>

          {/* Collector current (large) */}
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={`e-${i}`} cx={200 + i * 40} cy={80} r={2.5} fill="#22c55e" opacity={currentMagnitude * 0.8}>
              <animate attributeName="cy" from="50" to="210" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x={520} y={80} className="fill-emerald-400/70 text-[8px] font-mono">IC = β×IB</text>
        </>
      )}

      {/* Junction labels */}
      <text x={530} y={100} className="fill-muted/40 text-[7px]">CB junction</text>
      <text x={530} y={165} className="fill-muted/40 text-[7px]">EB junction</text>

      {/* State label */}
      <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 10} textAnchor="middle" className={`text-[10px] font-mono ${isOn ? "fill-emerald-400" : "fill-red-400"}`}>
        {isOn ? "✓ IC = β × IB (amplification active)" : "✗ VBE < 0.6V — transistor OFF"}
      </text>
    </svg>
  );
}

function CmosInverterDiagram({ inputVoltage }: { inputVoltage: number }) {
  const vdd = 5;
  const threshold = vdd / 2;
  const isPmosOn = inputVoltage < threshold;
  const isNmosOn = inputVoltage > threshold;
  const outputHigh = isPmosOn;

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      <text x={SVG_WIDTH / 2} y={18} textAnchor="middle" className="fill-accent text-[11px] font-semibold">CMOS Inverter Circuit</text>

      {/* VDD rail */}
      <line x1={250} y1={40} x2={350} y2={40} stroke="rgba(239,68,68,0.5)" strokeWidth={2} />
      <text x={360} y={44} className="fill-red-400 text-[9px] font-mono">VDD = {vdd}V</text>

      {/* PMOS transistor */}
      <rect x={270} y={55} width={60} height={50} rx={5} fill={isPmosOn ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"} stroke={isPmosOn ? "#22c55e" : "rgba(255,255,255,0.2)"} strokeWidth={1.5} />
      <text x={300} y={78} textAnchor="middle" className={`text-[9px] font-semibold ${isPmosOn ? "fill-emerald-400" : "fill-muted/40"}`}>PMOS</text>
      <text x={300} y={92} textAnchor="middle" className="fill-muted/40 text-[7px]">{isPmosOn ? "ON" : "OFF"}</text>

      {/* Connection VDD to PMOS */}
      <line x1={300} y1={40} x2={300} y2={55} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {/* Connection PMOS to output node */}
      <line x1={300} y1={105} x2={300} y2={140} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {/* Output node */}
      <circle cx={300} cy={155} r={5} fill={outputHigh ? "#22c55e" : "rgba(255,255,255,0.15)"} stroke={outputHigh ? "#22c55e" : "rgba(255,255,255,0.3)"} strokeWidth={1.5} />
      <line x1={305} y1={155} x2={400} y2={155} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={410} y={159} className={`text-[10px] font-mono ${outputHigh ? "fill-emerald-400 font-bold" : "fill-red-400 font-bold"}`}>
        Out = {outputHigh ? `${vdd}V (HIGH)` : "0V (LOW)"}
      </text>

      {/* Connection output node to NMOS */}
      <line x1={300} y1={160} x2={300} y2={175} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {/* NMOS transistor */}
      <rect x={270} y={175} width={60} height={50} rx={5} fill={isNmosOn ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"} stroke={isNmosOn ? "#22c55e" : "rgba(255,255,255,0.2)"} strokeWidth={1.5} />
      <text x={300} y={198} textAnchor="middle" className={`text-[9px] font-semibold ${isNmosOn ? "fill-emerald-400" : "fill-muted/40"}`}>NMOS</text>
      <text x={300} y={212} textAnchor="middle" className="fill-muted/40 text-[7px]">{isNmosOn ? "ON" : "OFF"}</text>

      {/* Connection NMOS to GND */}
      <line x1={300} y1={225} x2={300} y2={260} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />

      {/* GND rail */}
      <line x1={250} y1={260} x2={350} y2={260} stroke="rgba(59,130,246,0.5)" strokeWidth={2} />
      <text x={360} y={264} className="fill-blue-400 text-[9px] font-mono">GND = 0V</text>

      {/* Input line */}
      <line x1={150} y1={80} x2={270} y2={80} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <line x1={150} y1={80} x2={150} y2={200} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <line x1={150} y1={200} x2={270} y2={200} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={130} y={144} textAnchor="middle" className="fill-accent text-[10px] font-mono">
        In = {inputVoltage.toFixed(1)}V
      </text>

      {/* Current flow indicators */}
      {isPmosOn && (
        <g>
          <line x1={300} y1={50} x2={300} y2={105} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.5s" repeatCount="indefinite" />
          </line>
        </g>
      )}
      {isNmosOn && (
        <g>
          <line x1={300} y1={175} x2={300} y2={255} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" from="0" to="8" dur="0.5s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* State summary */}
      <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 10} textAnchor="middle" className="fill-muted/50 text-[9px]">
        Input {inputVoltage < threshold ? "LOW" : "HIGH"} → PMOS {isPmosOn ? "ON" : "OFF"}, NMOS {isNmosOn ? "ON" : "OFF"} → Output {outputHigh ? "HIGH" : "LOW"} (Inverted)
      </text>
    </svg>
  );
}

export function TransistorArchitectureVisualizer() {
  const [selectedMode, setSelectedMode] = useState<TransistorMode>("mosfet");
  const [voltage, setVoltage] = useState(2.5);

  const operatingInfo = useMemo(
    () => getOperatingRegion(selectedMode, voltage),
    [selectedMode, voltage]
  );

  const voltageLabel = selectedMode === "mosfet" ? "Gate Voltage (VGS)" : selectedMode === "bjt" ? "Base Voltage (VBE)" : "Input Voltage";
  const voltageMax = selectedMode === "bjt" ? 3 : 5;

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Transistor Type</label>
          <div className="flex gap-1">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setSelectedMode(key); setVoltage(key === "bjt" ? 0.8 : 2.5); }}
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

      {/* Voltage control */}
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>{voltageLabel}</span>
            <span className="font-mono text-accent">{voltage.toFixed(1)}V</span>
          </label>
          <input type="range" min={0} max={voltageMax} step={0.1} value={voltage} onChange={(event) => setVoltage(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      {/* Cross-section diagram */}
      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        {selectedMode === "mosfet" && <MosfetDiagram gateVoltage={voltage} />}
        {selectedMode === "bjt" && <BjtDiagram baseVoltage={voltage} />}
        {selectedMode === "cmosInverter" && <CmosInverterDiagram inputVoltage={voltage} />}
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card-border/20 rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-muted/70 mb-0.5">Operating Region</div>
          <div className="text-[10px] font-mono text-accent font-semibold">{operatingInfo.region}</div>
        </div>
        <div className="bg-card-border/20 rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-muted/70 mb-0.5">Current (mA)</div>
          <div className="text-[10px] font-mono text-accent font-semibold">{operatingInfo.current.toFixed(2)}</div>
        </div>
        <div className="bg-card-border/20 rounded-lg p-2.5 text-center col-span-1">
          <div className="text-[9px] text-muted/70 mb-0.5">Description</div>
          <div className="text-[9px] font-mono text-muted">{operatingInfo.description}</div>
        </div>
      </div>

      <SimulatorDetails data={TRANSISTOR_MODE_INFO[selectedMode]} />
    </div>
  );
}
