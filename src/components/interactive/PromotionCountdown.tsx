"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getMonthlyDiscount, getTimeRemaining } from "@/lib/monthly-discount";

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
    </svg>
  );
}

interface TimeBlockProps {
  value: number;
  label: string;
}

function TimeBlock({ value, label }: TimeBlockProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-background/80 border border-accent/20 rounded-lg px-3 py-2 min-w-[52px] text-center">
        <span className="text-xl font-bold text-accent tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] text-muted uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
}

export function PromotionCountdown() {
  const translations = useTranslations("quote");
  const [discount] = useState(() => getMonthlyDiscount());
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = timeRemaining;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-accent/20 bg-accent/5 p-5 mb-6"
    >
      {/* Background glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-accent animate-pulse">
            <FlameIcon />
          </span>
          <span className="text-sm font-bold text-accent uppercase tracking-wide">
            {translations("promotionTitle")}
          </span>
          <span className="ml-auto bg-accent/20 text-accent text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed">
          {translations("promotionDescription")}
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2">
          <TimeBlock value={days} label={translations("countdownDays")} />
          <span className="text-accent font-bold text-lg mt-[-12px]">:</span>
          <TimeBlock value={hours} label={translations("countdownHours")} />
          <span className="text-accent font-bold text-lg mt-[-12px]">:</span>
          <TimeBlock value={minutes} label={translations("countdownMinutes")} />
          <span className="text-accent font-bold text-lg mt-[-12px]">:</span>
          <TimeBlock value={seconds} label={translations("countdownSeconds")} />
        </div>

        {/* Urgency text */}
        <p className="text-[10px] text-center text-muted/70 italic">
          {translations("promotionUrgency")}
        </p>
      </div>
    </motion.div>
  );
}
