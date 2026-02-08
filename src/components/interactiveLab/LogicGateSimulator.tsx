"use client";

import { useState, useMemo } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type GateType, LOGIC_GATES, GATE_DETAILS } from "@/data/logicGates";

const GATE_TYPES: { key: GateType; label: string }[] = [
  { key: "and", label: "AND" },
  { key: "or", label: "OR" },
  { key: "not", label: "NOT" },
  { key: "nand", label: "NAND" },
  { key: "nor", label: "NOR" },
  { key: "xor", label: "XOR" },
  { key: "xnor", label: "XNOR" },
];

const SVG_WIDTH = 400;
const SVG_HEIGHT = 200;

function evaluateGate(gate: GateType, inputA: boolean, inputB: boolean): boolean {
  switch (gate) {
    case "and": return inputA && inputB;
    case "or": return inputA || inputB;
    case "not": return !inputA;
    case "nand": return !(inputA && inputB);
    case "nor": return !(inputA || inputB);
    case "xor": return inputA !== inputB;
    case "xnor": return inputA === inputB;
  }
}

function GateSymbol({ gate, inputA, inputB, output }: { gate: GateType; inputA: boolean; inputB: boolean; output: boolean }) {
  const gateInfo = LOGIC_GATES[gate];
  const isSingleInput = gateInfo.inputCount === 1;
  const highColor = "#22c55e";
  const lowColor = "rgba(255,255,255,0.2)";
  const gateColor = "rgba(109,90,207,0.4)";
  const gateBorder = "#6d5acf";

  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;

  // Input wire positions
  const inputY1 = isSingleInput ? centerY : centerY - 25;
  const inputY2 = centerY + 25;
  const inputStartX = 40;
  const gateLeftX = centerX - 50;
  const gateRightX = centerX + 50;
  const outputEndX = SVG_WIDTH - 40;

  // Gate body path based on type
  const getGatePath = () => {
    const top = centerY - 40;
    const bottom = centerY + 40;
    const left = gateLeftX;
    const right = gateRightX;

    switch (gate) {
      case "and":
      case "nand":
        // Arc from (centerX, bottom) to (centerX, top) reaching rightmost at gateRightX
        return `M ${left} ${top} L ${left} ${bottom} L ${centerX} ${bottom} A 50 40 0 0 0 ${centerX} ${top} Z`;
      case "or":
      case "nor":
      case "xor":
      case "xnor":
        return `M ${left} ${top} Q ${left + 20} ${centerY} ${left} ${bottom} Q ${centerX + 10} ${bottom} ${right} ${centerY} Q ${centerX + 10} ${top} ${left} ${top} Z`;
      case "not":
        return `M ${left} ${top} L ${left} ${bottom} L ${right - 8} ${centerY} Z`;
    }
  };

  // Does gate have inversion bubble?
  const hasInversion = ["not", "nand", "nor", "xnor"].includes(gate);
  const bubbleX = gate === "not" ? gateRightX - 5 : gateRightX + 2;

  // XOR/XNOR extra curve
  const hasExtraCurve = gate === "xor" || gate === "xnor";

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[400px] mx-auto">
      {/* Input wires */}
      <line x1={inputStartX} y1={inputY1} x2={gateLeftX} y2={inputY1} stroke={inputA ? highColor : lowColor} strokeWidth={2.5} />
      {!isSingleInput && (
        <line x1={inputStartX} y1={inputY2} x2={gateLeftX} y2={inputY2} stroke={inputB ? highColor : lowColor} strokeWidth={2.5} />
      )}

      {/* Output wire */}
      <line x1={hasInversion ? bubbleX + 8 : gateRightX} y1={centerY} x2={outputEndX} y2={centerY} stroke={output ? highColor : lowColor} strokeWidth={2.5} />

      {/* Gate body */}
      <path d={getGatePath()} fill={gateColor} stroke={gateBorder} strokeWidth={2} />

      {/* Extra curve for XOR */}
      {hasExtraCurve && (
        <path
          d={`M ${gateLeftX - 8} ${centerY - 40} Q ${gateLeftX + 12} ${centerY} ${gateLeftX - 8} ${centerY + 40}`}
          fill="none"
          stroke={gateBorder}
          strokeWidth={2}
        />
      )}

      {/* Inversion bubble */}
      {hasInversion && (
        <circle cx={bubbleX + 4} cy={centerY} r={5} fill="rgba(0,0,0,0.5)" stroke={gateBorder} strokeWidth={1.5} />
      )}

      {/* Input labels */}
      <text x={inputStartX - 5} y={inputY1 + 4} textAnchor="end" className="text-[11px] font-mono font-bold" fill={inputA ? highColor : lowColor}>A</text>
      {!isSingleInput && (
        <text x={inputStartX - 5} y={inputY2 + 4} textAnchor="end" className="text-[11px] font-mono font-bold" fill={inputB ? highColor : lowColor}>B</text>
      )}

      {/* Output label */}
      <text x={outputEndX + 5} y={centerY + 4} className="text-[11px] font-mono font-bold" fill={output ? highColor : lowColor}>
        {output ? "1" : "0"}
      </text>

      {/* Input toggle indicators */}
      <circle cx={inputStartX} cy={inputY1} r={6} fill={inputA ? highColor : "rgba(255,255,255,0.1)"} stroke={inputA ? highColor : lowColor} strokeWidth={1} className="cursor-pointer" />
      {!isSingleInput && (
        <circle cx={inputStartX} cy={inputY2} r={6} fill={inputB ? highColor : "rgba(255,255,255,0.1)"} stroke={inputB ? highColor : lowColor} strokeWidth={1} className="cursor-pointer" />
      )}

      {/* Output LED */}
      <circle cx={outputEndX} cy={centerY} r={8} fill={output ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.05)"} stroke={output ? highColor : lowColor} strokeWidth={2}>
        {output && <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />}
      </circle>

      {/* Gate name */}
      <text x={centerX} y={22} textAnchor="middle" className="fill-accent text-[12px] font-semibold">{LOGIC_GATES[gate].name}</text>
    </svg>
  );
}

