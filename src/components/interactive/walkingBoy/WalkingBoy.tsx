"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWalkAnimation } from "./useWalkAnimation";
import {
  CharacterSvg,
  GroundPath,
  WalkingDust,
  CelebrationSparkles,
  CelebrationConfetti,
} from "./components";

export function WalkingBoy() {
  const t = useTranslations("walkingBoy");
  const {
    characterState,
    direction,
    positionX,
    isVisible,
    isDragging,
    activeSectionIndex,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleCharacterClick,
  } = useWalkAnimation();

  if (!isVisible) return null;

  const isCelebrating =
    characterState === "celebrating" ||
    characterState === "celebrating-final";
  const isFinalCelebration = characterState === "celebrating-final";

  return (
    <>
      {/* Ground path with section markers */}
      <GroundPath activeIndex={activeSectionIndex} />

      {/* Walking character */}
      <motion.div
        className="fixed bottom-2 z-40 walking-boy-container"
        style={{ left: `${positionX}%`, transform: "translateX(-50%)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6, type: "spring" }}
        aria-hidden="true"
      >
        {/* Character */}
        <div
          className={`relative select-none touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onLostPointerCapture={handleDragEnd}
          onClick={handleCharacterClick}
          title={t("title")}
        >
          <div
            className="transition-transform duration-100"
            style={{
              transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            <CharacterSvg state={characterState} />
          </div>

          {/* Walking dust particles */}
          {characterState === "walking" && <WalkingDust />}

          {/* Celebration sparkles */}
          <AnimatePresence>
            {isCelebrating && (
              <CelebrationSparkles isFinal={isFinalCelebration} />
            )}
          </AnimatePresence>

          {/* Final celebration confetti */}
          <AnimatePresence>
            {isFinalCelebration && <CelebrationConfetti />}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
