"use client";

import { useEffect, useRef } from "react";
import { useInView } from "./useInView";

interface UseVisibleIntervalOptions {
  /** Interval delay in milliseconds */
  delayMs: number;
  /** How far from viewport to start the interval (default: "100px") */
  rootMargin?: string;
}

/**
 * Runs a setInterval callback ONLY when the element is visible on screen.
 * Automatically pauses when scrolled off-screen and resumes when back in view.
 * Returns the ref to attach to the container element.
 */
export function useVisibleInterval(
  callback: () => void,
  { delayMs, rootMargin = "100px" }: UseVisibleIntervalOptions
) {
  const callbackReference = useRef(callback);
  const { elementReference, isInView } = useInView<HTMLDivElement>({
    rootMargin,
  });

  // Keep callback ref fresh without re-creating interval
  useEffect(() => {
    callbackReference.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isInView) return;

    const intervalId = setInterval(() => {
      callbackReference.current();
    }, delayMs);

    return () => clearInterval(intervalId);
  }, [isInView, delayMs]);

  return { visibilityReference: elementReference, isInView };
}
