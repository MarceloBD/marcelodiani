"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const CHAPTER_KEYS = [
  "origins",
  "school",
  "hobbies",
  "path",
  "university",
  "values",
] as const;

type ChapterKey = (typeof CHAPTER_KEYS)[number];

function ChapterIcon({ chapter }: { chapter: ChapterKey }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-6 h-6 text-accent",
  };

  const icons: Record<ChapterKey, ReactNode> = {
    origins: (
      <svg {...iconProps}>
        <path d="M12 22c4-4 8-7.5 8-12a8 8 0 10-16 0c0 4.5 4 8 8 12z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    school: (
      <svg {...iconProps}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    hobbies: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="12 6 14 10 18 10.5 15 13.5 16 18 12 15.5 8 18 9 13.5 6 10.5 10 10" />
      </svg>
    ),
    path: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
      </svg>
    ),
    university: (
      <svg {...iconProps}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    values: (
      <svg {...iconProps}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  };

  return icons[chapter];
}

export function BeyondCode() {
  const translations = useTranslations("beyondCode");

  return (
    <div className="mt-4">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center text-muted text-sm md:text-base mb-12 max-w-lg mx-auto"
      >
        {translations("subtitle")}
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6">
        {CHAPTER_KEYS.map((chapter, index) => (
          <motion.div
            key={chapter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-accent/30 hover:bg-accent/[0.03] transition-colors duration-300 h-full"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <ChapterIcon chapter={chapter} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {translations(`chapters.${chapter}.title`)}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {translations(`chapters.${chapter}.text`)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
