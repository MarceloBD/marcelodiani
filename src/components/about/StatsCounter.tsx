"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatsCounterProps {
  value: string;
  label: string;
  delay?: number;
}

function parseNumericPart(value: string): { number: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) {
    return { number: 0, suffix: value };
  }
  return { number: parseInt(match[1], 10), suffix: match[2] };
}

export function StatsCounter({ value, label, delay = 0 }: StatsCounterProps) {
  const reference = useRef<HTMLDivElement>(null);
  const isInView = useInView(reference, { once: true, margin: "-50px" });
  const [displayNumber, setDisplayNumber] = useState(0);
  const { number: targetNumber, suffix } = parseNumericPart(value);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayNumber(Math.floor(eased * targetNumber));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, targetNumber, delay]);

  return (
    <motion.div
      ref={reference}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        {displayNumber}
        {suffix}
      </div>
      <div className="text-sm text-muted">{label}</div>
    </motion.div>
  );
}
