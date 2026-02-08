"use client";

import { ScrollReveal } from "./ScrollReveal";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <ScrollReveal className="mb-16 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text inline-block">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-sm md:text-base max-w-md mx-auto">
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}
