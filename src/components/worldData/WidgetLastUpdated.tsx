"use client";

import { useTranslations } from "next-intl";

interface WidgetLastUpdatedProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  /** Optional note about update frequency (e.g. "Updated once per day") */
  updateFrequencyNote?: string;
}

export function WidgetLastUpdated({ lastUpdated, onRefresh, updateFrequencyNote }: WidgetLastUpdatedProps) {
  const translation = useTranslations("worldData");

  if (!lastUpdated) return null;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-card-border/30 gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] text-muted/50">
          {translation("lastUpdated")} {lastUpdated.toLocaleTimeString()}
        </span>
        {updateFrequencyNote && (
          <span className="text-[9px] text-amber-400/70">
            {updateFrequencyNote}
          </span>
        )}
      </div>
      <button
        onClick={onRefresh}
        className="text-[9px] text-accent/70 hover:text-accent transition-colors cursor-pointer shrink-0"
      >
        {translation("refresh")}
      </button>
    </div>
  );
}
