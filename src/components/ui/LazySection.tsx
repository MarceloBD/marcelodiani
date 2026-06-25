import { type ReactNode } from "react";

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
  className,
}: LazySectionProps) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}
