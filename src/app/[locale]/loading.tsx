"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const translations = useTranslations("loading");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-sm text-muted animate-pulse">{translations("text")}</p>
      </div>
    </div>
  );
}
