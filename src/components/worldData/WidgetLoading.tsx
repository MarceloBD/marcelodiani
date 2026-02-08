"use client";

import { useTranslations } from "next-intl";

export function WidgetLoading() {
  const translation = useTranslations("worldData");

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-3" />
      <p className="text-xs text-muted/60">{translation("loading")}</p>
    </div>
  );
}
