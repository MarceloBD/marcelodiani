"use client";

import { useTranslations } from "next-intl";

interface WidgetErrorProps {
  message: string;
  onRetry: () => void;
}

export function WidgetError({ message, onRetry }: WidgetErrorProps) {
  const translation = useTranslations("worldData");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-2xl mb-3">⚠️</div>
      <p className="text-sm text-muted mb-1">{translation("error.title")}</p>
      <p className="text-[10px] text-muted/60 mb-4 max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-1.5 text-xs bg-accent/20 text-accent border border-accent/30 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
      >
        {translation("error.retry")}
      </button>
    </div>
  );
}
