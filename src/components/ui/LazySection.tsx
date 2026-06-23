"use client";

import { type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

interface LazySectionProps {
  children: ReactNode;
  id?: string;
  height?: string;
  rootMargin?: string;
  className?: string;
}

export function LazySection({
  children,
  id,
  height = "400px",
  rootMargin = "300px",
  className,
}: LazySectionProps) {
  const { elementReference, isInView } = useInView<HTMLDivElement>({
    rootMargin,
    once: true,
  });

  return (
    <div 
      ref={elementReference} 
      id={id} 
      className={className}
      style={{
        contentVisibility: isInView ? "auto" : "hidden",
        containIntrinsicSize: isInView ? "auto" : height,
      }}
    >
      {isInView ? (
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
