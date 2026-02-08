"use client";

import { useState, useEffect, useCallback } from "react";
import { SimulatorDetails } from "./SimulatorDetails";
import { type ConcurrencyMode, CONCURRENCY_MODE_INFO } from "@/data/concurrencyModes";

const MODES: { key: ConcurrencyMode; label: string }[] = [
  { key: "parallel", label: "Parallel" },
  { key: "raceCondition", label: "Race Condition" },
  { key: "deadlock", label: "Deadlock" },
  { key: "producerConsumer", label: "Producer-Consumer" },
  { key: "forkJoin", label: "Fork-Join" },
  { key: "mapReduce", label: "Map-Reduce" },
];

export function ConcurrencyVisualizer() {
  const [selectedMode, setSelectedMode] = useState<ConcurrencyMode>("parallel");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] text-muted mb-1">Scenario</label>
          <div className="flex gap-1 flex-wrap">
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

      {selectedMode === "parallel" && <ParallelView />}
      {selectedMode === "raceCondition" && <RaceConditionView />}
      {selectedMode === "deadlock" && <DeadlockView />}
      {selectedMode === "producerConsumer" && <ProducerConsumerView />}
      {selectedMode === "forkJoin" && <ForkJoinView />}
      {selectedMode === "mapReduce" && <MapReduceView />}

      <SimulatorDetails data={CONCURRENCY_MODE_INFO[selectedMode]} />
    </div>
  );
}

// ===================== PARALLEL =====================

