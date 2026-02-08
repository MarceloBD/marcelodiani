"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface ChartPreviewProps {
  title: string;
  description: string;
  imageBase64: string;
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function FullscreenModal({
  imageSrc,
  title,
  onClose,
}: {
  imageSrc: string;
  title: string;
  onClose: () => void;
}) {
  const translations = useTranslations("chat");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full px-2">
          <p className="text-sm font-medium text-white">{title}</p>
          <div className="flex items-center gap-3">
            <a
              href={imageSrc}
              download={`chart-${title.toLowerCase().replace(/\s+/g, "-")}.png`}
              className="text-xs text-accent hover:text-accent-glow transition-colors"
            >
              {translations("download")}
            </a>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
              aria-label={translations("close")}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Image */}
        <img
          src={imageSrc}
          alt={title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10"
        />
      </motion.div>
    </motion.div>,
    document.body
  );
}

export function ChartPreview({
  title,
  description,
  imageBase64,
}: ChartPreviewProps) {
  const translations = useTranslations("chat");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageSrc = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const handleClose = useCallback(() => setIsFullscreen(false), []);

  return (
    <>
      <div className="mt-2 rounded-lg overflow-hidden border border-card-border bg-background/50">
        <div className="px-3 py-2 border-b border-card-border">
          <p className="text-xs font-medium text-foreground">{title}</p>
          <p className="text-[10px] text-muted">{description}</p>
        </div>

        <button
          onClick={() => setIsFullscreen(true)}
          className="w-full cursor-pointer"
          aria-label={translations("expandChart")}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full max-h-[200px] object-contain transition-all duration-200 hover:brightness-110"
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

      {/* Fullscreen modal — rendered via portal on document.body */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenModal
            imageSrc={imageSrc}
            title={title}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
