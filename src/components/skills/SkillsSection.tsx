"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionTitle } from "../ui/SectionTitle";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SKILLS, SKILL_CATEGORY_COLORS } from "@/data/skills";
import type { SkillCategory } from "@/data/skills";
import { AlgorithmVisualizer } from "../interactive/AlgorithmVisualizer";
import { TreeVisualizer } from "../interactive/TreeVisualizer";
import { CircuitSimulator } from "../interactive/CircuitSimulator";
import { SignalVisualizer } from "../interactive/SignalVisualizer";

const TechSphereCanvas = dynamic(
  () =>
    import("./TechSphereCanvas").then((module) => ({
      default: module.TechSphereCanvas,
    })),
  { ssr: false }
);

const CATEGORIES: SkillCategory[] = [
  "frontend",
  "backend",
  "database",
  "devops",
  "ai",
  "other",
];

function SkillCategoryGroup({
  category,
  label,
  delay,
  onSkillHover,
}: {
  category: SkillCategory;
  label: string;
  delay: number;
  onSkillHover: (skillName: string | null) => void;
}) {
  const categorySkills = SKILLS.filter((skill) => skill.category === category);
  const color = SKILL_CATEGORY_COLORS[category];

  return (
    <ScrollReveal delay={delay}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-sm font-semibold text-foreground/80">{label}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categorySkills.map(({ name }) => (
            <motion.span
              key={name}
              whileHover={{ scale: 1.05, y: -2 }}
              onMouseEnter={() => onSkillHover(name)}
              onMouseLeave={() => onSkillHover(null)}
              className="px-2.5 py-1 text-xs rounded-md border transition-colors cursor-default"
              style={{
                borderColor: `${color}30`,
                color: `${color}`,
                backgroundColor: `${color}08`,
              }}
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function SphereLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 rounded-full border border-card-border animate-pulse-glow" />
    </div>
  );
}

export function SkillsSection() {
  const translations = useTranslations("skills");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("subtitle")}
        />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 3D Sphere */}
          <div className="h-[400px] md:h-[500px] order-2 lg:order-1">
            <Suspense fallback={<SphereLoading />}>
              <TechSphereCanvas hoveredSkill={hoveredSkill} />
            </Suspense>
          </div>

          {/* Skills categories */}
          <div className="order-1 lg:order-2">
            {CATEGORIES.map((category, index) => (
              <SkillCategoryGroup
                key={category}
                category={category}
                label={translations(`categories.${category}`)}
                delay={index * 0.1}
                onSkillHover={setHoveredSkill}
              />
            ))}
          </div>
        </div>

        <AlgorithmVisualizer />
        <TreeVisualizer />
        <CircuitSimulator />
        <SignalVisualizer />
      </div>
    </section>
  );
}
