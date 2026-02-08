"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SignalDetails } from "./SignalDetails";
import { type SignalType } from "@/data/signalTypes";

const CANVAS_HEIGHT = 200;
const GRID_COLOR = "rgba(148, 163, 184, 0.08)";
const AXIS_COLOR = "rgba(148, 163, 184, 0.2)";
const WAVE_PRIMARY_COLOR = "#3b82f6";
const WAVE_SECONDARY_COLOR = "#f59e0b";
const WAVE_COMBINED_COLOR = "#22c55e";
const TIME_WINDOW_SECONDS = 2;

// --- Wave Generators ---

type WaveGenerator = (time: number, frequency: number, amplitude: number, phase: number) => number;

function sineWave(time: number, frequency: number, amplitude: number, phase: number): number {
  return amplitude * Math.sin(2 * Math.PI * frequency * time + phase);
}

function squareWave(time: number, frequency: number, amplitude: number, phase: number): number {
  return amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * time + phase));
}

function triangleWave(time: number, frequency: number, amplitude: number, phase: number): number {
  const period = 1 / frequency;
  const shifted = ((time + phase / (2 * Math.PI * frequency)) % period + period) % period;
  return amplitude * (4 * Math.abs(shifted / period - 0.5) - 1);
}

function sawtoothWave(time: number, frequency: number, amplitude: number, phase: number): number {
  const period = 1 / frequency;
  const shifted = ((time + phase / (2 * Math.PI * frequency)) % period + period) % period;
  return amplitude * (2 * shifted / period - 1);
}

const WAVE_GENERATORS: Record<SignalType, WaveGenerator> = {
  sine: sineWave,
  square: squareWave,
  triangle: triangleWave,
  sawtooth: sawtoothWave,
};

// --- Canvas Rendering ---

function drawGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  const centerY = height / 2;

  // Horizontal grid lines
  context.strokeStyle = GRID_COLOR;
  context.lineWidth = 1;
  const horizontalDivisions = 8;
  for (let i = 1; i < horizontalDivisions; i++) {
    const y = (height / horizontalDivisions) * i;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  // Vertical grid lines
  const verticalDivisions = 10;
  for (let i = 1; i < verticalDivisions; i++) {
    const x = (width / verticalDivisions) * i;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  // Center axis (zero line) - slightly brighter
  context.strokeStyle = AXIS_COLOR;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, centerY);
  context.lineTo(width, centerY);
  context.stroke();

  // Amplitude markers
  context.fillStyle = "rgba(148, 163, 184, 0.3)";
  context.font = "9px monospace";
  context.textAlign = "left";
  context.fillText("+A", 4, height / 4 + 3);
  context.fillText("0", 4, centerY - 3);
  context.fillText("-A", 4, (3 * height) / 4 + 3);
}

function drawWaveform(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeOffset: number,
  generator: WaveGenerator,
  frequency: number,
  amplitude: number,
  phase: number,
  color: string,
  lineWidth: number = 2,
) {
  const centerY = height / 2;
  const scaleY = height * 0.38;

  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();

  for (let pixelX = 0; pixelX < width; pixelX++) {
    const time = timeOffset + (pixelX / width) * TIME_WINDOW_SECONDS;
    const value = generator(time, frequency, amplitude, phase);
    const y = centerY - value * scaleY;

    if (pixelX === 0) {
      context.moveTo(pixelX, y);
    } else {
      context.lineTo(pixelX, y);
    }
  }

  context.stroke();
}

// --- Signal Properties ---

interface SignalProperties {
  period: string;
  rms: string;
  peakToPeak: string;
}

function calculateSignalProperties(
  frequency: number,
  amplitude: number,
  signalType: SignalType,
): SignalProperties {
  const period = 1 / frequency;
  const peakToPeak = 2 * amplitude;

  const rmsFactors: Record<SignalType, number> = {
    sine: 1 / Math.SQRT2,
    square: 1,
    triangle: 1 / Math.sqrt(3),
    sawtooth: 1 / Math.sqrt(3),
  };

  const rms = amplitude * rmsFactors[signalType];

  const formatTime = (seconds: number): string => {
    if (seconds >= 1) return `${seconds.toFixed(2)} s`;
    return `${(seconds * 1000).toFixed(1)} ms`;
  };

  return {
    period: formatTime(period),
    rms: rms.toFixed(3),
    peakToPeak: peakToPeak.toFixed(2),
  };
}

// --- Main Component ---

