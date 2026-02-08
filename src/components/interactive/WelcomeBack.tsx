"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useVisitCount } from "@/hooks/useVisitCount";

const SHOW_DELAY_MS = 2_000;
const AUTO_DISMISS_MS = 8_000;

function CookieIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function WelcomeBack() {
  const translations = useTranslations("welcomeBack");
  const { visitCount, isReturningVisitor } = useVisitCount();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isReturningVisitor) {
      return;
    }

    const showTimeout = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);

    return () => clearTimeout(showTimeout);
  }, [isReturningVisitor]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const dismissTimeout = setTimeout(
      () => setIsVisible(false),
      AUTO_DISMISS_MS
    );

    return () => clearTimeout(dismissTimeout);
  }, [isVisible]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 w-[calc(100%-2rem)] max-w-md"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
        >
          <div className="glass-card glow-border rounded-2xl px-5 py-4 relative">
            {/* Close button */}
            <motion.button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={translations("close")}
            >
              <CloseIcon />
            </motion.button>

            {/* Welcome message */}
            <div className="flex items-start gap-3 pr-6">
              <motion.div
                className="text-accent shrink-0 mt-0.5"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 0.3,
                  ease: "easeInOut",
                }}
              >
                <CookieIcon />
              </motion.div>

              <div className="flex flex-col gap-1.5">
                <motion.p
                  className="text-foreground text-sm font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {translations("greeting")}{" "}
                  <span className="text-accent font-bold">
                    {translations("visitCount", { count: visitCount })}
                  </span>
                </motion.p>

                <motion.p
                  className="text-muted text-xs leading-relaxed flex items-center gap-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                  {translations("privacy")}
                </motion.p>
              </div>
            </div>

            {/* Auto-dismiss progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-accent/40 rounded-b-2xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: AUTO_DISMISS_MS / 1000,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
