import type { SimulatorDetailsData } from "@/components/interactiveLab/SimulatorDetails";

export type ConcurrencyMode = "parallel" | "raceCondition" | "deadlock" | "producerConsumer" | "forkJoin" | "mapReduce";

export const CONCURRENCY_MODE_INFO: Record<ConcurrencyMode, SimulatorDetailsData> = {
  parallel: {
    name: "Parallel Execution",
    description: "Parallel execution divides work across multiple threads, achieving speedup proportional to the number of processors (limited by Amdahl's Law).",
    badges: [
      { label: "Speedup", value: "S = 1 / (P/N + (1−P))" },
      { label: "Amdahl's Law", value: "S ≤ 1 / (1−P)" },
    ],
    lists: [
      { title: "Benefits", items: ["Reduced execution time", "Better resource utilization", "Scalability across cores"], variant: "good" },
    ],
  },
  raceCondition: {
    name: "Race Condition",
    description: "A race condition occurs when two threads read and write a shared variable without synchronization. Both may read the same value, compute independently, and write back — losing one update.",
    badges: [
      { label: "Problem", value: "Lost Update" },
      { label: "Fix", value: "Mutex / Atomic ops" },
    ],
    lists: [
      { title: "Example: Shared Counter", items: ["counter = 5", "Thread A reads 5, Thread B reads 5", "Both increment to 6", "Both write 6 (should be 7!)"], variant: "info" },
      { title: "Prevention", items: ["Mutexes for critical sections", "Atomic compare-and-swap", "Lock-free data structures"], variant: "good" },
    ],
  },
  deadlock: {
    name: "Deadlock",
    description: "Deadlock: two threads each hold a resource the other needs. Neither can proceed — system freezes.",
    badges: [
      { label: "Conditions", value: "4 Coffman conditions" },
      { label: "Fix", value: "Lock ordering / Timeout" },
    ],
    lists: [
      { title: "Scenario", items: ["T1 locks Database, needs File", "T2 locks File, needs Database", "Both wait forever → Deadlock"], variant: "info" },
      { title: "Prevention", items: ["Consistent lock ordering", "Timeout + retry", "Deadlock detection algorithms"], variant: "good" },
    ],
  },
  producerConsumer: {
    name: "Producer-Consumer",
    description: "Producers add items to a bounded buffer. Consumers remove items. When the buffer is full, producers wait. When empty, consumers wait.",
    badges: [
      { label: "Buffer", value: "Bounded queue" },
      { label: "Sync", value: "Semaphores / Condition vars" },
    ],
    lists: [
      { title: "Key Points", items: ["Producer waits when buffer is full", "Consumer waits when buffer is empty", "Mutex protects buffer access"], variant: "info" },
    ],
  },
  forkJoin: {
    name: "Fork-Join",
    description: "Split a dataset into chunks, process each chunk in parallel, then join (merge) the results. Common pattern for data parallelism.",
    badges: [
      { label: "Pattern", value: "Divide → Parallel → Merge" },
      { label: "Use Case", value: "Array/batch processing" },
    ],
    lists: [
      { title: "Steps", items: ["Fork: split data into N chunks", "Execute: process chunks in parallel", "Join: merge partial results"], variant: "info" },
    ],
  },
  mapReduce: {
    name: "Map-Reduce",
    description: "Map phase distributes work across workers, each producing key-value pairs. Reduce phase aggregates values by key. Classic distributed computing pattern.",
    badges: [
      { label: "Pattern", value: "Map → Shuffle → Reduce" },
      { label: "Example", value: "Word count" },
    ],
    lists: [
      { title: "Phases", items: ["Map: transform each input into key-value pairs", "Shuffle: group by key", "Reduce: aggregate values per key"], variant: "info" },
    ],
  },
};
