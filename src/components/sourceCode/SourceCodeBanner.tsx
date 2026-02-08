"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const REPO_URL = "https://github.com/MarceloBD/marcelodiani";

const HIGHLIGHT_KEYS = [
  "nextjs",
  "threejs",
  "ai",
  "i18n",
  "realtime",
  "games",
] as const;

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function CodeBracketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
      />
    </svg>
  );
}

export function SourceCodeBanner() {
  const translations = useTranslations("sourceCode");

  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent pointer-events-none" />

      <motion.div
        className="max-w-4xl mx-auto relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="glass-card glow-border rounded-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <motion.div
            className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6 text-accent"
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CodeBracketIcon />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-3 gradient-text inline-block">
            {translations("title")}
          </h2>

          {/* Subtitle */}
          <p className="text-muted text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            {translations("subtitle")}
          </p>

          {/* Highlight chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {HIGHLIGHT_KEYS.map((highlightKey, index) => (
              <motion.span
                key={highlightKey}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-card-border/50 text-muted border border-card-border/30"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.3 }}
              >
                {translations(`highlights.${highlightKey}`)}
              </motion.span>
            ))}
          </div>

          {/* CTA Button */}
          <motion.a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent/10 border border-accent/30 text-accent font-medium text-sm hover:bg-accent/20 transition-colors"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <GitHubIcon />
            {translations("cta")}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
