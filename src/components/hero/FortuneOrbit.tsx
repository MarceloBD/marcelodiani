"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { WorldClockOrbit } from "@/components/timezone/WorldClockOrbit";

const ORBIT_DOT_COUNT = 8;
const TOTAL_PHRASES = 24;
const ORBIT_RADIUS = 78;
const PHRASE_DISPLAY_DURATION_MS = 5000;
const SPIN_DURATION_MS = 1500;

function formatOffset(offsetHours: number): string {
  const sign = offsetHours > 0 ? "+" : "";
  const wholeHours = Math.trunc(offsetHours);
  const minutes = Math.round(Math.abs(offsetHours - wholeHours) * 60);

  if (minutes === 0) return `${sign}${wholeHours}h`;
  return `${sign}${wholeHours}h ${minutes}m`;
}

interface FortuneOrbitProps {
  children: ReactNode;
}

export function FortuneOrbit({ children }: FortuneOrbitProps) {
  const translations = useTranslations("fortune");
  const clockTranslations = useTranslations("worldClock");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<string | null>(null);
  const [lastPhraseIndex, setLastPhraseIndex] = useState(-1);
  const [clockOffsetHours, setClockOffsetHours] = useState(0);

  const pickRandomPhrase = useCallback(() => {
    let nextIndex: number;
    do {
      nextIndex = Math.floor(Math.random() * TOTAL_PHRASES);
    } while (nextIndex === lastPhraseIndex);

    setLastPhraseIndex(nextIndex);
    return translations(`phrases.${nextIndex}`);
  }, [translations, lastPhraseIndex]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setCurrentPhrase(null);

    setTimeout(() => {
      setCurrentPhrase(pickRandomPhrase());
      setIsSpinning(false);
    }, SPIN_DURATION_MS);
  }, [isSpinning, pickRandomPhrase]);

  useEffect(() => {
    if (!currentPhrase) return;

    const dismissTimer = setTimeout(() => {
      setCurrentPhrase(null);
    }, PHRASE_DISPLAY_DURATION_MS);

    return () => clearTimeout(dismissTimer);
  }, [currentPhrase]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Orbiting particles */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            animation: `fortune-orbit ${isSpinning ? "0.4s" : "20s"} linear infinite`,
          }}
        >
          {Array.from({ length: ORBIT_DOT_COUNT }).map((_, index) => {
            const angleRadians = (index / ORBIT_DOT_COUNT) * 2 * Math.PI;
            const offsetX = parseFloat((Math.cos(angleRadians) * ORBIT_RADIUS).toFixed(2));
            const offsetY = parseFloat((Math.sin(angleRadians) * ORBIT_RADIUS).toFixed(2));

            return (
              <motion.div
                key={index}
                className="absolute w-1.5 h-1.5 rounded-full bg-accent/70 shadow-[0_0_6px_rgba(59,130,246,0.5)]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* World clock outer orbit */}
        <WorldClockOrbit offsetHours={clockOffsetHours} />

        {/* Clickable avatar */}
        <motion.button
          onClick={handleSpin}
          className="relative cursor-pointer block rounded-full bg-transparent border-none p-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={translations("clickHint")}
          type="button"
        >
          {children}
        </motion.button>
      </div>

      {/* Hint / Fortune phrase display */}
      <div className="min-h-[44px] flex items-start justify-center mt-2">
        <AnimatePresence mode="wait">
          {isSpinning ? (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1.5 items-center"
            >
              {[0, 1, 2].map((dotIndex) => (
                <motion.span
                  key={dotIndex}
                  className="w-1.5 h-1.5 rounded-full bg-accent/70"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: dotIndex * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          ) : currentPhrase ? (
            <motion.div
              key="phrase"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-card px-4 py-2 rounded-xl text-xs md:text-sm text-center max-w-[280px] text-accent/90 italic"
            >
              &ldquo;{currentPhrase}&rdquo;
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-muted tracking-wide"
            >
              {translations("clickHint")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Time Travel Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.5 }}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/50 backdrop-blur-sm border border-card-border/20"
      >
        <input
          type="range"
          min={-12}
          max={12}
          step={0.5}
          value={clockOffsetHours}
          onChange={(event) => setClockOffsetHours(parseFloat(event.target.value))}
          className="world-clock-slider w-20 md:w-24"
          aria-label={clockTranslations("slider")}
        />
        <span
          className="text-[9px] font-mono text-accent/60 whitespace-nowrap min-w-[32px] text-center select-none"
          suppressHydrationWarning
        >
          {clockOffsetHours === 0 ? clockTranslations("now") : formatOffset(clockOffsetHours)}
        </span>
      </motion.div>
    </div>
  );
}
