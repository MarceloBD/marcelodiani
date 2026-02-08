export type CharacterState = "idle" | "walking" | "celebrating" | "celebrating-final";
export type Direction = "left" | "right";

export const SCROLL_THRESHOLD = 3;
export const WALK_STOP_DELAY_MS = 200;
export const KEYBOARD_SCROLL_AMOUNT = 150;
export const CELEBRATION_DURATION_MS = 1800;
export const FINAL_CELEBRATION_DURATION_MS = 3500;
export const POSITION_MIN = 5;
export const POSITION_RANGE = 80;

// How close (in scroll %) the boy must be to a checkpoint to celebrate
export const CHECKPOINT_PROXIMITY = 0.015;

// Minimum pixels pointer must move before a drag starts (to distinguish from clicks)
export const DRAG_THRESHOLD = 5;

export const SECTION_MARKERS = [
  "hero",
  "about",
  "experience",
  "skills",
  "projects",
  "education",
  "contact",
];

export const SPARKLE_PARTICLES = [
  { targetX: 20, targetY: -15, delay: 0 },
  { targetX: 14, targetY: -26, delay: 0.04 },
  { targetX: -2, targetY: -28, delay: 0.08 },
  { targetX: -16, targetY: -22, delay: 0.12 },
  { targetX: -22, targetY: -10, delay: 0.16 },
  { targetX: -14, targetY: 2, delay: 0.2 },
  { targetX: 4, targetY: 4, delay: 0.24 },
  { targetX: 16, targetY: -2, delay: 0.28 },
];

export const CONFETTI_COLORS = [
  "#3b82f6",
  "#60a5fa",
  "#f59e0b",
  "#fbbf24",
  "#10b981",
  "#ec4899",
];

export const CONFETTI_PIECES = [
  { targetX: -35, delay: 0, rotation: 120 },
  { targetX: 25, delay: 0.03, rotation: 240 },
  { targetX: -15, delay: 0.06, rotation: 180 },
  { targetX: 40, delay: 0.04, rotation: 300 },
  { targetX: -25, delay: 0.08, rotation: 150 },
  { targetX: 10, delay: 0.02, rotation: 210 },
  { targetX: -40, delay: 0.1, rotation: 270 },
  { targetX: 30, delay: 0.07, rotation: 330 },
  { targetX: -5, delay: 0.05, rotation: 90 },
  { targetX: 20, delay: 0.09, rotation: 200 },
  { targetX: -30, delay: 0.11, rotation: 160 },
  { targetX: 35, delay: 0.06, rotation: 280 },
];
