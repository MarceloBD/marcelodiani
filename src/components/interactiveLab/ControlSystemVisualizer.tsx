"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type ControlMode, CONTROL_MODE_INFO } from "@/data/controlSystems";

const MODES: { key: ControlMode; label: string }[] = [
  { key: "openLoop", label: "Open Loop" },
  { key: "p", label: "P" },
  { key: "pi", label: "PI" },
  { key: "pd", label: "PD" },
  { key: "pid", label: "PID" },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 150;
const SIMULATION_STEPS = 500;
const TIME_SPAN = 10;

interface StepResponseResult {
  response: number[];
  overshoot: number;
  riseTime: number;
  settlingTime: number;
  steadyStateError: number;
}

function simulateStepResponse(
  mode: ControlMode,
  kp: number,
  ki: number,
  kd: number,
  setpoint: number
): StepResponseResult {
  const dt = TIME_SPAN / SIMULATION_STEPS;
  const response: number[] = [];

  let output = 0;
  let integral = 0;
  let previousError = setpoint;
  let maxValue = 0;
  let riseTime = TIME_SPAN;
  let settlingTime = TIME_SPAN;
  let hasReachedSetpoint = false;

  const plantTimeConstant = 1.0;

  for (let step = 0; step < SIMULATION_STEPS; step++) {
    const error = setpoint - output;
    let controlSignal = 0;

    switch (mode) {
      case "openLoop":
        controlSignal = setpoint;
        break;
      case "p":
        controlSignal = kp * error;
        break;
      case "pi":
        integral += error * dt;
        controlSignal = kp * error + ki * integral;
        break;
      case "pd":
        controlSignal = kp * error + kd * (error - previousError) / dt;
        break;
      case "pid":
        integral += error * dt;
        controlSignal = kp * error + ki * integral + kd * (error - previousError) / dt;
        break;
    }

    const plantOutput = controlSignal / (1 + plantTimeConstant);
    output += (plantOutput - output) * dt / plantTimeConstant;
    output = Math.max(-setpoint * 2, Math.min(setpoint * 3, output));

    response.push(output);
    previousError = error;
    if (output > maxValue) maxValue = output;

    if (!hasReachedSetpoint && output >= setpoint * 0.9) {
      riseTime = step * dt;
      hasReachedSetpoint = true;
    }
    if (Math.abs(output - setpoint) > setpoint * 0.02) {
      settlingTime = step * dt;
    }
  }

  const overshoot = setpoint > 0 ? Math.max(0, ((maxValue - setpoint) / setpoint) * 100) : 0;
  const steadyStateError = Math.abs(setpoint - response[response.length - 1]);

  return { response, overshoot, riseTime, settlingTime, steadyStateError };
}

function BlockDiagram({ mode }: { mode: ControlMode }) {
  const isOpenLoop = mode === "openLoop";
  const hasP = mode !== "openLoop";
  const hasI = mode === "pi" || mode === "pid";
  const hasD = mode === "pd" || mode === "pid";
  const controllerLabel = mode === "openLoop" ? "Direct" : mode.toUpperCase();

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full max-w-[600px] mx-auto">
      <text x={30} y={75} textAnchor="middle" className="fill-emerald-400 text-[10px] font-mono">r(t)</text>
      <circle cx={70} cy={72} r={12} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />
      <text x={70} y={76} textAnchor="middle" className="fill-white text-[10px]">{isOpenLoop ? "" : "Σ"}</text>

      <line x1={30} y1={72} x2={58} y2={72} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#controlArrow)" />
      <line x1={82} y1={72} x2={140} y2={72} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#controlArrow)" />
      {!isOpenLoop && <text x={110} y={65} textAnchor="middle" className="fill-red-400 text-[8px] font-mono">e(t)</text>}

      <rect x={140} y={50} width={100} height={44} rx={5} fill="rgba(109,90,207,0.3)" stroke="#6d5acf" strokeWidth={1.5} />
      <text x={190} y={68} textAnchor="middle" className="fill-accent text-[10px] font-semibold">{controllerLabel}</text>
      <text x={190} y={82} textAnchor="middle" className="fill-muted/50 text-[7px]">
        {hasP ? "Kp" : ""}{hasI ? " + Ki∫" : ""}{hasD ? " + Kd·d/dt" : ""}
      </text>

      <line x1={240} y1={72} x2={300} y2={72} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#controlArrow)" />
      <text x={270} y={65} textAnchor="middle" className="fill-muted/40 text-[8px] font-mono">u(t)</text>

      <rect x={300} y={50} width={100} height={44} rx={5} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1.5} />
      <text x={350} y={68} textAnchor="middle" className="fill-blue-400 text-[10px] font-semibold">Plant</text>
      <text x={350} y={82} textAnchor="middle" className="fill-muted/50 text-[7px]">G(s)</text>

      <line x1={400} y1={72} x2={480} y2={72} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} markerEnd="url(#controlArrow)" />
      <text x={490} y={76} className="fill-emerald-400 text-[10px] font-mono">y(t)</text>

      {!isOpenLoop && (
        <>
          <line x1={450} y1={72} x2={450} y2={120} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
          <line x1={450} y1={120} x2={70} y2={120} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
          <line x1={70} y1={120} x2={70} y2={84} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#controlArrow)" />
          <text x={260} y={115} textAnchor="middle" className="fill-muted/40 text-[8px]">Feedback</text>
          <text x={60} y={100} className="fill-red-400 text-[8px]">−</text>
        </>
      )}

      <defs>
        <marker id="controlArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.3)" />
        </marker>
      </defs>
    </svg>
  );
}