export function SignalVisualizer() {
  const translations = useTranslations("signalVisualizer");
  const [signalType, setSignalType] = useState<SignalType>("sine");
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(0.8);
  const [phase, setPhase] = useState(0);
  const [showSecondSignal, setShowSecondSignal] = useState(false);
  const [secondSignalType, setSecondSignalType] = useState<SignalType>("square");
  const [secondFrequency, setSecondFrequency] = useState(3);
  const [secondAmplitude, setSecondAmplitude] = useState(0.5);

  const canvasReference = useRef<HTMLCanvasElement>(null);
  const containerReference = useRef<HTMLDivElement>(null);
  const animationReference = useRef<number>(0);
  const timeReference = useRef(0);

  // Store params in refs for the animation loop
  const paramsReference = useRef({
    signalType, frequency, amplitude, phase,
    showSecondSignal, secondSignalType, secondFrequency, secondAmplitude,
  });

  useEffect(() => {
    paramsReference.current = {
      signalType, frequency, amplitude, phase,
      showSecondSignal, secondSignalType, secondFrequency, secondAmplitude,
    };
  }, [signalType, frequency, amplitude, phase, showSecondSignal, secondSignalType, secondFrequency, secondAmplitude]);

  useEffect(() => {
    const canvas = canvasReference.current;
    const container = containerReference.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const setupCanvas = () => {
      const width = container.clientWidth;
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * devicePixelRatio;
      canvas.height = CANVAS_HEIGHT * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    setupCanvas();

    const render = () => {
      const width = container.clientWidth;
      timeReference.current += 0.016;

      context.clearRect(0, 0, width, CANVAS_HEIGHT);

      // Background
      context.fillStyle = "rgba(15, 23, 42, 0.3)";
      context.fillRect(0, 0, width, CANVAS_HEIGHT);

      drawGrid(context, width, CANVAS_HEIGHT);

      const {
        signalType: currentSignalType,
        frequency: currentFrequency,
        amplitude: currentAmplitude,
        phase: currentPhase,
        showSecondSignal: currentShowSecond,
        secondSignalType: currentSecondType,
        secondFrequency: currentSecondFrequency,
        secondAmplitude: currentSecondAmplitude,
      } = paramsReference.current;

      const primaryGenerator = WAVE_GENERATORS[currentSignalType];

      // Draw primary waveform
      drawWaveform(
        context, width, CANVAS_HEIGHT, timeReference.current,
        primaryGenerator, currentFrequency, currentAmplitude, currentPhase,
        WAVE_PRIMARY_COLOR, 2,
      );

      // Draw second waveform if enabled
      if (currentShowSecond) {
        const secondGenerator = WAVE_GENERATORS[currentSecondType];

        drawWaveform(
          context, width, CANVAS_HEIGHT, timeReference.current,
          secondGenerator, currentSecondFrequency, currentSecondAmplitude, 0,
          WAVE_SECONDARY_COLOR, 1.5,
        );

        // Draw combined waveform
        const combinedGenerator: WaveGenerator = (time, _freq, _amp, _phase) => {
          const primary = primaryGenerator(time, currentFrequency, currentAmplitude, currentPhase);
          const secondary = secondGenerator(time, currentSecondFrequency, currentSecondAmplitude, 0);
          return primary + secondary;
        };

        drawWaveform(
          context, width, CANVAS_HEIGHT, timeReference.current,
          combinedGenerator, 1, 1, 0,
          WAVE_COMBINED_COLOR, 1,
        );
      }

      animationReference.current = requestAnimationFrame(render);
    };

    animationReference.current = requestAnimationFrame(render);

    const resizeObserver = new ResizeObserver(setupCanvas);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationReference.current);
      resizeObserver.disconnect();
    };
  }, []);

  const signalProperties = useMemo(
    () => calculateSignalProperties(frequency, amplitude, signalType),
    [frequency, amplitude, signalType],
  );

  const handleReset = useCallback(() => {
    setSignalType("sine");
    setFrequency(2);
    setAmplitude(0.8);
    setPhase(0);
    setShowSecondSignal(false);
    setSecondSignalType("square");
    setSecondFrequency(3);
    setSecondAmplitude(0.5);
  }, []);

  const phaseInDegrees = Math.round((phase * 180) / Math.PI);

  return (
    <ScrollReveal className="mt-8">
      <div className="glass-card rounded-xl p-6 border border-card-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">{translations("title")}</span>
            <span className="text-[9px] text-muted/70 font-mono">{translations("techStack")}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={signalType}
              onChange={(event) => setSignalType(event.target.value as SignalType)}
              aria-label={translations("ariaSelectWaveType")}
              className="text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer"
            >
              <option value="sine">{translations("waveTypeSine")}</option>
              <option value="square">{translations("waveTypeSquare")}</option>
              <option value="triangle">{translations("waveTypeTriangle")}</option>
              <option value="sawtooth">{translations("waveTypeSawtooth")}</option>
            </select>
            <button
              onClick={() => setShowSecondSignal((previous) => !previous)}
              className={`text-[10px] px-3 py-1 rounded border transition-colors cursor-pointer ${
                showSecondSignal
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                  : "border-card-border text-muted hover:text-foreground hover:border-accent/40"
              }`}
            >
              {showSecondSignal ? translations("buttonTwoSignals") : translations("buttonAddSignal")}
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer"
            >
              {translations("buttonReset")}
            </button>
          </div>
        </div>

        {/* Primary signal controls */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <span className="text-[9px] text-muted/70 w-14 shrink-0">{translations("controlFreq")}</span>
            <input
              type="range" min={0.5} max={10} step={0.1} value={frequency}
              onChange={(event) => setFrequency(Number(event.target.value))}
              className="flex-1 h-1 accent-blue-500 cursor-pointer"
              aria-label={translations("ariaFrequency")}
            />
            <span className="text-[10px] font-mono text-foreground/80 w-14 text-right">{frequency} Hz</span>
          </div>
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <span className="text-[9px] text-muted/70 w-14 shrink-0">{translations("controlAmp")}</span>
            <input
              type="range" min={0.1} max={1} step={0.05} value={amplitude}
              onChange={(event) => setAmplitude(Number(event.target.value))}
              className="flex-1 h-1 accent-blue-500 cursor-pointer"
              aria-label={translations("ariaAmplitude")}
            />
            <span className="text-[10px] font-mono text-foreground/80 w-14 text-right">{amplitude.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <span className="text-[9px] text-muted/70 w-14 shrink-0">{translations("controlPhase")}</span>
            <input
              type="range" min={0} max={6.28} step={0.1} value={phase}
              onChange={(event) => setPhase(Number(event.target.value))}
              className="flex-1 h-1 accent-blue-500 cursor-pointer"
              aria-label={translations("ariaPhase")}
            />
            <span className="text-[10px] font-mono text-foreground/80 w-14 text-right">{phaseInDegrees}&deg;</span>
          </div>
        </div>

        {/* Second signal controls */}
        {showSecondSignal && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2 pt-2 border-t border-card-border/30">
            <div className="flex items-center gap-2 min-w-[200px] flex-1">
              <span className="text-[9px] text-amber-400/70 w-14 shrink-0">{translations("controlType2")}</span>
              <select
                value={secondSignalType}
                onChange={(event) => setSecondSignalType(event.target.value as SignalType)}
                aria-label={translations("ariaSecondWaveType")}
                className="flex-1 text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer"
              >
                <option value="sine">{translations("waveTypeSine")}</option>
                <option value="square">{translations("waveTypeSquare")}</option>
                <option value="triangle">{translations("waveTypeTriangle")}</option>
                <option value="sawtooth">{translations("waveTypeSawtooth")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 min-w-[200px] flex-1">
              <span className="text-[9px] text-amber-400/70 w-14 shrink-0">{translations("controlFreq2")}</span>
              <input
                type="range" min={0.5} max={10} step={0.1} value={secondFrequency}
                onChange={(event) => setSecondFrequency(Number(event.target.value))}
                className="flex-1 h-1 accent-amber-500 cursor-pointer"
                aria-label={translations("ariaSecondFrequency")}
              />
              <span className="text-[10px] font-mono text-foreground/80 w-14 text-right">{secondFrequency} Hz</span>
            </div>
            <div className="flex items-center gap-2 min-w-[200px] flex-1">
              <span className="text-[9px] text-amber-400/70 w-14 shrink-0">{translations("controlAmp2")}</span>
              <input
                type="range" min={0.1} max={1} step={0.05} value={secondAmplitude}
                onChange={(event) => setSecondAmplitude(Number(event.target.value))}
                className="flex-1 h-1 accent-amber-500 cursor-pointer"
                aria-label={translations("ariaSecondAmplitude")}
              />
              <span className="text-[10px] font-mono text-foreground/80 w-14 text-right">{secondAmplitude.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Canvas oscilloscope */}
        <div ref={containerReference} className="w-full rounded-lg overflow-hidden border border-card-border/30 mb-3">
          <canvas ref={canvasReference} className="block w-full" style={{ height: CANVAS_HEIGHT }} />
        </div>

        {/* Signal properties */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-card-border/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted/70">{translations("metricPeriod")}</span>
            <span className="text-[10px] font-mono text-accent font-semibold">{signalProperties.period}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted/70">{translations("metricPeakToPeak")}</span>
            <span className="text-[10px] font-mono text-foreground/80 font-semibold">{signalProperties.peakToPeak}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted/70">{translations("metricRMS")}</span>
            <span className="text-[10px] font-mono text-foreground/80 font-semibold">{signalProperties.rms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted/70">{translations("metricFrequency")}</span>
            <span className="text-[10px] font-mono text-foreground/80 font-semibold">{frequency} Hz</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: WAVE_PRIMARY_COLOR }} />
            <span className="text-[9px] text-muted">{translations("legendPrimary")}</span>
          </div>
          {showSecondSignal && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: WAVE_SECONDARY_COLOR }} />
                <span className="text-[9px] text-muted">{translations("legendSecondary")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: WAVE_COMBINED_COLOR }} />
                <span className="text-[9px] text-muted">{translations("legendCombined")}</span>
              </div>
            </>
          )}
        </div>

        <SignalDetails selectedSignal={signalType} />
      </div>
    </ScrollReveal>
  );
}
