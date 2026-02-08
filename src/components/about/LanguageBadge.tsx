"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

const LANGUAGE_AUDIO_PATH: Record<string, string> = {
  portuguese: "/audios/portuguese.mp3",
  english: "/audios/english.mp3",
  german: "/audios/german.mp3",
  spanish: "/audios/spanish.mp3",
  italian: "/audios/italian.mp3",
};

// Shared across all badges so only one audio plays at a time
let activeAudio: HTMLAudioElement | null = null;
let activeStopCallback: (() => void) | null = null;

function stopActiveAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  activeStopCallback?.();
  activeAudio = null;
  activeStopCallback = null;
}

function VolumeIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block ml-1.5"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {isPlaying && (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

interface LanguageBadgeProps {
  languageKey: string;
  label: string;
  hintText: string;
}

export function LanguageBadge({
  languageKey,
  label,
  hintText,
}: LanguageBadgeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioReference = useRef<HTMLAudioElement | null>(null);

  const handleClick = useCallback(() => {
    const audioPath = LANGUAGE_AUDIO_PATH[languageKey];
    if (!audioPath) {
      return;
    }

    // Clicking the same badge that is playing stops it
    if (isPlaying) {
      stopActiveAudio();
      return;
    }

    // Stop any other badge that is currently playing
    stopActiveAudio();

    const audio = new Audio(audioPath);
    audioReference.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => {
      setIsPlaying(false);
      activeAudio = null;
      activeStopCallback = null;
    };
    audio.onerror = () => {
      setIsPlaying(false);
      activeAudio = null;
      activeStopCallback = null;
    };

    activeAudio = audio;
    activeStopCallback = () => setIsPlaying(false);

    audio.play();
  }, [languageKey, isPlaying]);

  return (
    <motion.button
      onClick={handleClick}
      title={hintText}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-3 py-1 text-xs rounded-full border cursor-pointer
        transition-colors duration-200 flex items-center gap-0.5
        ${
          isPlaying
            ? "border-accent text-accent bg-accent/10"
            : "border-card-border text-muted hover:border-accent/50 hover:text-accent"
        }
      `}
    >
      {label}
      <VolumeIcon isPlaying={isPlaying} />
    </motion.button>
  );
}