// ===================== DRONE SIMULATION =====================

function DroneSimulation({
  mode, kp, ki, kd, targetAltitude,
}: {
  mode: ControlMode;
  kp: number;
  ki: number;
  kd: number;
  targetAltitude: number;
}) {
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const animationReference = useRef(0);

  // Drone physics state
  const droneStateReference = useRef({
    altitude: 0,
    velocity: 0,
    integral: 0,
    previousError: 0,
    windForce: 0,
    windDecay: 0,
  });

  const paramsReference = useRef({ mode, kp, ki, kd, targetAltitude });
  useEffect(() => {
    paramsReference.current = { mode, kp, ki, kd, targetAltitude };
  }, [mode, kp, ki, kd, targetAltitude]);

  const addWind = useCallback(() => {
    droneStateReference.current.windForce = (Math.random() - 0.5) * 4;
    droneStateReference.current.windDecay = 60; // frames
  }, []);

  const resetDrone = useCallback(() => {
    droneStateReference.current = {
      altitude: 0,
      velocity: 0,
      integral: 0,
      previousError: 0,
      windForce: 0,
      windDecay: 0,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 200;
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
      const state = droneStateReference.current;
      const dt = 0.02;
      const gravity = 9.81;
      const mass = 1.0;
      const damping = 0.15; // light air resistance

      // PID control — gains are scaled by gravity*mass so Kp=1 means "full gravity correction per meter error"
      const error = params.targetAltitude - state.altitude;
      const gainScale = gravity * mass; // ~9.81 — makes Kp=1 meaningful
      let thrust = gravity * mass; // baseline hover thrust (counteracts gravity)

      switch (params.mode) {
        case "openLoop":
          // No feedback — just apply a constant thrust proportional to target
          thrust = params.targetAltitude * gravity * mass * 0.5;
          break;
        case "p":
          thrust += params.kp * gainScale * error;
          break;
        case "pi":
          state.integral += error * dt;
          state.integral = Math.max(-5, Math.min(5, state.integral));
          thrust += params.kp * gainScale * error + params.ki * gainScale * state.integral;
          break;
        case "pd": {
          const derivative = (error - state.previousError) / dt;
          thrust += params.kp * gainScale * error + params.kd * gainScale * derivative * 0.01;
          break;
        }
        case "pid": {
          state.integral += error * dt;
          state.integral = Math.max(-5, Math.min(5, state.integral));
          const derivative = (error - state.previousError) / dt;
          thrust += params.kp * gainScale * error + params.ki * gainScale * state.integral + params.kd * gainScale * derivative * 0.01;
          break;
        }
      }

      // Clamp thrust to physical limits (motors can't push downward)
      thrust = Math.max(0, Math.min(gravity * mass * 5, thrust));

      state.previousError = error;

      // Wind disturbance
      let windEffect = 0;
      if (state.windDecay > 0) {
        windEffect = state.windForce * (state.windDecay / 60) * gravity * mass;
        state.windDecay--;
      }

      // Physics: F = ma → a = (thrust - weight - drag + wind) / mass
      const netForce = thrust - gravity * mass - damping * state.velocity + windEffect;
      const acceleration = netForce / mass;
      state.velocity += acceleration * dt;
      state.altitude += state.velocity * dt;

      // Ground constraint
      if (state.altitude < 0) {
        state.altitude = 0;
        state.velocity = Math.max(0, state.velocity);
      }
      state.altitude = Math.min(5, state.altitude);

      // Drawing
      const groundY = height - 25;
      const maxVisualAltitude = 5;
      const altitudeScale = (groundY - 30) / maxVisualAltitude;
      const droneY = groundY - state.altitude * altitudeScale;
      const droneX = width / 2;

      // Ground
      context.fillStyle = "rgba(255,255,255,0.05)";
      context.fillRect(0, groundY, width, height - groundY);
      context.strokeStyle = "rgba(255,255,255,0.2)";
      context.beginPath();
      context.moveTo(0, groundY);
      context.lineTo(width, groundY);
      context.stroke();

      // Target altitude line
      const targetY = groundY - params.targetAltitude * altitudeScale;
      context.strokeStyle = "rgba(34,197,94,0.4)";
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(30, targetY);
      context.lineTo(width - 30, targetY);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = "rgba(34,197,94,0.5)";
      context.font = "9px monospace";
      context.textAlign = "right";
      context.fillText(`Target: ${params.targetAltitude.toFixed(1)}m`, width - 10, targetY - 5);

      // Altitude scale
      context.fillStyle = "rgba(255,255,255,0.3)";
      context.font = "8px monospace";
      context.textAlign = "right";
      for (let altitudeLevel = 0; altitudeLevel <= maxVisualAltitude; altitudeLevel++) {
        const y = groundY - altitudeLevel * altitudeScale;
        context.fillText(`${altitudeLevel}m`, 25, y + 3);
        context.strokeStyle = "rgba(255,255,255,0.05)";
        context.lineWidth = 0.5;
        context.beginPath();
        context.moveTo(30, y);
        context.lineTo(width - 30, y);
        context.stroke();
      }

      // Drone body
      const droneWidth = 40;
      const droneHeight = 8;

      // Drone tilt based on velocity (visual only)
      const tilt = Math.max(-0.3, Math.min(0.3, state.velocity * 0.05));

      context.save();
      context.translate(droneX, droneY);
      context.rotate(tilt);

      // Arms
      context.strokeStyle = "rgba(109,90,207,0.8)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(-droneWidth / 2, 0);
      context.lineTo(droneWidth / 2, 0);
      context.stroke();

      // Body
      context.fillStyle = "rgba(109,90,207,0.6)";
      context.fillRect(-8, -droneHeight / 2, 16, droneHeight);

      // Propellers
      const propellerWidth = 14;
      const propellerPositions = [-droneWidth / 2, droneWidth / 2];
      for (const px of propellerPositions) {
        // Propeller disc
        context.strokeStyle = "rgba(109,90,207,0.5)";
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(px - propellerWidth / 2, -5);
        context.lineTo(px + propellerWidth / 2, -5);
        context.stroke();

        // Thrust indicator
        if (thrust > gravity * mass * 0.5) {
          const thrustHeight = Math.min(20, Math.max(2, (thrust - gravity * mass) * 3));
          context.fillStyle = "rgba(251,191,36,0.2)";
          context.beginPath();
          context.moveTo(px - 4, 2);
          context.lineTo(px + 4, 2);
          context.lineTo(px + 1, 2 + thrustHeight);
          context.lineTo(px - 1, 2 + thrustHeight);
          context.closePath();
          context.fill();
        }
      }

      context.restore();

      // Wind indicator
      if (state.windDecay > 0) {
        const windX = state.windForce > 0 ? 50 : width - 50;
        const windDirection = state.windForce > 0 ? 1 : -1;
        context.strokeStyle = `rgba(59,130,246,${state.windDecay / 60 * 0.6})`;
        context.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const y = droneY - 10 + i * 8;
          context.beginPath();
          context.moveTo(windX, y);
          context.lineTo(windX + windDirection * 25, y);
          context.stroke();
          // Arrow head
          context.beginPath();
          context.moveTo(windX + windDirection * 25, y);
          context.lineTo(windX + windDirection * 20, y - 3);
          context.moveTo(windX + windDirection * 25, y);
          context.lineTo(windX + windDirection * 20, y + 3);
          context.stroke();
        }
        context.fillStyle = `rgba(59,130,246,${state.windDecay / 60 * 0.5})`;
        context.font = "8px monospace";
        context.textAlign = "center";
        context.fillText("Wind", windX + windDirection * 12, droneY - 20);
      }

      // Current altitude text
      context.fillStyle = "rgba(255,255,255,0.5)";
      context.font = "9px monospace";
      context.textAlign = "left";
      context.fillText(`Altitude: ${state.altitude.toFixed(2)}m`, 10, 15);
      context.fillText(`Velocity: ${state.velocity.toFixed(2)}m/s`, 10, 27);
      context.fillText(`Error: ${error.toFixed(3)}`, 10, 39);

      animationReference.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();
    return () => cancelAnimationFrame(animationReference.current);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted/60">Drone Altitude Simulation</span>
        <div className="flex gap-2">
          <button onClick={addWind}
            className="px-2 py-1 text-[9px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors cursor-pointer">
            Add Wind
          </button>
          <button onClick={resetDrone}
            className="px-2 py-1 text-[9px] font-mono text-muted border border-card-border rounded hover:text-foreground transition-colors cursor-pointer">
            Reset Drone
          </button>
        </div>
      </div>
      <div ref={containerReference} className="rounded-lg overflow-hidden">
        <canvas ref={canvasReference} />
      </div>
    </div>
  );
}

// ===================== MAIN COMPONENT =====================

export function ControlSystemVisualizer() {
  const [selectedMode, setSelectedMode] = useState<ControlMode>("pid");
  const [kp, setKp] = useState(3);
  const [ki, setKi] = useState(1);
  const [kd, setKd] = useState(0.5);
  const [setpoint, setSetpoint] = useState(1);

  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);

  const result = useMemo(() =>
    simulateStepResponse(selectedMode, kp, ki, kd, setpoint),
    [selectedMode, kp, ki, kd, setpoint]
  );

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 200;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(devicePixelRatio, devicePixelRatio);

    context.fillStyle = "rgba(0,0,0,0.2)";
    context.fillRect(0, 0, width, height);

    const padding = { left: 50, top: 20, right: 20, bottom: 30 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const maxResponse = Math.max(setpoint * 1.5, ...result.response);
    const minResponse = Math.min(0, ...result.response);
    const yRange = maxResponse - minResponse || 1;

    // Grid
    context.strokeStyle = "rgba(255,255,255,0.06)";
    context.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * plotHeight;
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
      const value = maxResponse - (i / 4) * yRange;
      context.fillStyle = "rgba(255,255,255,0.3)";
      context.font = "8px monospace";
      context.textAlign = "right";
      context.fillText(value.toFixed(2), padding.left - 5, y + 3);
    }

    context.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * plotWidth;
      const time = (i / 5) * TIME_SPAN;
      context.fillText(`${time.toFixed(0)}s`, x, height - 5);
    }

    // Setpoint line
    const setpointY = padding.top + ((maxResponse - setpoint) / yRange) * plotHeight;
    context.strokeStyle = "rgba(34,197,94,0.4)";
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(padding.left, setpointY);
    context.lineTo(width - padding.right, setpointY);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = "rgba(34,197,94,0.5)";
    context.font = "9px monospace";
    context.textAlign = "left";
    context.fillText("Setpoint", width - padding.right - 50, setpointY - 5);

    // 2% settling band
    const upperBand = padding.top + ((maxResponse - setpoint * 1.02) / yRange) * plotHeight;
    const lowerBand = padding.top + ((maxResponse - setpoint * 0.98) / yRange) * plotHeight;
    context.fillStyle = "rgba(34,197,94,0.05)";
    context.fillRect(padding.left, upperBand, plotWidth, lowerBand - upperBand);

    // Response curve
    context.beginPath();
    context.strokeStyle = "#6d5acf";
    context.lineWidth = 2;
    for (let i = 0; i < result.response.length; i++) {
      const x = padding.left + (i / SIMULATION_STEPS) * plotWidth;
      const y = padding.top + ((maxResponse - result.response[i]) / yRange) * plotHeight;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    // Overshoot annotation
    if (result.overshoot > 1) {
      const maxIdx = result.response.indexOf(Math.max(...result.response));
      const maxX = padding.left + (maxIdx / SIMULATION_STEPS) * plotWidth;
      const maxY = padding.top + ((maxResponse - result.response[maxIdx]) / yRange) * plotHeight;
      context.strokeStyle = "rgba(239,68,68,0.4)";
      context.lineWidth = 1;
      context.setLineDash([3, 3]);
      context.beginPath();
      context.moveTo(maxX, maxY);
      context.lineTo(maxX, setpointY);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = "rgba(239,68,68,0.6)";
      context.font = "8px monospace";
      context.textAlign = "center";
      context.fillText(`${result.overshoot.toFixed(1)}%`, maxX, maxY - 5);
    }
  }, [result, setpoint]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Controller</label>
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
      </div>

      <div className="flex flex-wrap gap-6 items-end">
        {selectedMode !== "openLoop" && (
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Kp</span><span className="font-mono text-accent">{kp.toFixed(1)}</span>
            </label>
            <input type="range" min={0.1} max={10} step={0.1} value={kp}
              onChange={(event) => setKp(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
        )}
        {(selectedMode === "pi" || selectedMode === "pid") && (
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Ki</span><span className="font-mono text-accent">{ki.toFixed(1)}</span>
            </label>
            <input type="range" min={0} max={5} step={0.1} value={ki}
              onChange={(event) => setKi(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
        )}
        {(selectedMode === "pd" || selectedMode === "pid") && (
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] text-muted flex justify-between">
              <span>Kd</span><span className="font-mono text-accent">{kd.toFixed(1)}</span>
            </label>
            <input type="range" min={0} max={5} step={0.1} value={kd}
              onChange={(event) => setKd(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
          </div>
        )}
        <div className="flex-1 min-w-[100px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Target Altitude</span><span className="font-mono text-accent">{setpoint.toFixed(1)}m</span>
          </label>
          <input type="range" min={0.5} max={4} step={0.1} value={setpoint}
            onChange={(event) => setSetpoint(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
        </div>
      </div>

      {/* Block diagram */}
      <div className="bg-black/20 rounded-lg p-2 overflow-x-auto">
        <BlockDiagram mode={selectedMode} />
      </div>

      {/* Drone simulation */}
      <DroneSimulation mode={selectedMode} kp={kp} ki={ki} kd={kd} targetAltitude={setpoint} />

      {/* Step response */}
      <div className="space-y-1">
        <span className="text-[10px] text-muted/60">Step Response</span>
        <div ref={containerReference} className="rounded-lg overflow-hidden">
          <canvas ref={canvasReference} />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Overshoot", value: `${result.overshoot.toFixed(1)}%` },
          { label: "Rise Time", value: `${result.riseTime.toFixed(2)}s` },
          { label: "Settling Time", value: `${result.settlingTime.toFixed(2)}s` },
          { label: "SS Error", value: result.steadyStateError.toFixed(4) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card-border/20 rounded-lg p-2.5 text-center">
            <div className="text-[9px] text-muted/70 mb-0.5">{label}</div>
            <div className="text-[10px] font-mono text-accent font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <SimulatorDetails data={CONTROL_MODE_INFO[selectedMode]} />
    </div>
  );
}
