"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { SectionTitle } from "../ui/SectionTitle";
import { ScrollReveal } from "../ui/ScrollReveal";
import { TypingGame } from "../interactive/TypingGame";
import { MathBackground } from "./MathBackground";
import { ACHIEVEMENT_LINKS, DEGREE_LINK } from "@/data/skills";

const ACHIEVEMENT_KEYS = [
  "cpa",
  "olympiad",
  "hackathon",
  "robotics",
  "pontinha",
  "clothing",
  "christmas",
] as const;

const ACHIEVEMENT_ICONS: Record<string, string> = {
  cpa: "📊",
  olympiad: "🏅",
  hackathon: "💻",
  robotics: "🤖",
  pontinha: "📚",
  clothing: "🧥",
  christmas: "🎄",
};

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-3.5 h-3.5"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

export function EducationSection() {
  const translations = useTranslations("education");

  return (
    <section id="education" className="py-24 px-6 relative overflow-hidden">
      <MathBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <SectionTitle title={translations("title")} />

        {/* Degree */}
        <ScrollReveal className="mb-16">
          <a
            href={DEGREE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-8 glow-border max-w-2xl mx-auto text-center block group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6 overflow-hidden">
              <Image
                src="/logos/usp.svg"
                alt={translations("uspLogoAlt")}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
              {translations("degree.title")}
            </h3>
            <p className="text-accent mb-1">
              {translations("degree.institution")}
            </p>
            <p className="text-sm text-muted mb-3">
              {translations("degree.period")}
            </p>
            <p className="text-sm text-foreground/70">
              {translations("degree.details")}
            </p>
            <span className="inline-flex items-center gap-1 mt-4 text-xs text-muted/70 group-hover:text-accent/60 transition-colors">
              <ExternalLinkIcon />
            </span>
          </a>
        </ScrollReveal>

        {/* Achievements grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENT_KEYS.map((achievementKey, index) => {
            const link = ACHIEVEMENT_LINKS[achievementKey];
            const Wrapper = link ? "a" : "div";
            const wrapperProps = link
              ? { href: link, target: "_blank" as const, rel: "noopener noreferrer" }
              : {};

            return (
              <motion.div
                key={achievementKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-lg transition-colors duration-300 group"
              >
                <Wrapper {...wrapperProps} className="block p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {ACHIEVEMENT_ICONS[achievementKey]}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold mb-1 group-hover:text-accent transition-colors">
                          {translations(`achievements.${achievementKey}.title`)}
                        </h4>
                        {link && (
                          <span className="text-muted/70 group-hover:text-accent/60 transition-colors flex-shrink-0 mt-0.5">
                            <ExternalLinkIcon />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-accent mb-2">
                        {translations(`achievements.${achievementKey}.year`)}
                      </p>
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        {translations(
                          `achievements.${achievementKey}.description`
                        )}
                      </p>
                    </div>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>

        <TypingGame />
      </div>
    </section>
  );
}
