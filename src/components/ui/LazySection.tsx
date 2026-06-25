"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";

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
  const elementReference = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setHasBeenVisible(false);
  }, []);

  useEffect(() => {
    if (!isHydrated || hasBeenVisible) return;

    const element = elementReference.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.unobserve(element);
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isHydrated, hasBeenVisible, rootMargin]);

  const shouldRender = hasBeenVisible;

  return (
    <div
      ref={elementReference}
      id={id}
      className={className}
      style={
        shouldRender
          ? undefined
          : {
              contentVisibility: "hidden",
              containIntrinsicSize: height,
            }
      }
    >
      {shouldRender ? (
        children
      ) : (
        <div style={{ minHeight: height }} aria-hidden="true" />
      )}
    </div>
  );
}
