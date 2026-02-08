"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";

const CODE_SNIPPETS = [
  {
    label: "React Component",
    code: `function Button({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}`,
  },
  {
    label: "Express Route",
    code: `app.get("/api/users", async (req, res) => {
  const users = await db.find({});
  res.json({ data: users });
});`,
  },
  {
    label: "TypeScript Interface",
    code: `interface Developer {
  name: string;
  skills: string[];
  experience: number;
  isAvailable: boolean;
}`,
  },
  {
    label: "Array Reduce",
    code: `const total = orders.reduce(
  (sum, order) => sum + order.price,
  0
);`,
  },
];

type CharacterStatus = "pending" | "correct" | "incorrect";

export function TypingGame() {
  const translations = useTranslations("typingGame");
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const containerReference = useRef<HTMLDivElement>(null);

  const currentSnippet = CODE_SNIPPETS[snippetIndex];
  const targetText = currentSnippet.code;
  const isComplete = typedText.length === targetText.length;

  const correctCharacters = typedText
    .split("")
    .filter((character, index) => character === targetText[index]).length;
  const accuracy = typedText.length > 0 ? Math.round((correctCharacters / typedText.length) * 100) : 0;

  const elapsedSeconds = startTime
    ? ((endTime || elapsedTime) - startTime) / 1000
    : 0;
  const wordsPerMinute =
    elapsedSeconds > 0 ? Math.round((correctCharacters / 5) / (elapsedSeconds / 60)) : 0;

  const getCharacterStatus = useCallback(
    (index: number): CharacterStatus => {
      if (index >= typedText.length) return "pending";
      return typedText[index] === targetText[index] ? "correct" : "incorrect";
    },
    [typedText, targetText]
  );

  useEffect(() => {
    if (isComplete && !endTime) {
      setEndTime(Date.now());
      setIsActive(false);
    }
  }, [isComplete, endTime]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();

      if (event.key === "Backspace") {
        setTypedText((previous) => previous.slice(0, -1));
        return;
      }

      let characterToType = event.key;

      if (event.key === "Enter") {
        characterToType = "\n";
      } else if (event.key === "Tab") {
        characterToType = "  ";
      } else if (event.key.length !== 1) {
        return;
      }

      setTypedText((previous) => {
        if (previous.length + characterToType.length > targetText.length) return previous;

        if (!startTime) {
          setStartTime(Date.now());
        }

        return previous + characterToType;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, targetText, startTime]);

  // Live timer update using dedicated elapsed time state
  useEffect(() => {
    if (!isActive || !startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = () => {
    setTypedText("");
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    setIsActive(true);
    containerReference.current?.focus();
  };

  const handleNextSnippet = () => {
    setSnippetIndex((previous) => (previous + 1) % CODE_SNIPPETS.length);
    setTypedText("");
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    setIsActive(false);
  };

  const statusColor = (status: CharacterStatus): string => {
    switch (status) {
      case "correct":
        return "text-green-400";
      case "incorrect":
        return "bg-red-500/30 text-red-400";
      case "pending":
        return "text-muted";
    }
  };

  return (
    <ScrollReveal className="mt-12">
      <div
        ref={containerReference}
        tabIndex={0}
        className="glass-card rounded-xl p-6 border border-card-border outline-none"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">{translations("title")}</span>
            <span className="text-[9px] text-muted/70 font-mono">{translations("techStack")}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={snippetIndex}
              onChange={(event) => {
                setSnippetIndex(Number(event.target.value));
                setTypedText("");
                setStartTime(null);
                setEndTime(null);
                setIsActive(false);
              }}
              aria-label={translations("selectSnippet")}
              className="text-[10px] bg-card-border/50 border border-card-border rounded px-2 py-1 text-foreground/80 outline-none cursor-pointer"
            >
              {CODE_SNIPPETS.map((snippet, index) => (
                <option key={snippet.label} value={index}>
                  {snippet.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Code display */}
        <div
          role="region"
          aria-label={translations("codeToType")}
          className="font-mono text-sm leading-relaxed mb-4 p-4 bg-background/50 rounded-lg min-h-[120px] whitespace-pre-wrap"
        >
          {targetText.split("").map((character, index) => {
            const status = getCharacterStatus(index);
            const isCursor = index === typedText.length && isActive;
            return (
              <span
                key={index}
                className={`${statusColor(status)} ${isCursor ? "border-l-2 border-accent animate-pulse" : ""}`}
              >
                {character}
              </span>
            );
          })}
        </div>

        {/* Stats + Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4" aria-live="polite">
            {startTime && (
              <>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">{wordsPerMinute}</div>
                  <div className="text-[9px] text-muted uppercase">{translations("wpm")}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{accuracy}%</div>
                  <div className="text-[9px] text-muted uppercase">{translations("accuracy")}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{elapsedSeconds.toFixed(1)}s</div>
                  <div className="text-[9px] text-muted uppercase">{translations("time")}</div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {isComplete ? (
              <>
                <motion.button
                  onClick={handleStart}
                  className="px-3 py-1.5 text-[10px] rounded border border-card-border text-muted hover:text-foreground transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  {translations("tryAgain")}
                </motion.button>
                <motion.button
                  onClick={handleNextSnippet}
                  className="px-3 py-1.5 text-[10px] rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  {translations("nextSnippet")}
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={handleStart}
                className="px-3 py-1.5 text-[10px] rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? translations("restart") : translations("startTyping")}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
