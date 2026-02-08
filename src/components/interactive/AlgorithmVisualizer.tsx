"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { AlgorithmDetails } from "./AlgorithmDetails";
import { type AlgorithmType } from "@/data/sortingAlgorithms";

const BAR_COUNT = 40;
const ANIMATION_DELAY_MS = 30;

function generateRandomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.random() * 100 + 5);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function AlgorithmVisualizer() {
  const translations = useTranslations("algorithmVisualizer");
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(50));

  useEffect(() => {
    setBars(generateRandomArray(BAR_COUNT));
  }, []);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("quick");
  const [isSorting, setIsSorting] = useState(false);
  const cancelReference = useRef(false);

  const updateBars = useCallback((newBars: number[]) => {
    setBars([...newBars]);
  }, []);

  const bubbleSort = useCallback(async (array: number[]) => {
    const arrayCopy = [...array];
    for (let outerIndex = 0; outerIndex < arrayCopy.length; outerIndex++) {
      for (let innerIndex = 0; innerIndex < arrayCopy.length - outerIndex - 1; innerIndex++) {
        if (cancelReference.current) return;
        setActiveIndices([innerIndex, innerIndex + 1]);
        if (arrayCopy[innerIndex] > arrayCopy[innerIndex + 1]) {
          [arrayCopy[innerIndex], arrayCopy[innerIndex + 1]] = [arrayCopy[innerIndex + 1], arrayCopy[innerIndex]];
          updateBars(arrayCopy);
        }
        await sleep(ANIMATION_DELAY_MS);
      }
      setSortedIndices((previous) => [...previous, arrayCopy.length - outerIndex - 1]);
    }
  }, [updateBars]);

  const quickSort = useCallback(async (array: number[], low: number = 0, high: number = array.length - 1) => {
    if (low >= high || cancelReference.current) return;

    const pivot = array[high];
    let partitionIndex = low;

    for (let currentIndex = low; currentIndex < high; currentIndex++) {
      if (cancelReference.current) return;
      setActiveIndices([currentIndex, high]);
      if (array[currentIndex] < pivot) {
        [array[currentIndex], array[partitionIndex]] = [array[partitionIndex], array[currentIndex]];
        partitionIndex++;
        updateBars(array);
      }
      await sleep(ANIMATION_DELAY_MS);
    }

    [array[partitionIndex], array[high]] = [array[high], array[partitionIndex]];
    updateBars(array);
    setSortedIndices((previous) => [...previous, partitionIndex]);

    await quickSort(array, low, partitionIndex - 1);
    await quickSort(array, partitionIndex + 1, high);
  }, [updateBars]);

  const mergeSort = useCallback(async (array: number[], startIndex: number = 0, endIndex: number = array.length - 1) => {
    if (startIndex >= endIndex || cancelReference.current) return;

    const middleIndex = Math.floor((startIndex + endIndex) / 2);
    await mergeSort(array, startIndex, middleIndex);
    await mergeSort(array, middleIndex + 1, endIndex);

    const leftArray = array.slice(startIndex, middleIndex + 1);
    const rightArray = array.slice(middleIndex + 1, endIndex + 1);
    let leftPointer = 0;
    let rightPointer = 0;
    let mergeIndex = startIndex;

    while (leftPointer < leftArray.length && rightPointer < rightArray.length) {
      if (cancelReference.current) return;
      setActiveIndices([mergeIndex]);
      if (leftArray[leftPointer] <= rightArray[rightPointer]) {
        array[mergeIndex] = leftArray[leftPointer];
        leftPointer++;
      } else {
        array[mergeIndex] = rightArray[rightPointer];
        rightPointer++;
      }
      mergeIndex++;
      updateBars(array);
      await sleep(ANIMATION_DELAY_MS);
    }

    while (leftPointer < leftArray.length) {
      if (cancelReference.current) return;
      array[mergeIndex] = leftArray[leftPointer];
      leftPointer++;
      mergeIndex++;
      updateBars(array);
      await sleep(ANIMATION_DELAY_MS / 2);
    }

    while (rightPointer < rightArray.length) {
      if (cancelReference.current) return;
      array[mergeIndex] = rightArray[rightPointer];
      rightPointer++;
      mergeIndex++;
      updateBars(array);
      await sleep(ANIMATION_DELAY_MS / 2);
    }
  }, [updateBars]);

  const handleSort = async () => {
    cancelReference.current = false;
    setIsSorting(true);
    setSortedIndices([]);
    setActiveIndices([]);

    const arrayCopy = [...bars];

    switch (selectedAlgorithm) {
      case "bubble":
        await bubbleSort(arrayCopy);
        break;
      case "quick":
        await quickSort(arrayCopy);
        break;
      case "merge":
        await mergeSort(arrayCopy);
        break;
    }

    if (!cancelReference.current) {
      setActiveIndices([]);
      setSortedIndices(Array.from({ length: BAR_COUNT }, (_, index) => index));
    }
    setIsSorting(false);
  };

  const handleShuffle = () => {
    cancelReference.current = true;
    setIsSorting(false);
    setBars(generateRandomArray(BAR_COUNT));
    setActiveIndices([]);
    setSortedIndices([]);
  };

  const getBarColor = (index: number): string => {
    if (activeIndices.includes(index)) return "#ef4444";
    if (sortedIndices.includes(index)) return "#22c55e";
    return "#3b82f6";
  };

  return (
    <ScrollReveal className="mt-12">
      <div className="glass-card rounded-xl p-6 border border-card-border">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">{translations("title")}</span>
            <span className="text-[9px] text-muted/70 font-mono">{translations("techStack")}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAlgorithm}
              onChange={(event) => setSelectedAlgorithm(event.target.value as AlgorithmType)}
              disabled={isSorting}
              aria-label={translations("selectAlgorithm")}
              className="text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="bubble">{translations("bubbleSort")}</option>
              <option value="quick">{translations("quickSort")}</option>
              <option value="merge">{translations("mergeSort")}</option>
            </select>

            <button
              onClick={handleShuffle}
              className="text-[10px] px-3 py-1 rounded border border-card-border text-muted hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer"
            >
              {translations("shuffle")}
            </button>

            <button
              onClick={handleSort}
              disabled={isSorting}
              className="text-[10px] px-3 py-1 rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSorting ? translations("sorting") : translations("sort")}
            </button>
          </div>
        </div>

        {/* Bars */}
        <div role="img" aria-label={`Sorting visualization: ${selectedAlgorithm} sort${isSorting ? " in progress" : ""}`} className="flex items-end gap-px h-32">
          {bars.map((height, index) => (
            <motion.div
              key={index}
              className="flex-1 rounded-t-sm transition-colors duration-100"
              style={{
                height: `${height}%`,
                backgroundColor: getBarColor(index),
              }}
              layout
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span className="text-[9px] text-muted">{translations("unsorted")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-[9px] text-muted">{translations("comparing")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-[9px] text-muted">{translations("sorted")}</span>
          </div>
        </div>

        {/* Algorithm Details */}
        <AlgorithmDetails selectedAlgorithm={selectedAlgorithm} />
      </div>
    </ScrollReveal>
  );
}
