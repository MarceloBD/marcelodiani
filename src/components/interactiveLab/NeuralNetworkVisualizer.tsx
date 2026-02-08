"use client";

import { useState, useMemo } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import {
  type NeuralNetworkMode,
  type ActivationFunction,
  type InputExample,
  ACTIVATION_FUNCTIONS,
  INPUT_EXAMPLES,
  NN_MODE_INFO,
  forwardPass,
} from "@/data/neuralNetworkLayers";

const MODES: { key: NeuralNetworkMode; label: string }[] = [
  { key: "simpleNN", label: "Simple NN" },
  { key: "transformer", label: "Transformer" },
];

const ACTIVATIONS: { key: ActivationFunction; label: string }[] = [
  { key: "relu", label: "ReLU" },
  { key: "sigmoid", label: "Sigmoid" },
  { key: "tanh", label: "Tanh" },
  { key: "step", label: "Step (0/1)" },
];

const INPUT_PRESETS: { key: InputExample; label: string }[] = [
  { key: "binary", label: "Binary [1,0,1]" },
  { key: "small", label: "Small [0.1,0.2,0.3]" },
  { key: "large", label: "Large [5,-3,2]" },
  { key: "negative", label: "Negative [-1,-2,-1]" },
  { key: "custom", label: "Custom" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 320;

function generateWeights(layerSizes: number[]): number[][][] {
  const weights: number[][][] = [];
  for (let layer = 0; layer < layerSizes.length - 1; layer++) {
    const layerWeights: number[][] = [];
    for (let from = 0; from < layerSizes[layer]; from++) {
      const neuronWeights: number[] = [];
      for (let to = 0; to < layerSizes[layer + 1]; to++) {
        neuronWeights.push(Math.sin(layer * 100 + from * 10 + to) * 0.8);
      }
      layerWeights.push(neuronWeights);
    }
    weights.push(layerWeights);
  }
  return weights;
}

function valueToColor(value: number, maxAbsValue: number): string {
  const normalized = maxAbsValue > 0 ? value / maxAbsValue : 0;
  if (normalized >= 0) {
    const intensity = Math.min(1, Math.abs(normalized));
    return `rgba(109,90,207,${0.3 + intensity * 0.7})`;
  }
  const intensity = Math.min(1, Math.abs(normalized));
  return `rgba(239,68,68,${0.3 + intensity * 0.7})`;
}

function SimpleNNDiagram({
  hiddenLayers,
  neuronsPerLayer,
  activation,
  inputValues,
}: {
  hiddenLayers: number;
  neuronsPerLayer: number;
  activation: ActivationFunction;
  inputValues: number[];
}) {
  const inputSize = 3;
  const outputSize = 2;
  const layerSizes = useMemo(
    () => [inputSize, ...Array(hiddenLayers).fill(neuronsPerLayer), outputSize],
    [hiddenLayers, neuronsPerLayer]
  );
  const layerCount = layerSizes.length;

  const weights = useMemo(() => generateWeights(layerSizes), [layerSizes]);

  const layerOutputs = useMemo(
    () => forwardPass(inputValues, weights, layerSizes, ACTIVATION_FUNCTIONS[activation].evaluate),
    [inputValues, weights, layerSizes, activation]
  );

  const maxAbsValue = useMemo(() => {
    let maxValue = 0;
    for (const layer of layerOutputs) {
      for (const value of layer) {
        maxValue = Math.max(maxValue, Math.abs(value));
      }
    }
    return maxValue || 1;
  }, [layerOutputs]);

  const totalParams = useMemo(() => {
    let count = 0;
    for (let i = 0; i < layerSizes.length - 1; i++) {
      count += layerSizes[i] * layerSizes[i + 1] + layerSizes[i + 1];
    }
    return count;
  }, [layerSizes]);

  const layerSpacing = (SVG_WIDTH - 80) / (layerCount - 1);
  const padding = 40;

  const nodePositions = layerSizes.map((size, layerIndex) => {
    const x = padding + layerIndex * layerSpacing;
    return Array.from({ length: size }, (_, neuronIndex) => {
      const totalHeight = SVG_HEIGHT - 80;
      const spacing = size > 1 ? totalHeight / (size - 1) : 0;
      const startY = size > 1 ? 40 : SVG_HEIGHT / 2;
      return { x, y: startY + neuronIndex * spacing };
    });
  });

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      {/* Connections with value-based opacity */}
      {weights.map((layerWeights, layerIndex) =>
        layerWeights.map((neuronWeights, fromIndex) =>
          neuronWeights.map((weight, toIndex) => {
            const from = nodePositions[layerIndex][fromIndex];
            const to = nodePositions[layerIndex + 1][toIndex];
            const fromValue = layerOutputs[layerIndex]?.[fromIndex] ?? 0;
            const signalStrength = Math.abs(fromValue * weight);
            const maxSignal = maxAbsValue * 0.8;
            const normalizedStrength = maxSignal > 0 ? Math.min(1, signalStrength / maxSignal) : 0.2;
            const color = weight >= 0
              ? `rgba(109,90,207,${0.1 + normalizedStrength * 0.6})`
              : `rgba(239,68,68,${0.1 + normalizedStrength * 0.6})`;
            return (
              <line
                key={`${layerIndex}-${fromIndex}-${toIndex}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={color}
                strokeWidth={0.3 + normalizedStrength * 2}
              />
            );
          })
        )
      )}

      {/* Nodes with computed values */}
      {nodePositions.map((layer, layerIndex) =>
        layer.map((pos, neuronIndex) => {
          const value = layerOutputs[layerIndex]?.[neuronIndex] ?? 0;
          const fillColor = valueToColor(value, maxAbsValue);
          const isInput = layerIndex === 0;
          const isOutput = layerIndex === layerCount - 1;
          const strokeColor = isInput ? "#3b82f6" : isOutput ? "#22c55e" : "#6d5acf";

          return (
            <g key={`node-${layerIndex}-${neuronIndex}`}>
              <circle cx={pos.x} cy={pos.y} r={12} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} />
              <text x={pos.x} y={pos.y + 3} textAnchor="middle" className="fill-white text-[6px] font-mono">
                {value.toFixed(1)}
              </text>
            </g>
          );
        })
      )}

      {/* Layer labels */}
      {layerSizes.map((_, index) => {
        const x = padding + index * layerSpacing;
        const label = index === 0 ? "Input" : index === layerCount - 1 ? "Output" : `Hidden ${index}`;
        return (
          <text key={`label-${index}`} x={x} y={SVG_HEIGHT - 5} textAnchor="middle" className="fill-muted/40 text-[8px]">
            {label}
          </text>
        );
      })}

      <text x={SVG_WIDTH - 10} y={15} textAnchor="end" className="fill-muted/50 text-[9px] font-mono">
        Parameters: {totalParams}
      </text>
      <text x={10} y={15} className="fill-accent text-[9px] font-mono">
        Activation: {ACTIVATION_FUNCTIONS[activation].expression}
      </text>
    </svg>
  );
}

function TransformerDiagram() {
  const blocks = [
    { label: "Input\nEmbedding", color: "rgba(59,130,246,0.4)", border: "#3b82f6" },
    { label: "Positional\nEncoding", color: "rgba(168,85,247,0.4)", border: "#a855f7" },
    { label: "Multi-Head\nAttention", color: "rgba(109,90,207,0.5)", border: "#6d5acf" },
    { label: "Add &\nNorm", color: "rgba(34,197,94,0.3)", border: "#22c55e" },
    { label: "Feed\nForward", color: "rgba(109,90,207,0.4)", border: "#6d5acf" },
    { label: "Add &\nNorm", color: "rgba(34,197,94,0.3)", border: "#22c55e" },
    { label: "Linear +\nSoftmax", color: "rgba(251,191,36,0.4)", border: "#fbbf24" },
    { label: "Output", color: "rgba(239,68,68,0.3)", border: "#ef4444" },
  ];

  const blockWidth = 65;
  const blockHeight = 55;
  const gap = 5;
  const startX = 20;
  const centerY = SVG_HEIGHT / 2;

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      <text x={SVG_WIDTH / 2} y={20} textAnchor="middle" className="fill-accent text-[11px] font-semibold">Transformer Architecture (Simplified)</text>

      {blocks.map((block, index) => {
        const x = startX + index * (blockWidth + gap);
        return (
          <g key={index}>
            {index > 0 && (
              <line x1={x - gap} y1={centerY} x2={x} y2={centerY}
                stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#blockArrow)" />
            )}
            <rect x={x} y={centerY - blockHeight / 2} width={blockWidth} height={blockHeight}
              rx={6} fill={block.color} stroke={block.border} strokeWidth={1.5} />
            {block.label.split("\n").map((line, lineIndex) => (
              <text key={lineIndex} x={x + blockWidth / 2} y={centerY - 5 + lineIndex * 13}
                textAnchor="middle" className="fill-foreground text-[8px]">{line}</text>
            ))}
          </g>
        );
      })}

      {/* Skip connections */}
      <path
        d={`M ${startX + 2 * (blockWidth + gap) + blockWidth / 2} ${centerY - blockHeight / 2 - 5} Q ${startX + 3 * (blockWidth + gap)} ${centerY - blockHeight / 2 - 25} ${startX + 3 * (blockWidth + gap) + blockWidth / 2} ${centerY - blockHeight / 2 - 5}`}
        fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={startX + 2.5 * (blockWidth + gap) + blockWidth} y={centerY - blockHeight / 2 - 22}
        textAnchor="middle" className="fill-emerald-400/50 text-[7px]">Skip connection</text>

      <path
        d={`M ${startX + 4 * (blockWidth + gap) + blockWidth / 2} ${centerY - blockHeight / 2 - 5} Q ${startX + 5 * (blockWidth + gap)} ${centerY - blockHeight / 2 - 25} ${startX + 5 * (blockWidth + gap) + blockWidth / 2} ${centerY - blockHeight / 2 - 5}`}
        fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Attention matrix */}
      <g transform={`translate(${startX + 2 * (blockWidth + gap)}, ${centerY + blockHeight / 2 + 20})`}>
        <text x={blockWidth / 2} y={0} textAnchor="middle" className="fill-muted/50 text-[7px]">Attention Matrix</text>
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const value = Math.abs(Math.sin(row * 3 + col * 7)) * 0.8 + 0.2;
            return (
              <rect key={`${row}-${col}`} x={blockWidth / 2 - 20 + col * 10} y={5 + row * 10}
                width={9} height={9} rx={1} fill={`rgba(109,90,207,${value})`} />
            );
          })
        )}
        <text x={blockWidth / 2 - 25} y={20} textAnchor="end" className="fill-muted/30 text-[6px]">Q×Kᵀ</text>
      </g>

      <text x={startX + 2 * (blockWidth + gap) + blockWidth} y={SVG_HEIGHT - 15} textAnchor="middle" className="fill-muted/40 text-[8px]">
        × N layers
      </text>
      <rect x={startX + 2 * (blockWidth + gap) - 3} y={centerY - blockHeight / 2 - 8}
        width={(blockWidth + gap) * 4 + 6} height={blockHeight + 16} rx={4}
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="6 3" />

      <defs>
        <marker id="blockArrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>
    </svg>
  );
}

export function NeuralNetworkVisualizer() {
  const [selectedMode, setSelectedMode] = useState<NeuralNetworkMode>("simpleNN");
  const [hiddenLayers, setHiddenLayers] = useState(2);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState(4);
  const [activation, setActivation] = useState<ActivationFunction>("relu");
  const [selectedInput, setSelectedInput] = useState<InputExample>("binary");
  const [customInputs, setCustomInputs] = useState([0.5, 0.5, 0.5]);

  const inputValues = useMemo(() => {
    if (selectedInput === "custom") return customInputs;
    return INPUT_EXAMPLES[selectedInput].values;
  }, [selectedInput, customInputs]);

  const activationGraph = useMemo(() => {
    const func = ACTIVATION_FUNCTIONS[activation];
    return Array.from({ length: 100 }, (_, i) => {
      const x = (i / 100) * 6 - 3;
      return { x, y: func.evaluate(x) };
    });
  }, [activation]);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Architecture</label>
          <div className="flex gap-1">
            {MODES.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedMode(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedMode === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}>{label}</button>
            ))}
          </div>
        </div>
        {selectedMode === "simpleNN" && (
          <div>
            <label className="block text-[10px] text-muted mb-1">Activation</label>
            <div className="flex gap-1">
              {ACTIVATIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setActivation(key)}
                  className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                    activation === key
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-muted/60 hover:text-muted border border-card-border"
                  }`}>{label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input examples selector (Simple NN only) */}
      {selectedMode === "simpleNN" && (
        <div className="space-y-2">
          <label className="block text-[10px] text-muted">Input Example</label>
          <div className="flex flex-wrap gap-1">
            {INPUT_PRESETS.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedInput(key)}
                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                  selectedInput === key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted/60 hover:text-muted border border-card-border"
                }`}>{label}</button>
            ))}
          </div>
          {selectedInput === "custom" && (
            <div className="flex flex-wrap gap-4 items-end">
              {customInputs.map((value, index) => (
                <div key={index} className="flex-1 min-w-[100px]">
                  <label className="text-[10px] text-muted flex justify-between">
                    <span>x{index + 1}</span>
                    <span className="font-mono text-accent">{value.toFixed(1)}</span>
                  </label>
                  <input type="range" min={-5} max={5} step={0.1} value={value}
                    onChange={(event) => {
                      const newInputs = [...customInputs];
                      newInputs[index] = Number(event.target.value);
                      setCustomInputs(newInputs);
                    }} className="w-full accent-[#6d5acf]" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Network controls */}
      {selectedMode === "simpleNN" && (
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Hidden Layers</span>
              <span className="font-mono text-accent">{hiddenLayers}</span>
            </label>
            <input type="range" min={1} max={4} step={1} value={hiddenLayers}
              onChange={(event) => setHiddenLayers(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Neurons / Layer</span>
              <span className="font-mono text-accent">{neuronsPerLayer}</span>
            </label>
            <input type="range" min={1} max={8} step={1} value={neuronsPerLayer}
              onChange={(event) => setNeuronsPerLayer(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
        </div>
      )}

      {/* Main visualization */}
      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        {selectedMode === "simpleNN" ? (
          <SimpleNNDiagram hiddenLayers={hiddenLayers} neuronsPerLayer={neuronsPerLayer}
            activation={activation} inputValues={inputValues} />
        ) : (
          <TransformerDiagram />
        )}
      </div>

      {/* Activation function graph */}
      {selectedMode === "simpleNN" && (
        <div className="bg-black/20 rounded-lg p-2">
          <div className="text-[9px] text-muted/50 mb-1">Activation Function: {ACTIVATION_FUNCTIONS[activation].name}</div>
          <svg viewBox="0 0 300 120" className="w-full max-w-[300px]">
            <line x1={150} y1={10} x2={150} y2={110} stroke="rgba(255,255,255,0.1)" />
            <line x1={20} y1={60} x2={280} y2={60} stroke="rgba(255,255,255,0.1)" />
            <path
              d={activationGraph.map((point, index) => {
                const svgX = 20 + ((point.x + 3) / 6) * 260;
                const svgY = 60 - point.y * 40;
                return `${index === 0 ? "M" : "L"} ${svgX} ${Math.max(10, Math.min(110, svgY))}`;
              }).join(" ")}
              fill="none" stroke="#6d5acf" strokeWidth={2} />
            <text x={20} y={120} className="fill-muted/30 text-[7px]">-3</text>
            <text x={275} y={120} className="fill-muted/30 text-[7px]">3</text>
            <text x={155} y={18} className="fill-muted/30 text-[7px]">f(x)</text>
          </svg>
        </div>
      )}

      {/* Color legend */}
      {selectedMode === "simpleNN" && (
        <div className="flex flex-wrap gap-4 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[rgba(109,90,207,0.7)]" /> Positive value
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[rgba(239,68,68,0.7)]" /> Negative value
          </span>
          <span className="text-muted/50">Node brightness = value magnitude</span>
        </div>
      )}

      <SimulatorDetails data={NN_MODE_INFO[selectedMode]} />
    </div>
  );
}
