"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";

const LOCALES = [
  { code: "en" as const, label: "EN" },
  { code: "pt" as const, label: "PT" },
];

export function LanguageSwitcher() {
  const translations = useTranslations("nav");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (locale: "en" | "pt") => {
    router.replace(pathname, { locale });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-card-border p-0.5"
      role="group"
      aria-label={translations("languageSelection")}
    >
      {LOCALES.map(({ code, label }) => (
        <motion.button
          key={code}
          onClick={() => switchLocale(code)}
          aria-label={translations(code === "en" ? "switchToEnglish" : "switchToPortuguese")}
          aria-pressed={currentLocale === code}
          className={`relative px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
            currentLocale === code
              ? "text-background"
              : "text-muted hover:text-foreground"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {currentLocale === code && (
            <motion.div
              layoutId="localePill"
              className="absolute inset-0 bg-accent rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
