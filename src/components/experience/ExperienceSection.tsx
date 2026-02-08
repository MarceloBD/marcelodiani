"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionTitle } from "../ui/SectionTitle";
import { TimelineItem } from "./TimelineItem";
import { FloatingGeometrics } from "./FloatingGeometrics";
import { EXPERIENCE_TECH } from "@/data/skills";

const POSITION_KEYS = ["clearer", "acesso", "vortx", "enfase"] as const;

const COMPANY_LINKS: Record<string, string> = {
  clearer: "https://clearer.io",
  acesso: "https://acessocomercial.com",
  vortx: "https://vortx.com.br",
  enfase: "https://cursoenfase.com.br",
};

const COMPANY_LOGOS: Record<string, string> = {
  clearer: "/logos/clearer.png",
  acesso: "/logos/acesso.png",
  vortx: "/logos/vortx.png",
  enfase: "/logos/enfase.png",
};

export function ExperienceSection() {
  const translations = useTranslations("experience");

  return (
    <section className="pt-12 pb-24 px-6 bg-section-alt relative overflow-hidden">
      <FloatingGeometrics />

      <div className="max-w-6xl mx-auto relative">
        <SectionTitle title={translations("title")} />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[5px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-card-border" />

          {/* Timeline glow pulse */}
          <motion.div
            className="absolute left-[5px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[3px] -ml-px bg-accent/30 blur-sm"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="space-y-16">
            {POSITION_KEYS.map((positionKey, index) => {
              const bulletsCount = 5;
              const bullets = Array.from({ length: bulletsCount }, (_, bulletIndex) =>
                translations(`positions.${positionKey}.bullets.${bulletIndex}`)
              );

              return (
                <TimelineItem
                  key={positionKey}
                  company={translations(`positions.${positionKey}.company`)}
                  companyUrl={COMPANY_LINKS[positionKey]}
                  companyLogo={COMPANY_LOGOS[positionKey]}
                  location={translations(`positions.${positionKey}.location`)}
                  period={translations(`positions.${positionKey}.period`)}
                  role={translations(`positions.${positionKey}.role`)}
                  bullets={bullets}
                  techStack={EXPERIENCE_TECH[positionKey]}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
