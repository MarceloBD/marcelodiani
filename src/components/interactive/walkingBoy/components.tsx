"use client";

import { motion } from "framer-motion";
import {
  type CharacterState,
  SECTION_MARKERS,
  SPARKLE_PARTICLES,
  CONFETTI_COLORS,
  CONFETTI_PIECES,
  POSITION_MIN,
  POSITION_RANGE,
} from "./constants";

function getCharacterCssClass(state: CharacterState): string {
  const classMap: Record<CharacterState, string> = {
    idle: "boy-idle",
    walking: "boy-walking",
    celebrating: "boy-celebrating",
    "celebrating-final": "boy-celebrating-final",
  };
  return classMap[state];
}

function ArmsDown() {
  return (
    <>
      <g className="boy-left-arm">
        <rect x="8" y="25" width="6" height="12" rx="3" fill="#2563eb" />
        <circle cx="11" cy="37" r="2.5" fill="#fcd9b6" />
      </g>
      <g className="boy-right-arm">
        <rect x="34" y="25" width="6" height="12" rx="3" fill="#2563eb" />
        <circle cx="37" cy="37" r="2.5" fill="#fcd9b6" />
      </g>
    </>
  );
}

function ArmsRaised() {
  return (
    <>
      {/* Left arm raised up-left */}
      <line x1="14" y1="26" x2="5" y2="13" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
      <circle cx="5" cy="13" r="2.5" fill="#fcd9b6" />
      {/* Right arm raised up-right */}
      <line x1="34" y1="26" x2="43" y2="13" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
      <circle cx="43" cy="13" r="2.5" fill="#fcd9b6" />
    </>
  );
}

function ArmsRaisedHigh() {
  return (
    <>
      {/* Left arm raised high up-left */}
      <line x1="14" y1="26" x2="3" y2="9" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
      <circle cx="3" cy="9" r="2.5" fill="#fcd9b6" />
      {/* Right arm raised high up-right */}
      <line x1="34" y1="26" x2="45" y2="9" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
      <circle cx="45" cy="9" r="2.5" fill="#fcd9b6" />
    </>
  );
}

export function CharacterSvg({ state }: { state: CharacterState }) {
  const isCelebrating =
    state === "celebrating" || state === "celebrating-final";
  const isFinal = state === "celebrating-final";

  return (
    <svg
      viewBox="0 0 48 64"
      className={`w-8 h-11 md:w-10 md:h-14 ${getCharacterCssClass(state)}`}
    >
      {/* Ground shadow */}
      <ellipse cx="24" cy="61" rx="10" ry="3" fill="rgba(59,130,246,0.15)" />

      {/* Animated body group */}
      <g className="boy-body-group">
        {/* Left leg */}
        <g className="boy-left-leg">
          <rect x="17" y="40" width="5" height="13" rx="2.5" fill="#374151" />
          <rect x="15" y="51" width="8" height="4" rx="2" fill="#1e3a5f" />
        </g>

        {/* Right leg */}
        <g className="boy-right-leg">
          <rect x="26" y="40" width="5" height="13" rx="2.5" fill="#374151" />
          <rect x="25" y="51" width="8" height="4" rx="2" fill="#1e3a5f" />
        </g>

        {/* Torso */}
        <rect x="14" y="24" width="20" height="18" rx="3" fill="#3b82f6" />
        <text x="24" y="36" textAnchor="middle" fontSize="7" fill="#93c5fd" fontFamily="monospace">
          {"</>"}
        </text>

        {/* Arms: different SVG shapes based on state */}
        {isFinal ? (
          <ArmsRaisedHigh />
        ) : isCelebrating ? (
          <ArmsRaised />
        ) : (
          <ArmsDown />
        )}

        {/* Neck */}
        <rect x="21" y="20" width="6" height="6" rx="2" fill="#fcd9b6" />

        {/* Head */}
        <circle cx="24" cy="14" r="10" fill="#fcd9b6" />

        {/* Beanie */}
        <path d="M14,15 Q14,4 24,3 Q34,4 34,15" fill="#2563eb" />
        <rect x="12" y="13" width="24" height="3" rx="1.5" fill="#1d4ed8" />
        <circle cx="24" cy="3" r="2" fill="#1d4ed8" />

        {/* Eyes */}
        <g className="boy-eyes">
          <circle cx="20" cy="16" r="2" fill="#1f2937" />
          <circle cx="28" cy="16" r="2" fill="#1f2937" />
          <circle cx="20.7" cy="15.3" r="0.7" fill="#fff" />
          <circle cx="28.7" cy="15.3" r="0.7" fill="#fff" />
        </g>

        {/* Smile */}
        <path d="M21,20 Q24,22.5 27,20" fill="none" stroke="#c47a20" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function GroundPath({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none h-4">
      {/* Ground line */}
      <div className="absolute bottom-[6px] left-[3%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-card-border/40 to-transparent" />

      {/* Section marker dots */}
      {SECTION_MARKERS.map((sectionId, index) => {
        const dotPosition =
          POSITION_MIN + (index / (SECTION_MARKERS.length - 1)) * POSITION_RANGE;
        const isActive = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <div
            key={sectionId}
            className="absolute bottom-[3px] -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${dotPosition}%` }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                isCurrent
                  ? "bg-accent shadow-[0_0_6px_rgba(59,130,246,0.6)] scale-125"
                  : isActive
                    ? "bg-accent/50"
                    : "bg-card-border/60"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function WalkingDust() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
      <span className="boy-dust-particle w-1 h-1 rounded-full bg-muted/30" />
      <span
        className="boy-dust-particle w-0.5 h-0.5 rounded-full bg-muted/20"
        style={{ animationDelay: "0.1s" }}
      />
      <span
        className="boy-dust-particle w-1 h-1 rounded-full bg-muted/25"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  );
}

export function CelebrationSparkles({ isFinal }: { isFinal: boolean }) {
  const particles = isFinal
    ? [
        ...SPARKLE_PARTICLES,
        ...SPARKLE_PARTICLES.map((particle) => ({
          targetX: particle.targetX * 1.6,
          targetY: particle.targetY * 1.6,
          delay: particle.delay + 0.15,
        })),
      ]
    : SPARKLE_PARTICLES;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(({ targetX, targetY, delay }, index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 top-1/3 rounded-full"
          style={{
            width: index % 3 === 0 ? 4 : 3,
            height: index % 3 === 0 ? 4 : 3,
            backgroundColor: index % 2 === 0 ? "#f59e0b" : "#3b82f6",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: targetX, y: targetY, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function CelebrationConfetti() {
  return (
    <div className="absolute -top-2 left-1/2 pointer-events-none">
      {CONFETTI_PIECES.map(({ targetX, delay, rotation }, index) => (
        <motion.div
          key={index}
          className="absolute rounded-sm"
          style={{
            width: index % 3 === 0 ? 6 : 4,
            height: index % 3 === 0 ? 3 : 4,
            backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: targetX,
            y: [0, -25, 40],
            opacity: [1, 1, 0],
            rotate: rotation,
          }}
          transition={{
            duration: 1.8,
            delay,
            ease: "easeOut",
            y: { duration: 1.8, ease: [0.22, 0.68, 0.36, 1] },
          }}
        />
      ))}
    </div>
  );
}
