"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { StatsCounter } from "./StatsCounter";
import { LanguageBadge } from "./LanguageBadge";
import { GitHubStats } from "../interactive/GitHubStats";
import { BeyondCode } from "./BeyondCode";

const STATS_KEYS = ["years", "leadership", "tests", "apps"] as const;

const LANGUAGE_KEYS = [
  "portuguese",
  "english",
  "german",
  "spanish",
  "italian",
] as const;

type AboutTab = "professional" | "beyondCode";

const TAB_ANIMATION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3 },
};

function ProfessionalContent() {
  const translations = useTranslations("about");

  return (
    <>
      <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-foreground/80 leading-relaxed text-base md:text-lg mb-8">
            {translations("bio")}
          </p>

          <div>
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
              {translations("languages.title")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_KEYS.map((language) => (
                <LanguageBadge
                  key={language}
                  languageKey={language}
                  label={translations(`languages.${language}`)}
                  hintText={translations("languages.clickHint")}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-8">
          {STATS_KEYS.map((statKey, index) => (
            <StatsCounter
              key={statKey}
              value={translations(`stats.${statKey}`)}
              label={translations(`stats.${statKey}Label`)}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>

      <GitHubStats />
    </>
  );
}

export function AboutSection() {
  const [activeTab, setActiveTab] = useState<AboutTab>("professional");
  const translations = useTranslations("about");
  const beyondCodeTranslations = useTranslations("beyondCode");

  const tabs: { key: AboutTab; label: string }[] = [
    { key: "professional", label: beyondCodeTranslations("tabProfessional") },
    { key: "beyondCode", label: beyondCodeTranslations("tab") },
  ];

  return (
    <section id="about" className="pt-10 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title={translations("title")} />

        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="relative px-6 py-2 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
              >
                {activeTab === key && (
                  <motion.div
                    layoutId="about-tab-indicator"
                    className="absolute inset-0 rounded-full bg-accent/15 border border-accent/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    activeTab === key ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "professional" ? (
            <motion.div key="professional" {...TAB_ANIMATION}>
              <ProfessionalContent />
            </motion.div>
          ) : (
            <motion.div key="beyondCode" {...TAB_ANIMATION}>
              <BeyondCode />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
