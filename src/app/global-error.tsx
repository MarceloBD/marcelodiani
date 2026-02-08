"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/reportClientError";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, "global-error-boundary");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#e4e4e7" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ width: "32px", height: "32px", color: "#f87171" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#a1a1aa",
                marginBottom: "24px",
              }}
            >
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                borderRadius: "9999px",
                border: "1px solid #3b82f6",
                background: "transparent",
                color: "#3b82f6",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
