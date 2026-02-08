"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { ProjectCard } from "./ProjectCard";
import { PROJECT_TECH, PROJECT_LINKS } from "@/data/skills";

const PlatformGame = dynamic(
  () => import("../interactive/platformGame").then((module) => ({ default: module.PlatformGame })),
  { ssr: false }
);

function GamepadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 flex-shrink-0"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4M8 10v4" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

const PROJECT_KEYS = [
  "learnCode",
  "codingClasses",
  "languageTranslator",
  "bannerGenerator",
  "travelGuide",
  "cryptoTax",
  "platformJump",
] as const;

export function ProjectsSection() {
  const translations = useTranslations("projects");
  const [isGameExpanded, setIsGameExpanded] = useState(false);

  return (
    <section className="py-24 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <SectionTitle title={translations("title")} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_KEYS.map((projectKey, index) => (
            <div key={projectKey}>
              <ProjectCard
                name={translations(`items.${projectKey}.name`)}
                year={translations(`items.${projectKey}.year`)}
                description={translations(`items.${projectKey}.description`)}
                techStack={PROJECT_TECH[projectKey]}
                githubUrl={PROJECT_LINKS[projectKey]}
                index={index}
              />

              {/* Platform Jump Game expandable demo */}
              {projectKey === "platformJump" && (
                <div className="mt-3">
                  <motion.button
                    onClick={() => setIsGameExpanded((previous) => !previous)}
                    className={`w-full text-xs px-4 py-3 rounded-lg border-2 font-mono font-medium cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      isGameExpanded
                        ? "bg-accent/5 border-accent/20 text-accent/70 hover:bg-accent/10"
                        : "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
                    }`}
                    whileTap={{ scale: 0.97 }}
                    animate={
                      !isGameExpanded
                        ? { scale: [1, 1.02, 1], opacity: [1, 0.8, 1] }
                        : {}
                    }
                    transition={
                      !isGameExpanded
                        ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.15 }
                    }
                  >
                    <GamepadIcon />
                    {isGameExpanded ? translations("closeDemo") : translations("playDemo")}
                  </motion.button>
                  <AnimatePresence>
                    {isGameExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-2"
                      >
                        <PlatformGame />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
