"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { ChatPanel } from "./ChatPanel";

function ChatIcon() {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function ChatBubble() {
  const translations = useTranslations("chat");
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasBeenSeen(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat panel popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] sm:w-[380px] h-[480px] glass-card rounded-xl overflow-hidden border border-card-border shadow-2xl shadow-black/40 flex flex-col"
          >
            <ChatPanel onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble button */}
      <motion.button
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg shadow-accent/20 cursor-pointer hover:bg-accent-glow transition-colors duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.3, type: "spring" }}
        aria-label={isOpen ? translations("closeChat") : translations("openChat")}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CloseIcon />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatIcon />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse indicator for attention */}
        {!hasBeenSeen && !isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 animate-pulse-glow" />
        )}
      </motion.button>
    </div>
  );
}