function ParallelView() {
  const [threadCount, setThreadCount] = useState(4);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const totalTasks = 12;
  const tasksPerThread = Math.ceil(totalTasks / threadCount);
  // Each step completes one task per thread simultaneously
  const totalSteps = tasksPerThread + 1;

  useAutoAdvance(isPlaying, step, totalSteps, setStep, 500);

  const threadTasks = Array.from({ length: threadCount }, (_, threadIndex) => {
    const startIndex = threadIndex * tasksPerThread;
    return Array.from(
      { length: Math.min(tasksPerThread, totalTasks - startIndex) },
      (_, i) => `Task ${startIndex + i + 1}`
    );
  });

  // Count how many tasks each thread has completed (all threads advance together)
  const completedPerThread = Math.min(step, tasksPerThread);
  const totalCompleted = Math.min(completedPerThread * threadCount, totalTasks);

  return (
    <>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[120px] max-w-[200px]">
          <label className="text-[10px] text-muted flex justify-between">
            <span>Threads</span><span className="font-mono text-accent">{threadCount}</span>
          </label>
          <input type="range" min={1} max={6} step={1} value={threadCount}
            onChange={(event) => { setThreadCount(Number(event.target.value)); setStep(0); }} className="w-full accent-[#6d5acf]" />
        </div>
        <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />
      </div>

      <div className="bg-black/20 rounded-lg p-3">
        <div className="space-y-2">
          {threadTasks.map((threadTaskList, threadIndex) => (
            <div key={threadIndex} className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted/60 w-16 shrink-0">Thread {threadIndex + 1}</span>
              <div className="flex gap-1 flex-1">
                {threadTaskList.map((task, taskIndex) => {
                  const isComplete = taskIndex < completedPerThread;
                  const isActive = taskIndex === completedPerThread;
                  return (
                    <div key={task} className={`px-1.5 py-0.5 text-[8px] font-mono rounded transition-colors ${
                      isComplete ? "bg-green-500/30 text-green-400" :
                      isActive ? "bg-accent/30 text-accent border border-accent/30" :
                      "bg-card-border/20 text-muted/40"
                    }`}>{task}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={totalCompleted} max={totalTasks} />
          <span className="text-[9px] font-mono text-muted/60">{totalCompleted}/{totalTasks} tasks</span>
        </div>
        <div className="text-[8px] text-muted/40 mt-1">
          All threads process their tasks simultaneously — {threadCount} tasks complete per step
        </div>
      </div>
    </>
  );
}

// ===================== RACE CONDITION =====================

interface RaceStep {
  threadAAction: string;
  threadBAction: string;
  counterValue: number;
  threadALocal: string;
  threadBLocal: string;
  hasConflict: boolean;
}

const RACE_STEPS: RaceStep[] = [
  { threadAAction: "—", threadBAction: "—", counterValue: 5, threadALocal: "—", threadBLocal: "—", hasConflict: false },
  { threadAAction: "READ counter", threadBAction: "—", counterValue: 5, threadALocal: "5", threadBLocal: "—", hasConflict: false },
  { threadAAction: "—", threadBAction: "READ counter", counterValue: 5, threadALocal: "5", threadBLocal: "5", hasConflict: true },
  { threadAAction: "local = 5 + 1", threadBAction: "—", counterValue: 5, threadALocal: "6", threadBLocal: "5", hasConflict: false },
  { threadAAction: "—", threadBAction: "local = 5 + 1", counterValue: 5, threadALocal: "6", threadBLocal: "6", hasConflict: false },
  { threadAAction: "WRITE counter = 6", threadBAction: "—", counterValue: 6, threadALocal: "6", threadBLocal: "6", hasConflict: false },
  { threadAAction: "—", threadBAction: "WRITE counter = 6", counterValue: 6, threadALocal: "6", threadBLocal: "6", hasConflict: true },
];

function RaceConditionView() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useAutoAdvance(isPlaying, step, RACE_STEPS.length, setStep, 2000);

  const currentStep = RACE_STEPS[step];
  const isFinalStep = step === RACE_STEPS.length - 1;

  return (
    <>
      <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />

      <div className="bg-black/20 rounded-lg p-3 space-y-3">
        {/* Counter display */}
        <div className="flex justify-center">
          <div className={`px-4 py-2 rounded-lg text-center border ${isFinalStep ? "border-red-500/50 bg-red-500/10" : "border-card-border"}`}>
            <div className="text-[9px] text-muted/60">Shared Counter</div>
            <div className={`text-2xl font-mono font-bold ${isFinalStep ? "text-red-400" : "text-accent"}`}>{currentStep.counterValue}</div>
            {isFinalStep && <div className="text-[8px] text-red-400 mt-1">Expected: 7, Got: 6 — Lost update!</div>}
          </div>
        </div>

        {/* Thread actions */}
        <div className="grid grid-cols-2 gap-3">
          <ThreadActionPanel
            name="Thread A"
            action={currentStep.threadAAction}
            localValue={currentStep.threadALocal}
            isActive={currentStep.threadAAction !== "—"}
            color="#6d5acf"
          />
          <ThreadActionPanel
            name="Thread B"
            action={currentStep.threadBAction}
            localValue={currentStep.threadBLocal}
            isActive={currentStep.threadBAction !== "—"}
            color="#3b82f6"
          />
        </div>

        {currentStep.hasConflict && (
          <div className="bg-red-500/10 border border-red-500/30 rounded px-2 py-1 text-[9px] text-red-400 text-center">
            ⚠ Both threads operating on stale data — race condition!
          </div>
        )}

        <StepIndicator current={step} total={RACE_STEPS.length} />
      </div>
    </>
  );
}

function ThreadActionPanel({ name, action, localValue, isActive, color }: {
  name: string; action: string; localValue: string; isActive: boolean; color: string;
}) {
  return (
    <div className={`bg-card-border/10 rounded-lg p-2 border transition-colors ${isActive ? "border-accent/30" : "border-card-border/20"}`}>
      <div className="text-[10px] font-mono font-semibold mb-1" style={{ color }}>{name}</div>
      <div className={`text-[9px] font-mono ${isActive ? "text-foreground" : "text-muted/30"}`}>{action}</div>
      <div className="text-[8px] text-muted/50 mt-1">local: {localValue}</div>
    </div>
  );
}

// ===================== DEADLOCK =====================

interface DeadlockStep {
  thread1Status: string;
  thread2Status: string;
  dbOwner: string;
  fileOwner: string;
  isDeadlocked: boolean;
}

const DEADLOCK_STEPS: DeadlockStep[] = [
  { thread1Status: "Running...", thread2Status: "Running...", dbOwner: "—", fileOwner: "—", isDeadlocked: false },
  { thread1Status: "LOCK Database ✓", thread2Status: "Running...", dbOwner: "T1", fileOwner: "—", isDeadlocked: false },
  { thread1Status: "Working with DB", thread2Status: "LOCK File ✓", dbOwner: "T1", fileOwner: "T2", isDeadlocked: false },
  { thread1Status: "Needs File...", thread2Status: "Needs Database...", dbOwner: "T1", fileOwner: "T2", isDeadlocked: false },
  { thread1Status: "WAIT for File ⏳", thread2Status: "WAIT for Database ⏳", dbOwner: "T1", fileOwner: "T2", isDeadlocked: true },
];

function DeadlockView() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useAutoAdvance(isPlaying, step, DEADLOCK_STEPS.length, setStep, 1000);

  const currentStep = DEADLOCK_STEPS[step];

  return (
    <>
      <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />

      <div className="bg-black/20 rounded-lg p-3 space-y-3">
        {/* Resource Allocation Graph */}
        <svg viewBox="0 0 400 180" className="w-full max-w-[400px] mx-auto">
          {/* Resources */}
          <rect x={140} y={10} width={50} height={30} rx={4} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={165} y={29} textAnchor="middle" className="fill-blue-400 text-[9px] font-mono">DB</text>

          <rect x={210} y={10} width={50} height={30} rx={4} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth={1.5} />
          <text x={235} y={29} textAnchor="middle" className="fill-green-400 text-[9px] font-mono">File</text>

          {/* Threads */}
          <circle cx={120} cy={140} r={22} fill="rgba(109,90,207,0.2)" stroke="#6d5acf" strokeWidth={1.5} />
          <text x={120} y={143} textAnchor="middle" className="fill-accent text-[9px] font-mono">T1</text>

          <circle cx={280} cy={140} r={22} fill="rgba(109,90,207,0.2)" stroke="#6d5acf" strokeWidth={1.5} />
          <text x={280} y={143} textAnchor="middle" className="fill-accent text-[9px] font-mono">T2</text>

          {/* T1 holds DB */}
          {currentStep.dbOwner === "T1" && (
            <line x1={140} y1={35} x2={125} y2={118} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrowBlue)" />
          )}
          {/* T2 holds File */}
          {currentStep.fileOwner === "T2" && (
            <line x1={260} y1={35} x2={275} y2={118} stroke="#22c55e" strokeWidth={2} markerEnd="url(#arrowGreen)" />
          )}
          {/* T1 wants File */}
          {step >= 3 && (
            <line x1={140} y1={130} x2={215} y2={42} stroke={currentStep.isDeadlocked ? "#ef4444" : "#fbbf24"}
              strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowRed)" />
          )}
          {/* T2 wants DB */}
          {step >= 3 && (
            <line x1={260} y1={130} x2={185} y2={42} stroke={currentStep.isDeadlocked ? "#ef4444" : "#fbbf24"}
              strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#arrowRed)" />
          )}

          {currentStep.isDeadlocked && (
            <text x={200} y={100} textAnchor="middle" className="fill-red-400 text-[11px] font-bold">DEADLOCK!</text>
          )}

          <defs>
            <marker id="arrowBlue" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
            </marker>
            <marker id="arrowGreen" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
            </marker>
            <marker id="arrowRed" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
            </marker>
          </defs>
        </svg>

        {/* Status panels */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card-border/10 rounded-lg p-2 border border-card-border/20">
            <div className="text-[10px] font-mono text-accent mb-1">Thread 1</div>
            <div className="text-[9px] font-mono text-foreground">{currentStep.thread1Status}</div>
          </div>
          <div className="bg-card-border/10 rounded-lg p-2 border border-card-border/20">
            <div className="text-[10px] font-mono text-accent mb-1">Thread 2</div>
            <div className="text-[9px] font-mono text-foreground">{currentStep.thread2Status}</div>
          </div>
        </div>

        <StepIndicator current={step} total={DEADLOCK_STEPS.length} />
      </div>
    </>
  );
}

// ===================== PRODUCER-CONSUMER =====================

function ProducerConsumerView() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const bufferSize = 5;
  const totalSteps = 16;

  useAutoAdvance(isPlaying, step, totalSteps, setStep, 500);

  // Simulate buffer state at each step
  const getBufferState = (currentStep: number): { items: number[]; producerStatus: string; consumerStatus: string } => {
    const items: number[] = [];
    let producerStatus = "Idle";
    let consumerStatus = "Idle";

    // Simulate a sequence of produce/consume actions
    const actions = ["produce", "produce", "produce", "consume", "produce", "produce",
      "consume", "consume", "produce", "produce", "produce", "consume",
      "produce", "consume", "consume", "consume"];

    let nextItem = 1;
    for (let i = 0; i <= currentStep && i < actions.length; i++) {
      if (actions[i] === "produce") {
        if (items.length < bufferSize) {
          items.push(nextItem++);
          producerStatus = `Produced item ${nextItem - 1}`;
          consumerStatus = "Waiting";
        } else {
          producerStatus = "⏳ Buffer full — waiting";
          consumerStatus = "Idle";
        }
      } else {
        if (items.length > 0) {
          const consumed = items.shift()!;
          consumerStatus = `Consumed item ${consumed}`;
          producerStatus = "Waiting";
        } else {
          consumerStatus = "⏳ Buffer empty — waiting";
          producerStatus = "Idle";
        }
      }
    }

    return { items, producerStatus, consumerStatus };
  };

  const { items, producerStatus, consumerStatus } = getBufferState(step);

  return (
    <>
      <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />

      <div className="bg-black/20 rounded-lg p-3 space-y-3">
        {/* Producer → Buffer → Consumer */}
        <div className="flex items-center justify-center gap-4">
          <div className="bg-card-border/10 rounded-lg p-2 border border-accent/20 text-center min-w-[80px]">
            <div className="text-[9px] font-mono text-accent">Producer</div>
            <div className="text-[8px] text-muted/60 mt-1">{producerStatus}</div>
          </div>

          <span className="text-muted/30">→</span>

          {/* Buffer visualization */}
          <div className="flex gap-1">
            {Array.from({ length: bufferSize }, (_, i) => (
              <div key={i} className={`w-8 h-8 rounded border flex items-center justify-center text-[9px] font-mono transition-colors ${
                i < items.length
                  ? "bg-accent/30 text-accent border-accent/30"
                  : "bg-card-border/10 text-muted/20 border-card-border/20"
              }`}>
                {i < items.length ? items[i] : "·"}
              </div>
            ))}
          </div>

          <span className="text-muted/30">→</span>

          <div className="bg-card-border/10 rounded-lg p-2 border border-green-500/20 text-center min-w-[80px]">
            <div className="text-[9px] font-mono text-green-400">Consumer</div>
            <div className="text-[8px] text-muted/60 mt-1">{consumerStatus}</div>
          </div>
        </div>

        <div className="text-center text-[8px] text-muted/40">
          Buffer: {items.length}/{bufferSize} slots used
        </div>

        <StepIndicator current={step} total={totalSteps} />
      </div>
    </>
  );
}

// ===================== FORK-JOIN =====================

function ForkJoinView() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalSteps = 4;

  useAutoAdvance(isPlaying, step, totalSteps, setStep, 1200);

  const originalArray = [12, 7, 3, 15, 8, 21, 5, 19, 10, 14, 2, 6];
  const chunks = [originalArray.slice(0, 4), originalArray.slice(4, 8), originalArray.slice(8, 12)];
  const chunkSums = chunks.map((chunk) => chunk.reduce((sum, value) => sum + value, 0));
  const totalSum = chunkSums.reduce((sum, value) => sum + value, 0);

  return (
    <>
      <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />

      <div className="bg-black/20 rounded-lg p-3 space-y-4">
        {/* Step 0: Original data */}
        <div className={`transition-opacity ${step >= 0 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">1. Original Data</div>
          <div className="flex gap-1 flex-wrap">
            {originalArray.map((value, index) => (
              <div key={index} className="w-7 h-7 bg-card-border/20 rounded flex items-center justify-center text-[9px] font-mono text-muted/60">
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Fork */}
        <div className={`transition-opacity ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">2. Fork → Split into chunks</div>
          <div className="flex gap-3 flex-wrap">
            {chunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="flex gap-1 bg-accent/5 rounded p-1 border border-accent/20">
                <span className="text-[8px] text-accent/60 self-center mr-1">T{chunkIndex + 1}</span>
                {chunk.map((value, index) => (
                  <div key={index} className="w-7 h-7 bg-accent/20 rounded flex items-center justify-center text-[9px] font-mono text-accent">
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Process */}
        <div className={`transition-opacity ${step >= 2 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">3. Execute → Sum each chunk (parallel)</div>
          <div className="flex gap-3 flex-wrap">
            {chunkSums.map((sum, index) => (
              <div key={index} className="bg-green-500/10 border border-green-500/20 rounded px-3 py-1">
                <span className="text-[8px] text-muted/50">T{index + 1}: </span>
                <span className="text-[10px] font-mono text-green-400 font-semibold">{sum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Join */}
        <div className={`transition-opacity ${step >= 3 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">4. Join → Merge results</div>
          <div className="bg-accent/10 border border-accent/30 rounded px-4 py-2 inline-block">
            <span className="text-[9px] text-muted/60">Total: </span>
            <span className="text-[9px] font-mono text-muted/50">{chunkSums.join(" + ")} = </span>
            <span className="text-lg font-mono text-accent font-bold">{totalSum}</span>
          </div>
        </div>

        <StepIndicator current={step} total={totalSteps} />
      </div>
    </>
  );
}

// ===================== MAP-REDUCE =====================

function MapReduceView() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const totalSteps = 4;

  useAutoAdvance(isPlaying, step, totalSteps, setStep, 1200);

  const inputDocuments = ["hello world", "hello foo", "world bar foo"];
  const mappedPairs = [
    [["hello", 1], ["world", 1]],
    [["hello", 1], ["foo", 1]],
    [["world", 1], ["bar", 1], ["foo", 1]],
  ];
  const shuffled: Record<string, number[]> = { hello: [1, 1], world: [1, 1], foo: [1, 1], bar: [1] };
  const reduced: Record<string, number> = { hello: 2, world: 2, foo: 2, bar: 1 };

  return (
    <>
      <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} onReset={() => setStep(0)} />

      <div className="bg-black/20 rounded-lg p-3 space-y-4">
        {/* Input */}
        <div className={`transition-opacity ${step >= 0 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">1. Input Documents</div>
          <div className="flex gap-2 flex-wrap">
            {inputDocuments.map((document, index) => (
              <div key={index} className="bg-card-border/20 rounded px-2 py-1 text-[9px] font-mono text-muted/70">
                &quot;{document}&quot;
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className={`transition-opacity ${step >= 1 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">2. Map → Emit (word, 1) pairs</div>
          <div className="flex gap-3 flex-wrap">
            {mappedPairs.map((pairs, workerIndex) => (
              <div key={workerIndex} className="bg-accent/5 border border-accent/20 rounded p-1.5">
                <div className="text-[7px] text-accent/60 mb-1">Worker {workerIndex + 1}</div>
                {pairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="text-[8px] font-mono text-accent">
                    ({pair[0]}, {pair[1]})
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Shuffle */}
        <div className={`transition-opacity ${step >= 2 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">3. Shuffle → Group by key</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(shuffled).map(([key, values]) => (
              <div key={key} className="bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
                <span className="text-[9px] font-mono text-yellow-400">{key}</span>
                <span className="text-[8px] text-muted/50"> → [{values.join(", ")}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reduce */}
        <div className={`transition-opacity ${step >= 3 ? "opacity-100" : "opacity-30"}`}>
          <div className="text-[9px] text-muted/60 mb-1">4. Reduce → Sum values per key</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(reduced).map(([key, count]) => (
              <div key={key} className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                <span className="text-[10px] font-mono text-green-400 font-semibold">{key}: {count}</span>
              </div>
            ))}
          </div>
        </div>

        <StepIndicator current={step} total={totalSteps} />
      </div>
    </>
  );
}

// ===================== SHARED COMPONENTS =====================

function PlaybackControls({ isPlaying, setIsPlaying, onReset }: {
  isPlaying: boolean; setIsPlaying: (value: boolean) => void; onReset: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button onClick={() => setIsPlaying(!isPlaying)}
        className="px-3 py-1.5 text-[10px] font-mono bg-accent/20 text-accent border border-accent/30 rounded hover:bg-accent/30 transition-colors cursor-pointer">
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button onClick={onReset}
        className="px-3 py-1.5 text-[10px] font-mono text-muted border border-card-border rounded hover:text-foreground transition-colors cursor-pointer">
        Reset
      </button>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1.5 bg-card-border/20 rounded-full overflow-hidden">
      <div className="h-full bg-accent/60 rounded-full transition-all" style={{ width: `${percentage}%` }} />
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i <= current ? "bg-accent" : "bg-card-border/30"
          }`} />
        ))}
      </div>
      <span className="text-[8px] text-muted/40 font-mono">Step {current + 1}/{total}</span>
    </div>
  );
}

function useAutoAdvance(
  isPlaying: boolean,
  step: number,
  totalSteps: number,
  setStep: (step: number) => void,
  intervalMs: number = 400,
) {
  const resetCallback = useCallback(() => {
    if (step >= totalSteps - 1) setStep(0);
  }, [step, totalSteps, setStep]);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= totalSteps - 1) {
      const timeout = setTimeout(resetCallback, intervalMs * 3);
      return () => clearTimeout(timeout);
    }
    const timer = setTimeout(() => setStep(step + 1), intervalMs);
    return () => clearTimeout(timer);
  }, [isPlaying, step, totalSteps, setStep, intervalMs, resetCallback]);
}
