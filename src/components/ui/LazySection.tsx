"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

interface LazySectionProps {
  children: ReactNode;
  /** Skeleton height while not yet loaded (default: "400px") */
  height?: string;
  /** How far before viewport to start loading (default: "300px") */
  rootMargin?: string;
  /** CSS class for the wrapper */
  className?: string;
}

/**
 * Defers mounting of heavy children until the section is near the viewport.
 * Once mounted, children stay mounted to preserve state.
 * This is the key performance optimization - sections below the fold
 * won't render their component trees until the user scrolls close.
 */
export function LazySection({
  children,
  height = "400px",
  rootMargin = "300px",
  className,
}: LazySectionProps) {
  const { elementReference, isInView } = useInView<HTMLDivElement>({
    rootMargin,
    once: true,
  });
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      setHasBeenVisible(true);
    }
  }, [isInView]);

  return (
    <div ref={elementReference} className={className}>
      {hasBeenVisible ? (
        children
      ) : (
        <div
          style={{ minHeight: height }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
