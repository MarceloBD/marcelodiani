"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const AUDIO_SOURCE = "/audios/space-ambient.mp3";
const FADE_DURATION_MS = 800;
const FADE_STEPS = 20;
const TARGET_VOLUME = 0.35;

export function AudioPlayer() {
  const translations = useTranslations("audioPlayer");
  const audioReference = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFadeInterval = useCallback(() => {
    if (fadeInterval.current) {
      clearInterval(fadeInterval.current);
      fadeInterval.current = null;
    }
  }, []);

  const fadeVolume = useCallback(
    (direction: "in" | "out", onComplete?: () => void) => {
      const audio = audioReference.current;
      if (!audio) return;

      clearFadeInterval();

      const stepDuration = FADE_DURATION_MS / FADE_STEPS;
      const volumeStep = TARGET_VOLUME / FADE_STEPS;

      fadeInterval.current = setInterval(() => {
        if (direction === "in") {
          audio.volume = Math.min(audio.volume + volumeStep, TARGET_VOLUME);
          if (audio.volume >= TARGET_VOLUME) {
            clearFadeInterval();
            onComplete?.();
          }
        } else {
          audio.volume = Math.max(audio.volume - volumeStep, 0);
          if (audio.volume <= 0) {
            clearFadeInterval();
            onComplete?.();
          }
        }
      }, stepDuration);
    },
    [clearFadeInterval]
  );

  const initializeAudio = useCallback(() => {
    if (audioReference.current) return audioReference.current;

    const audio = new Audio(AUDIO_SOURCE);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioReference.current = audio;

    audio.addEventListener("canplaythrough", () => setIsLoaded(true), {
      once: true,
    });

    return audio;
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = initializeAudio();

    if (isPlaying) {
      fadeVolume("out", () => {
        audio.pause();
        setIsPlaying(false);
      });
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        fadeVolume("in");
      });
    }
  }, [isPlaying, initializeAudio, fadeVolume]);

  useEffect(() => {
    return () => {
      clearFadeInterval();
      if (audioReference.current) {
        audioReference.current.pause();
        audioReference.current = null;
      }
    };
  }, [clearFadeInterval]);

  const buttonLabel = isPlaying
    ? translations("pause")
    : translations("play");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-24 left-6 z-50"
    >
      <motion.button
        onClick={togglePlayback}
        className="audio-player-button group relative flex items-center justify-center w-11 h-11 rounded-full glass-card border border-card-border cursor-pointer transition-all duration-300 hover:border-accent/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        {/* Pulsing glow ring when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full audio-glow-ring"
            />
          )}
        </AnimatePresence>

        {/* Animated sound bars when playing, static icon when paused */}
        <div className="relative z-10 flex items-center justify-center w-5 h-5">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-[3px] h-4"
              >
                {[0, 0.2, 0.4, 0.1].map((delay, index) => (
                  <motion.span
                    key={index}
                    className="w-[3px] bg-accent rounded-full"
                    animate={{
                      height: ["4px", "14px", "6px", "12px", "4px"],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="paused"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5 text-muted group-hover:text-accent transition-colors"
                >
                  {/* Musical note icon */}
                  <path
                    d="M9 18V5l12-2v13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isLoaded && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 3, duration: 0.4 }}
            className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-muted/70 pointer-events-none"
          >
            {translations("hint")}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
