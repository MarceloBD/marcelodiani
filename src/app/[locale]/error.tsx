"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { reportClientError } from "@/lib/reportClientError";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const translations = useTranslations("errorPage");

  useEffect(() => {
    reportClientError(error, "page-error-boundary");
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-8 h-8 text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {translations("title")}
        </h1>
        <p className="text-sm text-muted mb-6">
          {translations("description")}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-300 text-sm font-medium cursor-pointer"
        >
          {translations("retry")}
        </button>
      </div>
    </div>
  );
}
