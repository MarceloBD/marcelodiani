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
    <section id="projects" className="py-24 px-6 bg-section-alt">
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
                    className="w-full text-[10px] px-3 py-2 rounded-lg border border-accent/20 text-accent hover:bg-accent/10 transition-colors cursor-pointer font-mono"
                    whileTap={{ scale: 0.98 }}
                  >
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
