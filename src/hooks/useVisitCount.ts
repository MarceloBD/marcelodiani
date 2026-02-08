"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

const COOKIE_NAME = "visit-count";
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 year

/**
 * Reads and increments a visit counter stored in browser cookies.
 * Returns the current visit count (1 on first visit, 2+ on returning visits).
 * Only increments once per page load.
 */
export function useVisitCount() {
  const [visitCount, setVisitCount] = useState(0);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);

  useEffect(() => {
    const storedCount = getCookie(COOKIE_NAME);
    const previousCount = storedCount ? parseInt(storedCount, 10) : 0;
    const newCount = previousCount + 1;

    setCookie(COOKIE_NAME, String(newCount), COOKIE_MAX_AGE_SECONDS);
    setVisitCount(newCount);
    setIsReturningVisitor(previousCount > 0);
  }, []);

  return { visitCount, isReturningVisitor };
}
