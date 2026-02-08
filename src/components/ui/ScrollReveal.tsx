"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

const DIRECTION_OFFSETS = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance,
}: ScrollRevealProps) {
  const offset = DIRECTION_OFFSETS[direction];
  const multiplier = distance ? distance / 40 : 1;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offset.x * multiplier,
        y: offset.y * multiplier,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
