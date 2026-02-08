"use client";

import { useCallback } from "react";

interface TouchControlsProperties {
  onDirectionStart: (key: string) => void;
  onDirectionEnd: (key: string) => void;
}

export function TouchControls({ onDirectionStart, onDirectionEnd }: TouchControlsProperties) {
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const direction = event.currentTarget.dataset.direction;
      if (direction) onDirectionStart(direction);
    },
    [onDirectionStart]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const direction = event.currentTarget.dataset.direction;
      if (direction) onDirectionEnd(direction);
    },
    [onDirectionEnd]
  );

  const preventFocusTheft = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const buttonClassName =
    "w-20 h-14 rounded-xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center active:bg-accent/35 select-none touch-none transition-colors";

  return (
    <div className="flex justify-between items-center px-8 py-3 mx-auto" style={{ maxWidth: 320 }}>
      <button
        data-direction="ArrowLeft"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={preventFocusTheft}
        tabIndex={-1}
        className={buttonClassName}
        aria-label="Move left"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        data-direction="ArrowRight"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={preventFocusTheft}
        tabIndex={-1}
        className={buttonClassName}
        aria-label="Move right"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
    </div>
  );
}
