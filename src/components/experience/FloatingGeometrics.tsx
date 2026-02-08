"use client";

import { motion } from "framer-motion";

type ShapeType =
  | "triangle"
  | "square"
  | "hexagon"
  | "diamond"
  | "circle"
  | "cross"
  | "cube"
  | "star"
  | "pentagon"
  | "octagon";

interface ShapeConfig {
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  floatDuration: number;
  rotateDuration: number;
  delay: number;
  opacity: number;
  floatDistance: number;
  is3d?: boolean;
}

function getShapeElement(type: ShapeType) {
  switch (type) {
    case "triangle":
      return <path d="M12 3L21 19H3Z" />;
    case "square":
      return <rect x="4" y="4" width="16" height="16" />;
    case "hexagon":
      return <path d="M12 2L21 7V17L12 22L3 17V7Z" />;
    case "diamond":
      return <path d="M12 2L22 12L12 22L2 12Z" />;
    case "circle":
      return <path d="M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2Z" />;
    case "cross":
      return <path d="M10 3H14V10H21V14H14V21H10V14H3V10H10Z" />;
    case "cube":
      return (
        <>
          <path d="M6 8L12 4L18 8V16L12 20L6 16Z" />
          <path d="M6 8L12 12L18 8" />
          <path d="M12 12V20" />
        </>
      );
    case "star":
      return <path d="M12 2L14.5 8.5L21 9.5L16.5 14L18 21L12 17.5L6 21L7.5 14L3 9.5L9.5 8.5Z" />;
    case "pentagon":
      return <path d="M12 2L22 9L19 20H5L2 9Z" />;
    case "octagon":
      return <path d="M8 2H16L22 8V16L16 22H8L2 16V8Z" />;
  }
}

