"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify(metric);
    const url = "/api/analytics/web-vitals";

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        body,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to send web vitals:", error);
      });
    }
  });

  return null;
}
