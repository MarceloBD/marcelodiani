"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { incrementLikeCount } from "@/app/actions/likes";

type BannerPhase = "idle" | "banner" | "heart" | "counter" | "done";

const SHOW_DELAY_MS = 60_000;
const HEART_DURATION_MS = 1_400;
const COUNTER_DURATION_MS = 3_000;
const STORAGE_KEY = "like-banner-interacted";

const FLOATING_HEARTS = [
  { offsetX: -80, delay: 0 },
  { offsetX: 60, delay: 0.15 },
  { offsetX: -40, delay: 0.3 },
  { offsetX: 90, delay: 0.1 },
  { offsetX: -100, delay: 0.25 },
  { offsetX: 30, delay: 0.4 },
];

const bannerWobble = {
  x: [0, -10, 10, -7, 7, -3, 3, 0],
  rotate: [0, -2, 2, -1.5, 1.5, -0.5, 0.5, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 2,
    ease: "easeInOut" as const,
  },
};

function ThumbsUpIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function LikeBanner() {
  const translations = useTranslations("likeBanner");
  const [phase, setPhase] = useState<BannerPhase>("idle");
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    const timeout = setTimeout(() => setPhase("banner"), SHOW_DELAY_MS);
    return () => clearTimeout(timeout);
  }, []);

  const handleLike = useCallback(async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setPhase("heart");

    const result = await incrementLikeCount();
    // Use server count if available, otherwise fallback to 1
    setLikeCount(result.count > 0 ? result.count : 1);

    setTimeout(() => {
      setPhase("counter");
      setTimeout(() => setPhase("done"), COUNTER_DURATION_MS);
    }, HEART_DURATION_MS);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setPhase("done");
  }, []);

  return (
    <>
      {/* Wobbling banner at the top of the page */}
      <AnimatePresence>
        {phase === "banner" && (
          <motion.div
            className="fixed top-4 left-1/2 z-[60] -translate-x-1/2 w-[calc(100%-2rem)] max-w-md"
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: "spring", damping: 14, stiffness: 160 }}
          >
            <motion.div
              animate={bannerWobble}
              className="glass-card glow-border rounded-2xl px-5 py-3 flex items-center gap-4"
            >
              <motion.p
                className="text-foreground text-sm font-medium flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {translations("question")}
              </motion.p>

              <div className="flex gap-2 shrink-0">
                <motion.button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={translations("yes")}
                >
                  <ThumbsUpIcon />
                  <span className="text-xs font-medium hidden sm:inline">{translations("yes")}</span>
                </motion.button>

                <motion.button
                  onClick={handleDismiss}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 cursor-pointer hover:bg-zinc-500/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={translations("nah")}
                >
                  <ThumbsDownIcon />
                  <span className="text-xs font-medium hidden sm:inline">{translations("nah")}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big heart explosion with floating mini-hearts */}
      <AnimatePresence>
        {phase === "heart" && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Soft glow behind the heart */}
            <motion.div
              className="absolute w-64 h-64 md:w-80 md:h-80 bg-red-500/10 rounded-full blur-3xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3] }}
              transition={{ duration: 0.6 }}
            />

            {/* Main big heart */}
            <motion.div
              className="text-red-500 w-36 h-36 md:w-48 md:h-48"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <HeartIcon />
            </motion.div>

            {/* Floating mini hearts */}
            {FLOATING_HEARTS.map(({ offsetX, delay }, index) => (
              <motion.span
                key={index}
                className="absolute text-red-400 text-xl md:text-3xl"
                initial={{ opacity: 0, y: 0, x: offsetX, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -80, -150],
                  scale: [0.5, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  delay: delay * 0.7,
                  ease: "easeOut",
                }}
              >
                &#10084;
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Like counter badge in top right */}
      <AnimatePresence>
        {phase === "counter" && (
          <motion.div
            className="fixed top-20 right-4 md:top-6 md:right-6 z-[70]"
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="glass-card glow-border rounded-xl px-5 py-3 flex items-center gap-3">
              <motion.span
                className="text-red-500 text-2xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.3 }}
              >
                &#10084;
              </motion.span>
              <div>
                <p className="text-foreground font-bold text-lg">{likeCount}</p>
                <p className="text-muted text-xs">{translations("likesLabel")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