const SHAPES: ShapeConfig[] = [
  // Left column — dense
  { type: "triangle", x: 3, y: 1, size: 52, floatDuration: 20, rotateDuration: 30, delay: 0, opacity: 0.45, floatDistance: 30 },
  { type: "octagon", x: 10, y: 7, size: 36, floatDuration: 23, rotateDuration: 34, delay: 4, opacity: 0.3, floatDistance: 20, is3d: true },
  { type: "cube", x: 6, y: 14, size: 46, floatDuration: 18, rotateDuration: 22, delay: 2, opacity: 0.4, floatDistance: 20, is3d: true },
  { type: "star", x: 1, y: 21, size: 34, floatDuration: 25, rotateDuration: 28, delay: 6, opacity: 0.35, floatDistance: 24, is3d: true },
  { type: "hexagon", x: 2, y: 29, size: 44, floatDuration: 24, rotateDuration: 35, delay: 3, opacity: 0.35, floatDistance: 25 },
  { type: "pentagon", x: 9, y: 36, size: 32, floatDuration: 21, rotateDuration: 30, delay: 1, opacity: 0.3, floatDistance: 18, is3d: true },
  { type: "star", x: 4, y: 43, size: 40, floatDuration: 16, rotateDuration: 20, delay: 1, opacity: 0.4, floatDistance: 28, is3d: true },
  { type: "square", x: 11, y: 50, size: 30, floatDuration: 27, rotateDuration: 38, delay: 5, opacity: 0.28, floatDistance: 16 },
  { type: "diamond", x: 3, y: 57, size: 48, floatDuration: 22, rotateDuration: 28, delay: 4, opacity: 0.35, floatDistance: 35 },
  { type: "cube", x: 8, y: 64, size: 38, floatDuration: 19, rotateDuration: 24, delay: 0, opacity: 0.4, floatDistance: 22, is3d: true },
  { type: "circle", x: 1, y: 70, size: 34, floatDuration: 26, rotateDuration: 42, delay: 7, opacity: 0.3, floatDistance: 18 },
  { type: "pentagon", x: 7, y: 76, size: 42, floatDuration: 19, rotateDuration: 26, delay: 0, opacity: 0.4, floatDistance: 22, is3d: true },
  { type: "octagon", x: 3, y: 83, size: 36, floatDuration: 23, rotateDuration: 32, delay: 3, opacity: 0.32, floatDistance: 20, is3d: true },
  { type: "circle", x: 10, y: 89, size: 38, floatDuration: 26, rotateDuration: 40, delay: 5, opacity: 0.3, floatDistance: 18 },
  { type: "triangle", x: 5, y: 95, size: 44, floatDuration: 20, rotateDuration: 26, delay: 2, opacity: 0.38, floatDistance: 26 },
  // Right column — dense
  { type: "octagon", x: 90, y: 2, size: 46, floatDuration: 21, rotateDuration: 32, delay: 1, opacity: 0.4, floatDistance: 24, is3d: true },
  { type: "diamond", x: 84, y: 9, size: 34, floatDuration: 24, rotateDuration: 30, delay: 5, opacity: 0.32, floatDistance: 20 },
  { type: "square", x: 88, y: 16, size: 44, floatDuration: 22, rotateDuration: 36, delay: 3, opacity: 0.35, floatDistance: 28 },
  { type: "star", x: 93, y: 23, size: 38, floatDuration: 17, rotateDuration: 22, delay: 0, opacity: 0.38, floatDistance: 22, is3d: true },
  { type: "cube", x: 86, y: 30, size: 50, floatDuration: 17, rotateDuration: 24, delay: 0, opacity: 0.45, floatDistance: 26, is3d: true },
  { type: "circle", x: 92, y: 37, size: 32, floatDuration: 28, rotateDuration: 40, delay: 6, opacity: 0.28, floatDistance: 16 },
  { type: "triangle", x: 85, y: 44, size: 42, floatDuration: 19, rotateDuration: 25, delay: 4, opacity: 0.35, floatDistance: 25 },
  { type: "pentagon", x: 91, y: 51, size: 36, floatDuration: 22, rotateDuration: 28, delay: 2, opacity: 0.33, floatDistance: 20, is3d: true },
  { type: "hexagon", x: 84, y: 58, size: 40, floatDuration: 25, rotateDuration: 34, delay: 7, opacity: 0.3, floatDistance: 18 },
  { type: "star", x: 90, y: 65, size: 48, floatDuration: 23, rotateDuration: 20, delay: 2, opacity: 0.4, floatDistance: 30, is3d: true },
  { type: "cube", x: 86, y: 72, size: 34, floatDuration: 20, rotateDuration: 26, delay: 1, opacity: 0.38, floatDistance: 24, is3d: true },
  { type: "hexagon", x: 93, y: 78, size: 38, floatDuration: 21, rotateDuration: 30, delay: 6, opacity: 0.35, floatDistance: 20 },
  { type: "diamond", x: 85, y: 85, size: 42, floatDuration: 18, rotateDuration: 32, delay: 3, opacity: 0.36, floatDistance: 28, is3d: true },
  { type: "pentagon", x: 91, y: 92, size: 44, floatDuration: 18, rotateDuration: 28, delay: 1, opacity: 0.4, floatDistance: 26, is3d: true },
  { type: "square", x: 87, y: 97, size: 30, floatDuration: 26, rotateDuration: 36, delay: 4, opacity: 0.3, floatDistance: 16 },
  // Center-left scattered (behind content, subtle)
  { type: "diamond", x: 20, y: 8, size: 30, floatDuration: 28, rotateDuration: 40, delay: 5, opacity: 0.18, floatDistance: 18, is3d: true },
  { type: "cube", x: 18, y: 30, size: 26, floatDuration: 30, rotateDuration: 36, delay: 2, opacity: 0.15, floatDistance: 14, is3d: true },
  { type: "star", x: 22, y: 52, size: 28, floatDuration: 24, rotateDuration: 32, delay: 7, opacity: 0.16, floatDistance: 16, is3d: true },
  { type: "octagon", x: 16, y: 74, size: 24, floatDuration: 26, rotateDuration: 38, delay: 4, opacity: 0.14, floatDistance: 12, is3d: true },
  { type: "pentagon", x: 24, y: 92, size: 26, floatDuration: 22, rotateDuration: 34, delay: 1, opacity: 0.16, floatDistance: 14, is3d: true },
  // Center-right scattered (behind content, subtle)
  { type: "octagon", x: 72, y: 12, size: 28, floatDuration: 26, rotateDuration: 38, delay: 3, opacity: 0.16, floatDistance: 16, is3d: true },
  { type: "star", x: 76, y: 34, size: 24, floatDuration: 24, rotateDuration: 30, delay: 6, opacity: 0.14, floatDistance: 12, is3d: true },
  { type: "cube", x: 70, y: 56, size: 30, floatDuration: 30, rotateDuration: 35, delay: 0, opacity: 0.15, floatDistance: 14, is3d: true },
  { type: "diamond", x: 78, y: 76, size: 26, floatDuration: 22, rotateDuration: 32, delay: 5, opacity: 0.16, floatDistance: 16, is3d: true },
  { type: "hexagon", x: 68, y: 94, size: 28, floatDuration: 28, rotateDuration: 36, delay: 2, opacity: 0.14, floatDistance: 14 },
  // Deep center (very small, very subtle depth layer)
  { type: "cube", x: 40, y: 15, size: 18, floatDuration: 32, rotateDuration: 44, delay: 3, opacity: 0.1, floatDistance: 10, is3d: true },
  { type: "star", x: 55, y: 40, size: 20, floatDuration: 28, rotateDuration: 40, delay: 6, opacity: 0.08, floatDistance: 8, is3d: true },
  { type: "octagon", x: 45, y: 60, size: 16, floatDuration: 34, rotateDuration: 46, delay: 1, opacity: 0.08, floatDistance: 8, is3d: true },
  { type: "diamond", x: 52, y: 82, size: 20, floatDuration: 30, rotateDuration: 42, delay: 4, opacity: 0.1, floatDistance: 10, is3d: true },
];

function FloatingShape({ config }: { config: ShapeConfig }) {
  const { type, x, y, size, floatDuration, rotateDuration, delay, opacity, floatDistance, is3d } = config;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        perspective: is3d ? 200 : undefined,
      }}
      animate={{
        y: [0, -floatDistance, 0, floatDistance, 0],
        rotateZ: [0, 360],
        opacity: [opacity * 0.6, opacity, opacity * 0.8, opacity, opacity * 0.6],
        ...(is3d && {
          rotateX: [0, 180, 360],
          rotateY: [0, 180, 360],
        }),
      }}
      transition={{
        y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay },
        rotateZ: { duration: rotateDuration, repeat: Infinity, ease: "linear", delay },
        opacity: { duration: floatDuration * 0.8, repeat: Infinity, ease: "easeInOut", delay },
        ...(is3d && {
          rotateX: { duration: rotateDuration * 1.3, repeat: Infinity, ease: "linear", delay },
          rotateY: { duration: rotateDuration * 0.9, repeat: Infinity, ease: "linear", delay },
        }),
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-accent"
      >
        {getShapeElement(type)}
      </svg>
    </motion.div>
  );
}

export function FloatingGeometrics() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SHAPES.map((shapeConfig, index) => (
        <FloatingShape key={index} config={shapeConfig} />
      ))}
    </div>
  );
}
