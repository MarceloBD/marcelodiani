"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CircuitDetails } from "./CircuitDetails";
import { type CircuitType, CIRCUIT_EXAMPLES } from "@/data/circuitExamples";

const SVG_WIDTH = 500;
const SVG_HEIGHT = 220;
const WIRE_COLOR = "rgba(148, 163, 184, 0.3)";
const ACTIVE_COLOR = "#3b82f6";
const COMPONENT_COLOR = "rgba(148, 163, 184, 0.6)";
const LABEL_COLOR = "rgba(148, 163, 184, 0.5)";
const VALUE_COLOR = "#60a5fa";
const LED_FORWARD_VOLTAGE = 2;
const TRANSISTOR_BETA = 100;
const TRANSISTOR_VBE = 0.7;

interface CircuitResult {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CircuitDiagramProps {
  params: Record<string, number>;
}

// --- Formatting ---

function formatEngineering(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`;
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1e6) return `${(value / 1e6).toFixed(2)} M${unit}`;
  if (absoluteValue >= 1e3) return `${(value / 1e3).toFixed(2)} k${unit}`;
  if (absoluteValue >= 1) return `${value.toFixed(2)} ${unit}`;
  if (absoluteValue >= 1e-3) return `${(value * 1e3).toFixed(2)} m${unit}`;
  if (absoluteValue >= 1e-6) return `${(value * 1e6).toFixed(2)} \u00b5${unit}`;
  return `${(value * 1e9).toFixed(2)} n${unit}`;
}

function formatResistance(ohms: number): string {
  if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(1)}M\u03A9`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(1)}k\u03A9`;
  return `${ohms}\u03A9`;
}

// --- Calculations ---

function calculateResults(circuitType: CircuitType, params: Record<string, number>): CircuitResult[] {
  switch (circuitType) {
    case "resistor": {
      const { voltage = 0, resistance = 1 } = params;
      const current = voltage / resistance;
      const power = voltage * current;
      return [
        { label: "Current (I)", value: formatEngineering(current, "A"), highlight: true },
        { label: "Power (P)", value: formatEngineering(power, "W") },
      ];
    }
    case "voltageDivider": {
      const { voltage = 0, resistance1 = 1, resistance2 = 1 } = params;
      const totalResistance = resistance1 + resistance2;
      const current = voltage / totalResistance;
      const outputVoltage = voltage * resistance2 / totalResistance;
      return [
        { label: "Vout", value: `${outputVoltage.toFixed(2)} V`, highlight: true },
        { label: "Current", value: formatEngineering(current, "A") },
        { label: "Ratio", value: `${((resistance2 / totalResistance) * 100).toFixed(1)}%` },
      ];
    }
    case "led": {
      const { voltage = 0, resistance = 1 } = params;
      const current = Math.max(0, (voltage - LED_FORWARD_VOLTAGE) / resistance);
      const resistorPower = current * current * resistance;
      const ledPower = LED_FORWARD_VOLTAGE * current;
      const brightness = Math.min(100, (current / 0.02) * 100);
      return [
        { label: "LED Current", value: formatEngineering(current, "A"), highlight: true },
        { label: "Brightness", value: `${brightness.toFixed(0)}%` },
        { label: "P (resistor)", value: formatEngineering(resistorPower, "W") },
        { label: "P (LED)", value: formatEngineering(ledPower, "W") },
      ];
    }
    case "transistorSwitch": {
      const { supplyVoltage = 0, baseVoltage = 0, baseResistance = 1, collectorResistance = 1 } = params;
      const baseResistanceOhms = baseResistance * 1000;
      const isOn = baseVoltage > TRANSISTOR_VBE;
      const baseCurrent = isOn ? (baseVoltage - TRANSISTOR_VBE) / baseResistanceOhms : 0;
      const maxCollectorCurrent = supplyVoltage / collectorResistance;
      const desiredCollectorCurrent = TRANSISTOR_BETA * baseCurrent;
      const isSaturated = desiredCollectorCurrent >= maxCollectorCurrent;
      const collectorCurrent = isSaturated ? maxCollectorCurrent : desiredCollectorCurrent;
      const collectorEmitterVoltage = isSaturated ? 0.2 : supplyVoltage - collectorCurrent * collectorResistance;
      return [
        { label: "State", value: isOn ? (isSaturated ? "Saturated (ON)" : "Active") : "OFF", highlight: true },
        { label: "IB", value: formatEngineering(baseCurrent, "A") },
        { label: "IC", value: formatEngineering(collectorCurrent, "A") },
        { label: "VCE", value: `${collectorEmitterVoltage.toFixed(2)} V` },
      ];
    }
    case "rcFilter": {
      const { resistance = 1, capacitance = 1 } = params;
      const resistanceOhms = resistance * 1000;
      const capacitanceFarads = capacitance * 1e-9;
      const cutoffFrequency = 1 / (2 * Math.PI * resistanceOhms * capacitanceFarads);
      const timeConstant = resistanceOhms * capacitanceFarads;
      return [
        { label: "Cutoff (fc)", value: formatEngineering(cutoffFrequency, "Hz"), highlight: true },
        { label: "Time const (\u03C4)", value: formatEngineering(timeConstant, "s") },
        { label: "Roll-off", value: "-20 dB/dec" },
      ];
    }
  }
}

// --- SVG Path Helpers ---

function horizontalResistorPath(startX: number, endX: number, y: number): string {
  const lead = (endX - startX) * 0.1;
  const zigStart = startX + lead;
  const zigEnd = endX - lead;
  const zigWidth = zigEnd - zigStart;
  const amplitude = 7;
  const offsets = [0, -1, 1, -1, 1, -1, 1, -1, 0];
  const points = offsets.map((multiplier, index) => {
    const pointX = zigStart + (zigWidth * index) / (offsets.length - 1);
    return `${pointX} ${y + multiplier * amplitude}`;
  });
  return `M ${startX} ${y} L ${points.join(" L ")} L ${endX} ${y}`;
}

function verticalResistorPath(x: number, startY: number, endY: number): string {
  const lead = (endY - startY) * 0.1;
  const zigStart = startY + lead;
  const zigEnd = endY - lead;
  const zigHeight = zigEnd - zigStart;
  const amplitude = 7;
  const offsets = [0, -1, 1, -1, 1, -1, 1, -1, 0];
  const points = offsets.map((multiplier, index) => {
    const pointY = zigStart + (zigHeight * index) / (offsets.length - 1);
    return `${x + multiplier * amplitude} ${pointY}`;
  });
  return `M ${x} ${startY} L ${points.join(" L ")} L ${x} ${endY}`;
}

// --- SVG Animation Style (embedded in SVG) ---
const SVG_ANIMATION_STYLE = `.cf{animation:df .8s linear infinite}@keyframes df{to{stroke-dashoffset:-12}}`;

// --- Circuit Diagrams ---

function SimpleResistorCircuit({ params }: CircuitDiagramProps) {
  const { voltage = 9, resistance = 1000 } = params;
  const current = voltage / resistance;
  const hasCurrent = current > 0;
  const wirePath = "M 60 100 L 60 40 L 440 40 L 440 180 L 60 180 L 60 120";

  return (
    <g>
      <path d={wirePath} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      {hasCurrent && <path d={wirePath} className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />}

      {/* Battery */}
      <line x1={48} y1={100} x2={72} y2={100} stroke={COMPONENT_COLOR} strokeWidth={3} strokeLinecap="round" />
      <line x1={52} y1={120} x2={68} y2={120} stroke={COMPONENT_COLOR} strokeWidth={2} strokeLinecap="round" />
      <text x={76} y={102} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">+</text>
      <text x={76} y={120} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">{"\u2212"}</text>
      <text x={30} y={112} fontSize={9} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">{voltage}V</text>

      {/* Resistor */}
      <path d={horizontalResistorPath(180, 320, 40)} stroke={COMPONENT_COLOR} strokeWidth={1.5} fill="none" />
      <text x={250} y={28} fontSize={9} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">{formatResistance(resistance)}</text>
      <text x={250} y={60} fontSize={8} fill={LABEL_COLOR} textAnchor="middle">R</text>

      {/* Current arrow */}
      {hasCurrent && <polygon points="0,-3 6,0 0,3" fill={ACTIVE_COLOR} opacity={0.8} transform="translate(440,110) rotate(90)" />}
      <text x={458} y={112} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace" dominantBaseline="central">
        {formatEngineering(current, "A")}
      </text>
    </g>
  );
}

function VoltageDividerCircuit({ params }: CircuitDiagramProps) {
  const { voltage = 12, resistance1 = 2000, resistance2 = 1000 } = params;
  const outputVoltage = voltage * resistance2 / (resistance1 + resistance2);
  const wirePath = "M 60 100 L 60 40 L 440 40 L 440 180 L 60 180 L 60 120";

  return (
    <g>
      <path d={wirePath} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      <path d={wirePath} className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />

      {/* Battery */}
      <line x1={48} y1={100} x2={72} y2={100} stroke={COMPONENT_COLOR} strokeWidth={3} strokeLinecap="round" />
      <line x1={52} y1={120} x2={68} y2={120} stroke={COMPONENT_COLOR} strokeWidth={2} strokeLinecap="round" />
      <text x={76} y={102} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">+</text>
      <text x={76} y={120} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">{"\u2212"}</text>
      <text x={30} y={112} fontSize={9} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">{voltage}V</text>

      {/* R1 */}
      <path d={horizontalResistorPath(120, 230, 40)} stroke={COMPONENT_COLOR} strokeWidth={1.5} fill="none" />
      <text x={175} y={28} fontSize={8} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">R1: {formatResistance(resistance1)}</text>

      {/* Junction dot */}
      <circle cx={255} cy={40} r={3.5} fill={ACTIVE_COLOR} />

      {/* R2 */}
      <path d={horizontalResistorPath(280, 390, 40)} stroke={COMPONENT_COLOR} strokeWidth={1.5} fill="none" />
      <text x={335} y={28} fontSize={8} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">R2: {formatResistance(resistance2)}</text>

      {/* Vout indicator */}
      <line x1={255} y1={44} x2={255} y2={78} stroke={ACTIVE_COLOR} strokeWidth={1} strokeDasharray="3 3" />
      <text x={255} y={92} fontSize={10} fill={ACTIVE_COLOR} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
        Vout = {outputVoltage.toFixed(2)}V
      </text>
    </g>
  );
}

function LedCircuitDiagram({ params }: CircuitDiagramProps) {
  const { voltage = 5, resistance = 220 } = params;
  const current = Math.max(0, (voltage - LED_FORWARD_VOLTAGE) / resistance);
  const isOn = current > 0.001;
  const wirePath = "M 60 100 L 60 40 L 440 40 L 440 180 L 60 180 L 60 120";
  const ledColor = isOn ? "#ef4444" : COMPONENT_COLOR;

  return (
    <g>
      <path d={wirePath} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      {isOn && <path d={wirePath} className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />}

      {/* Battery */}
      <line x1={48} y1={100} x2={72} y2={100} stroke={COMPONENT_COLOR} strokeWidth={3} strokeLinecap="round" />
      <line x1={52} y1={120} x2={68} y2={120} stroke={COMPONENT_COLOR} strokeWidth={2} strokeLinecap="round" />
      <text x={76} y={102} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">+</text>
      <text x={76} y={120} fontSize={7} fill={LABEL_COLOR} dominantBaseline="central">{"\u2212"}</text>
      <text x={30} y={112} fontSize={9} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">{voltage}V</text>

      {/* Resistor */}
      <path d={horizontalResistorPath(130, 260, 40)} stroke={COMPONENT_COLOR} strokeWidth={1.5} fill="none" />
      <text x={195} y={28} fontSize={8} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">{formatResistance(resistance)}</text>
      <text x={195} y={60} fontSize={8} fill={LABEL_COLOR} textAnchor="middle">R</text>

      {/* LED triangle */}
      <polygon points="310,30 310,50 328,40" fill={isOn ? "rgba(239,68,68,0.15)" : "none"} stroke={ledColor} strokeWidth={1.5} strokeLinejoin="round" />
      <line x1={328} y1={30} x2={328} y2={50} stroke={ledColor} strokeWidth={2} />
      {/* Light rays */}
      {isOn && (
        <>
          <line x1={316} y1={26} x2={322} y2={18} stroke="#ef4444" strokeWidth={1} opacity={0.8} />
          <line x1={322} y1={28} x2={328} y2={20} stroke="#ef4444" strokeWidth={1} opacity={0.8} />
        </>
      )}
      <text x={319} y={62} fontSize={8} fill={LABEL_COLOR} textAnchor="middle">LED</text>
      <text x={319} y={74} fontSize={7} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">Vf{"\u2248"}2V</text>

      {/* Current label */}
      {isOn && (
        <text x={440} y={112} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace" textAnchor="middle">
          {formatEngineering(current, "A")}
        </text>
      )}
    </g>
  );
}

function TransistorSwitchDiagram({ params }: CircuitDiagramProps) {
  const { supplyVoltage = 9, baseVoltage = 3.3, baseResistance = 10, collectorResistance = 330 } = params;
  const isOn = baseVoltage > TRANSISTOR_VBE;
  const baseCurrent = isOn ? (baseVoltage - TRANSISTOR_VBE) / (baseResistance * 1000) : 0;
  const maxIc = supplyVoltage / collectorResistance;
  const isSaturated = isOn && TRANSISTOR_BETA * baseCurrent >= maxIc;
  const transistorColor = isOn ? ACTIVE_COLOR : COMPONENT_COLOR;

  // Transistor position
  const transistorX = 268;
  const transistorY = 130;
  const collectorX = transistorX + 8;
  const collectorY = transistorY - 16;
  const baseX = transistorX - 8;
  const baseY = transistorY;
  const emitterX = transistorX + 8;
  const emitterY = transistorY + 16;

  return (
    <g>
      {/* Vcc supply line and Rc */}
      <path d={`M ${collectorX} 20 L ${collectorX} 30`} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      <path d={verticalResistorPath(collectorX, 30, 90)} stroke={transistorColor} strokeWidth={1.5} fill="none" />
      <path d={`M ${collectorX} 90 L ${collectorX} ${collectorY}`} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      {isOn && <path d={`M ${collectorX} 20 L ${collectorX} ${collectorY}`} className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />}

      {/* Vcc label */}
      <text x={collectorX} y={14} fontSize={9} fill="#ef4444" textAnchor="middle" fontWeight={600}>Vcc</text>
      <text x={collectorX + 22} y={22} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace">{supplyVoltage}V</text>
      <text x={collectorX + 22} y={65} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace">Rc: {collectorResistance}{"\u03A9"}</text>

      {/* Base wire: VB -> Rb -> base */}
      <path d={`M 55 ${baseY} L 80 ${baseY}`} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      <path d={horizontalResistorPath(80, 220, baseY)} stroke={isOn ? "#f59e0b" : COMPONENT_COLOR} strokeWidth={1.5} fill="none" />
      <path d={`M 220 ${baseY} L ${baseX} ${baseY}`} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      {isOn && <path d={`M 55 ${baseY} L ${baseX} ${baseY}`} className="cf" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />}

      {/* VB label */}
      <text x={38} y={baseY - 8} fontSize={9} fill="#f59e0b" textAnchor="middle" fontWeight={600}>VB</text>
      <text x={38} y={baseY + 8} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace">{baseVoltage}V</text>
      <text x={150} y={baseY - 12} fontSize={8} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">Rb: {baseResistance}k{"\u03A9"}</text>

      {/* Emitter to GND */}
      <path d={`M ${emitterX} ${emitterY} L ${emitterX} 195`} stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      {isOn && <path d={`M ${emitterX} ${emitterY} L ${emitterX} 195`} className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />}

      {/* Ground */}
      <line x1={emitterX - 8} y1={195} x2={emitterX + 8} y2={195} stroke={COMPONENT_COLOR} strokeWidth={1.5} />
      <line x1={emitterX - 5} y1={199} x2={emitterX + 5} y2={199} stroke={COMPONENT_COLOR} strokeWidth={1.5} />
      <line x1={emitterX - 2} y1={203} x2={emitterX + 2} y2={203} stroke={COMPONENT_COLOR} strokeWidth={1.5} />

      {/* NPN Transistor symbol */}
      <circle cx={transistorX} cy={transistorY} r={20} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={1.5} />
      <line x1={baseX} y1={transistorY - 10} x2={baseX} y2={transistorY + 10} stroke={transistorColor} strokeWidth={2.5} />
      <line x1={baseX} y1={transistorY - 5} x2={collectorX} y2={collectorY} stroke={transistorColor} strokeWidth={1.5} />
      <line x1={baseX} y1={transistorY + 5} x2={emitterX} y2={emitterY} stroke={transistorColor} strokeWidth={1.5} />
      <polygon points={`${emitterX},${emitterY} ${emitterX - 7},${emitterY - 5} ${emitterX - 3},${emitterY + 3}`} fill={transistorColor} />

      {/* Terminal labels */}
      <text x={collectorX + 6} y={collectorY} fontSize={7} fill={LABEL_COLOR}>C</text>
      <text x={baseX - 6} y={baseY + 1} fontSize={7} fill={LABEL_COLOR} textAnchor="end">B</text>
      <text x={emitterX + 6} y={emitterY + 4} fontSize={7} fill={LABEL_COLOR}>E</text>

      {/* State */}
      <text x={transistorX + 35} y={transistorY + 38} fontSize={9} fill={isOn ? (isSaturated ? "#22c55e" : ACTIVE_COLOR) : "#ef4444"} fontWeight={600}>
        {isOn ? (isSaturated ? "ON (Sat)" : "Active") : "OFF"}
      </text>
    </g>
  );
}

function RcFilterDiagram({ params }: CircuitDiagramProps) {
  const { resistance = 10, capacitance = 100 } = params;
  const resistanceOhms = resistance * 1000;
  const capacitanceFarads = capacitance * 1e-9;
  const cutoffFrequency = 1 / (2 * Math.PI * resistanceOhms * capacitanceFarads);

  return (
    <g>
      {/* Input wire */}
      <path d="M 50 110 L 120 110" stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      <path d="M 50 110 L 120 110" className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.6} />

      {/* Resistor */}
      <path d={horizontalResistorPath(120, 260, 110)} stroke={COMPONENT_COLOR} strokeWidth={1.5} fill="none" />

      {/* Wire to junction */}
      <path d="M 260 110 L 320 110" stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />

      {/* Junction dot */}
      <circle cx={320} cy={110} r={3.5} fill={ACTIVE_COLOR} />

      {/* Output wire */}
      <path d="M 320 110 L 455 110" stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />
      <path d="M 320 110 L 455 110" className="cf" stroke={ACTIVE_COLOR} strokeWidth={1.5} strokeDasharray="4 8" fill="none" opacity={0.4} />

      {/* Wire down to capacitor */}
      <path d="M 320 110 L 320 133" stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />

      {/* Capacitor plates */}
      <line x1={307} y1={135} x2={333} y2={135} stroke={COMPONENT_COLOR} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={307} y1={143} x2={333} y2={143} stroke={COMPONENT_COLOR} strokeWidth={2.5} strokeLinecap="round" />

      {/* Wire to ground */}
      <path d="M 320 143 L 320 185" stroke={WIRE_COLOR} strokeWidth={1.5} fill="none" />

      {/* Ground */}
      <line x1={312} y1={185} x2={328} y2={185} stroke={COMPONENT_COLOR} strokeWidth={1.5} />
      <line x1={315} y1={189} x2={325} y2={189} stroke={COMPONENT_COLOR} strokeWidth={1.5} />
      <line x1={318} y1={193} x2={322} y2={193} stroke={COMPONENT_COLOR} strokeWidth={1.5} />

      {/* Labels */}
      <text x={30} y={108} fontSize={9} fill={VALUE_COLOR} textAnchor="end" fontWeight={600}>Vin</text>
      <text x={465} y={108} fontSize={9} fill={VALUE_COLOR} fontWeight={600}>Vout</text>
      <text x={190} y={98} fontSize={8} fill={VALUE_COLOR} textAnchor="middle" fontFamily="monospace">
        R: {resistance >= 1 ? `${resistance}k\u03A9` : `${resistance * 1000}\u03A9`}
      </text>
      <text x={350} y={141} fontSize={8} fill={VALUE_COLOR} fontFamily="monospace">C: {capacitance}nF</text>

      {/* Cutoff frequency */}
      <text x={250} y={195} fontSize={9} fill={ACTIVE_COLOR} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
        fc = {formatEngineering(cutoffFrequency, "Hz")}
      </text>

      {/* Signal direction arrow */}
      <polygon points="0,-3 6,0 0,3" fill={ACTIVE_COLOR} opacity={0.8} transform="translate(85,110)" />
    </g>
  );
}

// --- Renderer Map ---

const CIRCUIT_RENDERERS: Record<CircuitType, React.ComponentType<CircuitDiagramProps>> = {
  resistor: SimpleResistorCircuit,
  voltageDivider: VoltageDividerCircuit,
  led: LedCircuitDiagram,
  transistorSwitch: TransistorSwitchDiagram,
  rcFilter: RcFilterDiagram,
};

// --- Main Component ---

export function CircuitSimulator() {
  const translations = useTranslations("circuitSimulator");
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitType>("resistor");
  const [parameterValues, setParameterValues] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    for (const parameter of CIRCUIT_EXAMPLES.resistor.parameters) {
      defaults[parameter.id] = parameter.defaultValue;
    }
    return defaults;
  });

  const circuitInfo = CIRCUIT_EXAMPLES[selectedCircuit];

  useEffect(() => {
    const defaults: Record<string, number> = {};
    for (const parameter of circuitInfo.parameters) {
      defaults[parameter.id] = parameter.defaultValue;
    }
    setParameterValues(defaults);
  }, [circuitInfo]);

  const results = useMemo(
    () => calculateResults(selectedCircuit, parameterValues),
    [selectedCircuit, parameterValues],
  );

  const handleParameterChange = useCallback((parameterId: string, value: number) => {
    setParameterValues((previous) => ({ ...previous, [parameterId]: value }));
  }, []);

  const handleReset = useCallback(() => {
    const defaults: Record<string, number> = {};
    for (const parameter of circuitInfo.parameters) {
      defaults[parameter.id] = parameter.defaultValue;
    }
    setParameterValues(defaults);
  }, [circuitInfo]);

  const DiagramComponent = CIRCUIT_RENDERERS[selectedCircuit];

  return (
    <ScrollReveal className="mt-8">
      <div className="glass-card rounded-xl p-6 border border-card-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">Circuit Simulator</span>
            <span className="text-[9px] text-muted/70 font-mono">{circuitInfo.tags}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCircuit}
              onChange={(event) => setSelectedCircuit(event.target.value as CircuitType)}
              aria-label="Select circuit type"
              className="text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer"
            >
              <option value="resistor">Ohm&apos;s Law</option>
              <option value="voltageDivider">Voltage Divider</option>
              <option value="led">LED Circuit</option>
              <option value="transistorSwitch">Transistor Switch</option>
              <option value="rcFilter">RC Low-Pass Filter</option>
            </select>
            <button
              onClick={handleReset}
              className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Parameter sliders */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
          {circuitInfo.parameters.map((parameter) => (
            <div key={parameter.id} className="flex items-center gap-2 min-w-[220px] flex-1">
              <span className="text-[9px] text-muted/70 w-14 shrink-0">{parameter.label}</span>
              <input
                type="range"
                min={parameter.min}
                max={parameter.max}
                step={parameter.step}
                value={parameterValues[parameter.id] ?? parameter.defaultValue}
                onChange={(event) => handleParameterChange(parameter.id, Number(event.target.value))}
                className="flex-1 h-1 accent-blue-500 cursor-pointer"
                aria-label={`Adjust ${parameter.label}`}
              />
              <span className="text-[10px] font-mono text-foreground/80 w-16 text-right">
                {parameterValues[parameter.id] ?? parameter.defaultValue} {parameter.unit}
              </span>
            </div>
          ))}
        </div>

        {/* SVG Circuit Diagram */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full rounded-lg bg-card-border/10 border border-card-border/30 select-none"
          style={{ aspectRatio: `${SVG_WIDTH} / ${SVG_HEIGHT}` }}
          role="img"
          aria-label={`Circuit diagram: ${circuitInfo.name}`}
        >
          <defs>
            <style>{SVG_ANIMATION_STYLE}</style>
          </defs>
          <DiagramComponent params={parameterValues} />
        </svg>

        {/* Calculated Results */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 bg-card-border/20 rounded-lg px-3 py-2">
          {results.map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted/70">{label}</span>
              <span className={`text-[10px] font-mono font-semibold ${highlight ? "text-accent" : "text-foreground/80"}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COMPONENT_COLOR }} />
            <span className="text-[9px] text-muted">Component</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ACTIVE_COLOR }} />
            <span className="text-[9px] text-muted">Current Flow</span>
          </div>
        </div>

        <CircuitDetails selectedCircuit={selectedCircuit} />
      </div>
    </ScrollReveal>
  );
}