export function LogicGateSimulator() {
  const [selectedGate, setSelectedGate] = useState<GateType>("and");
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);

  const gateInfo = LOGIC_GATES[selectedGate];
  const output = evaluateGate(selectedGate, inputA, inputB);

  const truthTable = useMemo(() => gateInfo.truthTable, [gateInfo]);

  return (
    <div className="space-y-4">
      {/* Gate selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Gate Type</label>
          <div className="flex gap-1 flex-wrap">
            {GATE_TYPES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedGate(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedGate === key
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

      {/* Input controls */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setInputA(!inputA)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            inputA
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-card-border/20 text-muted border border-card-border"
          }`}
        >
          Input A: {inputA ? "HIGH (1)" : "LOW (0)"}
        </button>
        {gateInfo.inputCount === 2 && (
          <button
            onClick={() => setInputB(!inputB)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
              inputB
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-card-border/20 text-muted border border-card-border"
            }`}
          >
            Input B: {inputB ? "HIGH (1)" : "LOW (0)"}
          </button>
        )}
        <div className={`px-3 py-1.5 rounded text-[11px] font-mono ${output ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          Output: {output ? "HIGH (1)" : "LOW (0)"}
        </div>
      </div>

      {/* Gate visualization */}
      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        <GateSymbol gate={selectedGate} inputA={inputA} inputB={inputB} output={output} />
      </div>

      {/* Truth table */}
      <div className="overflow-x-auto">
        <table className="text-[10px] font-mono w-full max-w-[300px]">
          <thead>
            <tr className="border-b border-card-border/50">
              <th className="px-3 py-1.5 text-muted/70 text-left">A</th>
              {gateInfo.inputCount === 2 && <th className="px-3 py-1.5 text-muted/70 text-left">B</th>}
              <th className="px-3 py-1.5 text-muted/70 text-left">Output</th>
            </tr>
          </thead>
          <tbody>
            {truthTable.map((row, index) => {
              const rowA = row[0];
              const rowB = gateInfo.inputCount === 2 ? row[1] : null;
              const rowOutput = row[row.length - 1];
              const isCurrentRow = gateInfo.inputCount === 1
                ? rowA === inputA
                : rowA === inputA && rowB === inputB;

              return (
                <tr
                  key={index}
                  className={`border-b border-card-border/20 ${isCurrentRow ? "bg-accent/10" : ""}`}
                >
                  <td className={`px-3 py-1.5 ${rowA ? "text-emerald-400" : "text-muted/50"}`}>{rowA ? "1" : "0"}</td>
                  {gateInfo.inputCount === 2 && (
                    <td className={`px-3 py-1.5 ${rowB ? "text-emerald-400" : "text-muted/50"}`}>{rowB ? "1" : "0"}</td>
                  )}
                  <td className={`px-3 py-1.5 font-bold ${rowOutput ? "text-emerald-400" : "text-red-400"}`}>{rowOutput ? "1" : "0"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SimulatorDetails data={GATE_DETAILS[selectedGate]} />
    </div>
  );
}
