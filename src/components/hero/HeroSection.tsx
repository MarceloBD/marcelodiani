"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FortuneOrbit } from "./FortuneOrbit";
import { ExpandableName } from "./ExpandableName";

const HeroScene = dynamic(
  () => import("./HeroScene").then((module) => ({ default: module.HeroScene })),
  { ssr: false }
);

function HeroLoading() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-section-alt" />
  );
}

export function HeroSection() {
  const translations = useTranslations("hero");

  const scrollToContact = () => {
    const quoteSection = document.getElementById("quote");
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative h-screen flex flex-col overflow-hidden pt-20 pb-8">
      <Suspense fallback={<HeroLoading />}>
        <HeroScene />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-2"
        >
          <FortuneOrbit>
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-accent/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Image
                src="/cvpic.jpg"
                alt={translations("imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 112px, 128px"
                priority
              />
            </div>
          </FortuneOrbit>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted text-sm md:text-base mb-4 tracking-widest uppercase"
        >
          {translations("greeting")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 gradient-text md:whitespace-nowrap"
        >
          <ExpandableName />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-lg md:text-xl text-foreground/80 mb-4"
        >
          {translations("role")}
        </motion.p>

        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="inline-block px-4 py-1.5 mb-4 text-xs md:text-sm font-medium text-accent border border-accent/30 rounded-full bg-accent/5 tracking-wide"
        >
          {translations("cursorBadge")}
        </motion.span>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-sm md:text-base text-muted max-w-xl mx-auto mb-10 italic"
        >
          &ldquo;{translations("tagline")}&rdquo;
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          onClick={scrollToContact}
          className="px-8 py-3 rounded-full border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-300 text-sm font-medium cursor-pointer glow-border"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {translations("cta")}
        </motion.button>

      </div>

    </section>
  );
}
