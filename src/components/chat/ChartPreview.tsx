"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ChartPreviewProps {
  title: string;
  description: string;
  imageBase64: string;
}

export function ChartPreview({
  title,
  description,
  imageBase64,
}: ChartPreviewProps) {
  const translations = useTranslations("chat");
  const [isExpanded, setIsExpanded] = useState(false);

  const imageSrc = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-card-border bg-background/50">
      <div className="px-3 py-2 border-b border-card-border">
        <p className="text-xs font-medium text-foreground">{title}</p>
        <p className="text-[10px] text-muted">{description}</p>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full cursor-pointer"
        aria-label={isExpanded ? translations("collapseChart") : translations("expandChart")}
      >
        <img
          src={imageSrc}
          alt={title}
          className={`w-full transition-all duration-200 ${
            isExpanded ? "max-h-[500px]" : "max-h-[200px]"
          } object-contain`}
        />
      </button>

      <div className="px-3 py-1.5 flex justify-end border-t border-card-border">
        <a
          href={imageSrc}
          download={`chart-${title.toLowerCase().replace(/\s+/g, "-")}.png`}
          className="text-[10px] text-accent hover:text-accent-glow transition-colors"
        >
          {translations("download")}
        </a>
      </div>
    </div>
  );
}
