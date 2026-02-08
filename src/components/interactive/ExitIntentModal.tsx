"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { AutoTetris } from "./tetris/AutoTetris";

const SESSION_KEY = "exit-intent-shown";

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
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

function useExitIntent(onExitIntent: () => void) {
  useEffect(() => {
    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget && event.clientY <= 0) {
        onExitIntent();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);

    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [onExitIntent]);
}

export function ExitIntentModal() {
  const translations = useTranslations("exitIntent");
  const [isVisible, setIsVisible] = useState(false);

  const handleExitIntent = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  useExitIntent(handleExitIntent);

  // Close on Escape key
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative glass-card glow-border rounded-2xl p-6 max-w-sm w-full text-center max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label={translations("title")}
          >
            {/* Close button */}
            <motion.button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={translations("close")}
            >
              <CloseIcon />
            </motion.button>

            {/* Header: emoji + title inline */}
            <motion.div
              className="flex items-center justify-center gap-3 mb-3 pr-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.span
                className="text-4xl"
                animate={{
                  rotate: [0, 14, -8, 14, -4, 10, 0],
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut",
                }}
                role="img"
                aria-label={translations("smileEmoji")}
              >
                😊
              </motion.span>

              <h2 className="text-xl font-bold text-foreground">
                {translations("title")}
              </h2>
            </motion.div>

            {/* Message */}
            <motion.p
              className="text-muted text-sm mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {translations("message")}
            </motion.p>

            {/* Auto-playing Tetris */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <AutoTetris />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
