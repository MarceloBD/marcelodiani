"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

const ABBREVIATED_MIDDLE_NAME = "B.";
const FULL_MIDDLE_NAME = "Bertoldi";

const WIDTH_TRANSITION = {
  type: "tween" as const,
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1] as const,
};

const FADE_OUT_TRANSITION = { duration: 0.2, ease: "easeOut" as const };
const FADE_IN_TRANSITION = { duration: 0.35, delay: 0.08, ease: "easeIn" as const };

export function ExpandableName() {
  const [isHovered, setIsHovered] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);
  const abbreviatedReference = useRef<HTMLSpanElement>(null);
  const fullReference = useRef<HTMLSpanElement>(null);
  const [abbreviatedWidth, setAbbreviatedWidth] = useState(0);
  const [fullWidth, setFullWidth] = useState(0);

  const measureWidths = useCallback(() => {
    const abbreviated = abbreviatedReference.current?.offsetWidth ?? 0;
    const full = fullReference.current?.offsetWidth ?? 0;

    if (abbreviated > 0 && full > 0) {
      setAbbreviatedWidth(abbreviated);
      setFullWidth(full);
      setHasMeasured(true);
    }
  }, []);

  useEffect(() => {
    measureWidths();
    window.addEventListener("resize", measureWidths);
    return () => window.removeEventListener("resize", measureWidths);
  }, [measureWidths]);

  const targetWidth = isHovered ? fullWidth : abbreviatedWidth;

  return (
    <span
      className="cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Marcelo{" "}

      <motion.span
        style={{
          display: "inline-block",
          position: "relative",
          overflow: "clip",
          whiteSpace: "nowrap",
        }}
        initial={false}
        animate={{ width: hasMeasured ? targetWidth : "auto" }}
        transition={hasMeasured ? WIDTH_TRANSITION : { duration: 0 }}
      >
        {/* Abbreviated - in normal flow, sets the natural width before measurement */}
        <motion.span
          ref={abbreviatedReference}
          className="gradient-text"
          initial={false}
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={isHovered ? FADE_OUT_TRANSITION : FADE_IN_TRANSITION}
        >
          {ABBREVIATED_MIDDLE_NAME}
        </motion.span>

        {/* Full name - overlaps via absolute positioning */}
        <motion.span
          ref={fullReference}
          className="gradient-text"
          style={{ position: "absolute", left: 0, top: 0 }}
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={isHovered ? FADE_IN_TRANSITION : FADE_OUT_TRANSITION}
        >
          {FULL_MIDDLE_NAME}
        </motion.span>
      </motion.span>

      {" "}Diani
    </span>
  );
}
