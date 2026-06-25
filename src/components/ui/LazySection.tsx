"use client";

import { type ReactNode, useState, useRef, useSyncExternalStore, useEffect } from "react";

interface LazySectionProps {
  children: ReactNode;
  id?: string;
  height?: string;
  rootMargin?: string;
  className?: string;
}

function subscribeNoop() {
  return () => {};
}

export function LazySection({
  children,
  id,
  height = "400px",
  rootMargin = "300px",
  className,
}: LazySectionProps) {
  const elementReference = useRef<HTMLDivElement>(null);
  const isServer = useSyncExternalStore(subscribeNoop, () => false, () => true);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (hasBeenVisible) return;

    const element = elementReference.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.unobserve(element);
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasBeenVisible, rootMargin]);

  const shouldRender = isServer || hasBeenVisible;

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
