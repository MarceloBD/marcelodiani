"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

/**
 * Returns `false` during SSR and first hydration, `true` after.
 * Uses useSyncExternalStore to avoid hydration mismatches.
 *
 * Primary use: skip framer-motion `initial` props during SSR
 * so the HTML renders in its final visual state without
 * inline styles like `opacity:0` or `transform:translateY(-100px)`.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
