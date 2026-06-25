"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

interface TimelineItemProps {
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  period: string;
  role: string;
  bullets: string[];
  techStack: string[];
  index: number;
}

export function TimelineItem({
  company,
  companyUrl,
  companyLogo,
  location,
  period,
  role,
  bullets,
  techStack,
  index,
}: TimelineItemProps) {
  const translations = useTranslations("experience");
  const isEven = index % 2 === 0;

  return (
    <ScrollReveal
      direction={isEven ? "left" : "right"}
      delay={index * 0.1}
      className="relative pl-8 md:pl-0"
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
        {/* Timeline dot with pulse ring */}
        <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-2 z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              className="absolute w-3 h-3 rounded-full border-2 border-accent/60"
              animate={{ scale: [1, 2, 3], opacity: [0, 0.4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
          </motion.div>
        </div>

        {/* Period - left side on desktop */}
        <div className={`md:w-1/2 ${isEven ? "md:text-right md:pr-12" : "md:order-2 md:pl-12"}`}>
          <div className="text-xs text-accent font-mono mb-1">{period}</div>
          <div className="text-xs text-muted">{location}</div>
        </div>

        {/* Content - right side on desktop */}
        <div className={`md:w-1/2 ${isEven ? "md:pl-12" : "md:order-1 md:text-right md:pr-12"}`}>
          <h3 className="text-xl font-bold mb-1">
            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors inline-flex items-center gap-2 group/link"
              >
                {companyLogo && (
                  <Image
                    src={companyLogo}
                    alt={translations("companyLogoAlt", { company })}
                    width={24}
                    height={24}
                    className="rounded-sm object-contain"
                  />
                )}
                {company}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 opacity-50 group-hover/link:opacity-100 transition-opacity"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            ) : (
              <span className="inline-flex items-center gap-2">
                {companyLogo && (
                  <Image
                    src={companyLogo}
                    alt={translations("companyLogoAlt", { company })}
                    width={24}
                    height={24}
                    className="rounded-sm object-contain"
                  />
                )}
                {company}
              </span>
            )}
          </h3>
          <p className="text-sm text-accent mb-4">{role}</p>

          <ul className={`space-y-2 mb-4 ${!isEven ? "md:text-right" : ""}`}>
            {bullets.map((bullet, bulletIndex) => (
              <li key={bulletIndex} className="text-sm text-foreground/70 leading-relaxed">
                <span className="text-accent mr-2">&#8250;</span>
                {bullet}
              </li>
            ))}
          </ul>

          <div className={`flex flex-wrap gap-1.5 ${!isEven ? "md:justify-end" : ""}`}>
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] font-mono rounded bg-accent/10 text-accent border border-accent/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
