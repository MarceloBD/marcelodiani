"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type PhysicsMode, PHYSICS_INFO } from "@/data/physicsModes";

const MODES: { key: PhysicsMode; label: string }[] = [
  { key: "projectile", label: "Projectile" },
  { key: "pendulum", label: "Pendulum" },
  { key: "spring", label: "Spring" },
];

const GRAVITY = 9.81;

export function PhysicsSimulator() {
  const [selectedMode, setSelectedMode] = useState<PhysicsMode>("projectile");

  // Projectile params
  const [launchAngle, setLaunchAngle] = useState(45);
  const [initialVelocity, setInitialVelocity] = useState(20);

  // Pendulum params
  const [pendulumLength, setPendulumLength] = useState(2);
  const [pendulumAngle, setPendulumAngle] = useState(30);

  // Spring params
  const [springConstant, setSpringConstant] = useState(10);
  const [springMass, setSpringMass] = useState(1);
  const [springDisplacement, setSpringDisplacement] = useState(0.5);

  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const animationReference = useRef<number>(0);
  const timeReference = useRef(0);
  const trailReference = useRef<{ x: number; y: number }[]>([]);
  const isPlayingReference = useRef(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const paramsReference = useRef({
    mode: selectedMode,
    launchAngle,
    initialVelocity,
    pendulumLength,
    pendulumAngle,
    springConstant,
    springMass,
    springDisplacement,
  });

  useEffect(() => {
    paramsReference.current = {
      mode: selectedMode,
      launchAngle,
      initialVelocity,
      pendulumLength,
      pendulumAngle,
      springConstant,
      springMass,
      springDisplacement,
    };
  }, [selectedMode, launchAngle, initialVelocity, pendulumLength, pendulumAngle, springConstant, springMass, springDisplacement]);

  const resetSimulation = useCallback(() => {
    timeReference.current = 0;
    trailReference.current = [];
  }, []);

  useEffect(() => {
    resetSimulation();
  }, [selectedMode, resetSimulation]);

  useEffect(() => {
    isPlayingReference.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = 300;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    const drawFrame = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = "rgba(0,0,0,0.2)";
      context.fillRect(0, 0, width, height);

      const params = paramsReference.current;
      const time = timeReference.current;

      if (params.mode === "projectile") {
        drawProjectile(context, width, height, params, time);
      } else if (params.mode === "pendulum") {
        drawPendulum(context, width, height, params, time);
      } else {
        drawSpring(context, width, height, params, time);
      }

      if (isPlayingReference.current) {
        timeReference.current += 0.016;
      }

      animationReference.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => cancelAnimationFrame(animationReference.current);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Simulation</label>
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
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 text-[10px] font-mono bg-accent/20 text-accent border border-accent/30 rounded hover:bg-accent/30 transition-colors cursor-pointer"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetSimulation}
            className="px-3 py-1.5 text-[10px] font-mono text-muted border border-card-border rounded hover:text-foreground transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mode-specific controls */}
      <div className="flex flex-wrap gap-6 items-end">
        {selectedMode === "projectile" && (
          <>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Angle (θ)</span>
                <span className="font-mono text-accent">{launchAngle}°</span>
              </label>
              <input type="range" min={5} max={85} step={1} value={launchAngle} onChange={(event) => { setLaunchAngle(Number(event.target.value)); resetSimulation(); }} className="w-full accent-[#6d5acf]" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Velocity (v₀)</span>
                <span className="font-mono text-accent">{initialVelocity} m/s</span>
              </label>
              <input type="range" min={5} max={50} step={1} value={initialVelocity} onChange={(event) => { setInitialVelocity(Number(event.target.value)); resetSimulation(); }} className="w-full accent-[#6d5acf]" />
            </div>
          </>
        )}
        {selectedMode === "pendulum" && (
          <>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Length</span>
                <span className="font-mono text-accent">{pendulumLength.toFixed(1)} m</span>
              </label>
              <input type="range" min={0.5} max={5} step={0.1} value={pendulumLength} onChange={(event) => { setPendulumLength(Number(event.target.value)); resetSimulation(); }} className="w-full accent-[#6d5acf]" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Initial Angle</span>
                <span className="font-mono text-accent">{pendulumAngle}°</span>
              </label>
              <input type="range" min={5} max={80} step={1} value={pendulumAngle} onChange={(event) => { setPendulumAngle(Number(event.target.value)); resetSimulation(); }} className="w-full accent-[#6d5acf]" />
            </div>
          </>
        )}
        {selectedMode === "spring" && (
          <>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Spring k</span>
                <span className="font-mono text-accent">{springConstant} N/m</span>
              </label>
              <input type="range" min={1} max={50} step={1} value={springConstant} onChange={(event) => setSpringConstant(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Mass</span>
                <span className="font-mono text-accent">{springMass.toFixed(1)} kg</span>
              </label>
              <input type="range" min={0.1} max={5} step={0.1} value={springMass} onChange={(event) => setSpringMass(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted flex justify-between">
                <span>Displacement</span>
                <span className="font-mono text-accent">{springDisplacement.toFixed(1)} m</span>
              </label>
              <input type="range" min={0.1} max={2} step={0.1} value={springDisplacement} onChange={(event) => setSpringDisplacement(Number(event.target.value))} className="w-full accent-[#6d5acf]" />
            </div>
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerReference} className="rounded-lg overflow-hidden">
        <canvas ref={canvasReference} />
      </div>

      <SimulatorDetails data={PHYSICS_INFO[selectedMode]} />
    </div>
  );
}

// --- Drawing Functions ---

interface ProjectileParams {
  launchAngle: number;
  initialVelocity: number;
}

function drawProjectile(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ProjectileParams,
  time: number
) {
  const { launchAngle, initialVelocity } = params;
  const angleRad = (launchAngle * Math.PI) / 180;
  const vx = initialVelocity * Math.cos(angleRad);
  const vy = initialVelocity * Math.sin(angleRad);

  // Calculate trajectory metrics
  const totalTime = (2 * vy) / GRAVITY;
  const maxHeight = (vy * vy) / (2 * GRAVITY);
  const range = vx * totalTime;

  const padding = 40;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  // Fixed world-space axes so trajectory visually changes with parameters
  const worldMaxX = 120; // meters
  const worldMaxY = 70;  // meters
  const scaleX = plotWidth / worldMaxX;
  const scaleY = plotHeight / worldMaxY;

  // Ground line
  context.strokeStyle = "rgba(255,255,255,0.2)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(padding, height - padding);
  context.lineTo(width - padding, height - padding);
  context.stroke();

  // Draw trajectory trail
  context.beginPath();
  context.strokeStyle = "rgba(109,90,207,0.4)";
  context.lineWidth = 1.5;
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const trailTime = (i / steps) * totalTime;
    const x = vx * trailTime;
    const y = vy * trailTime - 0.5 * GRAVITY * trailTime * trailTime;
    if (y < 0) break;
    const canvasX = padding + x * scaleX;
    const canvasY = height - padding - y * scaleY;
    if (i === 0) context.moveTo(canvasX, canvasY);
    else context.lineTo(canvasX, canvasY);
  }
  context.stroke();

  // Current position
  const currentTime = (time * 2) % (totalTime + 1);
  const posX = vx * Math.min(currentTime, totalTime);
  const posY = Math.max(0, vy * Math.min(currentTime, totalTime) - 0.5 * GRAVITY * Math.min(currentTime, totalTime) ** 2);
  const canvasX = padding + posX * scaleX;
  const canvasY = height - padding - posY * scaleY;

  // Projectile dot
  context.beginPath();
  context.fillStyle = "#6d5acf";
  context.arc(canvasX, canvasY, 6, 0, Math.PI * 2);
  context.fill();

  // Velocity vector
  const currentVx = vx;
  const currentVy = vy - GRAVITY * Math.min(currentTime, totalTime);
  const velocityScale = 2;
  context.beginPath();
  context.strokeStyle = "#22c55e";
  context.lineWidth = 1.5;
  context.moveTo(canvasX, canvasY);
  context.lineTo(canvasX + currentVx * velocityScale, canvasY - currentVy * velocityScale);
  context.stroke();

  // Energy bars
  const totalEnergy = 0.5 * initialVelocity ** 2;
  const kineticEnergy = 0.5 * (currentVx ** 2 + currentVy ** 2);
  const potentialEnergy = GRAVITY * posY;
  const barWidth = 20;
  const barMaxHeight = 60;

  const drawEnergyBar = (x: number, label: string, value: number, color: string) => {
    const barHeight = (value / totalEnergy) * barMaxHeight;
    context.fillStyle = color;
    context.fillRect(x, 20 + barMaxHeight - barHeight, barWidth, barHeight);
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.strokeRect(x, 20, barWidth, barMaxHeight);
    context.fillStyle = "rgba(255,255,255,0.5)";
    context.font = "8px sans-serif";
    context.textAlign = "center";
    context.fillText(label, x + barWidth / 2, 20 + barMaxHeight + 12);
  };

  drawEnergyBar(width - 80, "KE", kineticEnergy, "rgba(109,90,207,0.6)");
  drawEnergyBar(width - 50, "PE", potentialEnergy, "rgba(239,68,68,0.6)");

  // Info text
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.font = "9px monospace";
  context.textAlign = "left";
  context.fillText(`Range: ${range.toFixed(1)}m`, 10, 15);
  context.fillText(`Max H: ${maxHeight.toFixed(1)}m`, 10, 27);
  context.fillText(`T: ${totalTime.toFixed(2)}s`, 10, 39);
}

interface PendulumParams {
  pendulumLength: number;
  pendulumAngle: number;
}

function drawPendulum(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: PendulumParams,
  time: number
) {
  const { pendulumLength, pendulumAngle } = params;
  const angleRad = (pendulumAngle * Math.PI) / 180;
  const omega = Math.sqrt(GRAVITY / pendulumLength);
  const currentAngle = angleRad * Math.cos(omega * time * 3);

  const pivotX = width / 2;
  const pivotY = 40;
  // Fixed pixels-per-meter so different lengths are visually distinct
  const pixelsPerMeter = 45;
  const bobX = pivotX + Math.sin(currentAngle) * pendulumLength * pixelsPerMeter;
  const bobY = pivotY + Math.cos(currentAngle) * pendulumLength * pixelsPerMeter;

  // Pivot
  context.beginPath();
  context.fillStyle = "rgba(255,255,255,0.3)";
  context.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
  context.fill();

  // String
  context.beginPath();
  context.strokeStyle = "rgba(255,255,255,0.4)";
  context.lineWidth = 1.5;
  context.moveTo(pivotX, pivotY);
  context.lineTo(bobX, bobY);
  context.stroke();

  // Bob
  context.beginPath();
  context.fillStyle = "#6d5acf";
  context.arc(bobX, bobY, 12, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(109,90,207,0.6)";
  context.lineWidth = 2;
  context.stroke();

  // Arc showing angle
  if (Math.abs(currentAngle) > 0.01) {
    context.beginPath();
    context.strokeStyle = "rgba(109,90,207,0.3)";
    context.lineWidth = 1;
    const arcRadius = 30;
    const startAngle = Math.PI / 2 - Math.abs(currentAngle);
    const endAngle = Math.PI / 2 + Math.abs(currentAngle);
    context.arc(pivotX, pivotY, arcRadius, startAngle, endAngle);
    context.stroke();
  }

  // Energy bars
  const maxEnergy = pendulumLength * GRAVITY * (1 - Math.cos(angleRad));
  const potentialEnergy = pendulumLength * GRAVITY * (1 - Math.cos(currentAngle));
  const kineticEnergy = maxEnergy - potentialEnergy;
  const barWidth = 20;
  const barMaxHeight = 60;

  const drawBar = (x: number, label: string, value: number, color: string) => {
    const barHeight = maxEnergy > 0 ? (value / maxEnergy) * barMaxHeight : 0;
    context.fillStyle = color;
    context.fillRect(x, 20 + barMaxHeight - barHeight, barWidth, barHeight);
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.strokeRect(x, 20, barWidth, barMaxHeight);
    context.fillStyle = "rgba(255,255,255,0.5)";
    context.font = "8px sans-serif";
    context.textAlign = "center";
    context.fillText(label, x + barWidth / 2, 20 + barMaxHeight + 12);
  };

  drawBar(width - 80, "KE", kineticEnergy, "rgba(109,90,207,0.6)");
  drawBar(width - 50, "PE", potentialEnergy, "rgba(239,68,68,0.6)");

  // Period info
  const period = 2 * Math.PI * Math.sqrt(pendulumLength / GRAVITY);
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.font = "9px monospace";
  context.textAlign = "left";
  context.fillText(`T = ${period.toFixed(3)}s`, 10, 15);
  context.fillText(`f = ${(1 / period).toFixed(3)}Hz`, 10, 27);
  context.fillText(`θ = ${((currentAngle * 180) / Math.PI).toFixed(1)}°`, 10, 39);
}

interface SpringParams {
  springConstant: number;
  springMass: number;
  springDisplacement: number;
}

function drawSpring(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: SpringParams,
  time: number
) {
  const { springConstant, springMass, springDisplacement } = params;
  const omega = Math.sqrt(springConstant / springMass);
  const displacement = springDisplacement * Math.cos(omega * time * 3);

  const wallX = 60;
  const centerY = height / 2;
  const restLength = 200;
  const scale = 100;
  const massX = wallX + restLength + displacement * scale;

  // Wall
  context.fillStyle = "rgba(255,255,255,0.2)";
  context.fillRect(wallX - 5, centerY - 50, 5, 100);
  for (let i = 0; i < 5; i++) {
    context.beginPath();
    context.strokeStyle = "rgba(255,255,255,0.15)";
    context.moveTo(wallX - 5, centerY - 50 + i * 25);
    context.lineTo(wallX - 15, centerY - 38 + i * 25);
    context.stroke();
  }

  // Spring coils
  context.beginPath();
  context.strokeStyle = "rgba(109,90,207,0.7)";
  context.lineWidth = 2;
  const coils = 12;
  const springLength = massX - wallX - 20;
  const coilWidth = 10;

  context.moveTo(wallX, centerY);
  for (let i = 0; i <= coils; i++) {
    const x = wallX + (i / coils) * springLength;
    const y = centerY + (i % 2 === 0 ? coilWidth : -coilWidth);
    context.lineTo(x, y);
  }
  context.lineTo(massX - 15, centerY);
  context.stroke();

  // Mass block
  context.fillStyle = "#6d5acf";
  context.fillRect(massX - 15, centerY - 20, 30, 40);
  context.strokeStyle = "rgba(109,90,207,0.8)";
  context.lineWidth = 2;
  context.strokeRect(massX - 15, centerY - 20, 30, 40);

  // Displacement arrow
  if (Math.abs(displacement) > 0.01) {
    const arrowY = centerY + 50;
    const equilibriumX = wallX + restLength;
    context.beginPath();
    context.strokeStyle = "#ef4444";
    context.lineWidth = 1.5;
    context.setLineDash([3, 3]);
    context.moveTo(equilibriumX, centerY - 30);
    context.lineTo(equilibriumX, centerY + 60);
    context.stroke();
    context.setLineDash([]);

    context.beginPath();
    context.strokeStyle = "#22c55e";
    context.lineWidth = 2;
    context.moveTo(equilibriumX, arrowY);
    context.lineTo(massX, arrowY);
    context.stroke();

    // Arrow head
    const direction = displacement > 0 ? 1 : -1;
    context.beginPath();
    context.fillStyle = "#22c55e";
    context.moveTo(massX, arrowY);
    context.lineTo(massX - 6 * direction, arrowY - 4);
    context.lineTo(massX - 6 * direction, arrowY + 4);
    context.fill();
  }

  // Energy bars
  const totalEnergy = 0.5 * springConstant * springDisplacement ** 2;
  const potentialEnergy = 0.5 * springConstant * displacement ** 2;
  const kineticEnergy = totalEnergy - potentialEnergy;
  const barWidth = 20;
  const barMaxHeight = 60;

  const drawBar = (x: number, label: string, value: number, color: string) => {
    const barHeight = totalEnergy > 0 ? (value / totalEnergy) * barMaxHeight : 0;
    context.fillStyle = color;
    context.fillRect(x, 20 + barMaxHeight - barHeight, barWidth, barHeight);
    context.strokeStyle = "rgba(255,255,255,0.2)";
    context.strokeRect(x, 20, barWidth, barMaxHeight);
    context.fillStyle = "rgba(255,255,255,0.5)";
    context.font = "8px sans-serif";
    context.textAlign = "center";
    context.fillText(label, x + barWidth / 2, 20 + barMaxHeight + 12);
  };

  drawBar(width - 80, "KE", kineticEnergy, "rgba(109,90,207,0.6)");
  drawBar(width - 50, "PE", potentialEnergy, "rgba(239,68,68,0.6)");

  // Info
  const period = 2 * Math.PI * Math.sqrt(springMass / springConstant);
  const force = -springConstant * displacement;
  context.fillStyle = "rgba(255,255,255,0.5)";
  context.font = "9px monospace";
  context.textAlign = "left";
  context.fillText(`T = ${period.toFixed(3)}s`, 10, 15);
  context.fillText(`F = ${force.toFixed(2)}N`, 10, 27);
  context.fillText(`x = ${displacement.toFixed(3)}m`, 10, 39);
}
