"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** How much extra margin around the viewport to trigger (e.g. "200px") */
  rootMargin?: string;
  /** Percentage of element that must be visible (0 to 1) */
  threshold?: number;
  /** If true, stays true after first intersection (default: false) */
  once?: boolean;
}

/**
 * Lightweight Intersection Observer hook.
 * Returns a ref to attach and a boolean indicating visibility.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "0px",
  threshold = 0,
  once = false,
}: UseInViewOptions = {}) {
  const elementReference = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementReference.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsInView(isVisible);

        if (isVisible && once) {
          observer.unobserve(element);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { elementReference, isInView };
}
