"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChartPreview } from "./ChartPreview";

const SUGGESTION_PREFIX = ">> ";
const BASE64_IMAGE_PATTERN = /!\[.*?\]\(data:image\/[^)]+\)/g;

interface ToolOutput {
  success: boolean;
  title: string;
  description: string;
  imageBase64?: string;
  logs?: string;
  error?: string;
}

interface ParsedContent {
  text: string;
  suggestions: string[];
}

function stripBase64Images(content: string): string {
  return content.replace(BASE64_IMAGE_PATTERN, "").trim();
}

function parseSuggestions(content: string): ParsedContent {
  const cleaned = stripBase64Images(content);
  const lines = cleaned.split("\n");
  const textLines: string[] = [];
  const suggestions: string[] = [];

  for (const line of lines) {
    if (line.startsWith(SUGGESTION_PREFIX)) {
      suggestions.push(line.slice(SUGGESTION_PREFIX.length).trim());
    } else {
      textLines.push(line);
    }
  }

  return {
    text: textLines.join("\n").trimEnd(),
    suggestions,
  };
}

function FollowUpSuggestions({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          className="text-[10px] text-left px-3 py-1.5 rounded-lg border border-card-border hover:border-accent/30 hover:bg-accent/5 text-muted hover:text-foreground transition-all cursor-pointer"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] px-3 py-2 rounded-lg bg-accent/20 border border-accent/20 text-xs text-foreground">
        {content}
      </div>
    </div>
  );
}

function AssistantTextMessage({
  content,
  isLastMessage,
  onSuggestionClick,
}: {
  content: string;
  isLastMessage: boolean;
  onSuggestionClick: (suggestion: string) => void;
}) {
  if (!content) return null;

  const { text, suggestions } = parseSuggestions(content);

  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[85%] px-3 py-2 rounded-lg bg-card/50 border border-card-border text-xs text-foreground/90 whitespace-pre-wrap">
        {text}
      </div>
      {isLastMessage && (
        <FollowUpSuggestions
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      )}
    </div>
  );
}

function ToolResultDisplay({ output, translations }: { output: ToolOutput; translations: ReturnType<typeof useTranslations> }) {
  if (!output.success) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {translations("chartFailed")} {output.error}
        </div>
      </div>
    );
  }

  if (output.imageBase64) {
    return (
      <ChartPreview
        title={output.title}
        description={output.description}
        imageBase64={output.imageBase64}
      />
    );
  }

  if (output.logs) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] px-3 py-2 rounded-lg bg-card/50 border border-card-border text-xs font-mono text-green-400">
          {output.logs}
        </div>
      </div>
    );
  }

  return null;
}

function SpinnerIcon() {
  return (
    <motion.svg
      className="w-3 h-3"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" className="opacity-75" />
    </motion.svg>
  );
}

function GeneratingIndicator({ translations }: { translations: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex justify-start">
      <div className="px-3 py-2 rounded-lg bg-card/50 border border-card-border text-[10px] text-muted flex items-center gap-2">
        <SpinnerIcon />
        {translations("generatingChart")}
      </div>
    </div>
  );
}

const BOUNCE_DELAYS = [0, 0.15, 0.3];

function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="px-3 py-2 rounded-lg bg-card/50 border border-card-border">
        <div className="flex gap-1">
          {BOUNCE_DELAYS.map((delay) => (
            <motion.span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-accent/60"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 0.8,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatMessages({ messages, isLoading, onSuggestionClick }: ChatMessagesProps) {
  const translations = useTranslations("chat");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin"
    >
      {messages.map((message) => (
        <div key={message.id} className="space-y-2">
          {message.parts.map((part, partIndex) => {
            const partKey = `${message.id}-${partIndex}`;

            if (part.type === "text" && part.text) {
              if (message.role === "user") {
                return <UserMessage key={partKey} content={part.text} />;
              }

              const isLastAssistant = message.id === lastAssistantMessageId && !isLoading;
              return (
                <AssistantTextMessage
                  key={partKey}
                  content={part.text}
                  isLastMessage={isLastAssistant}
                  onSuggestionClick={onSuggestionClick}
                />
              );
            }

            if (part.type === "tool-generateVisualization") {
              if (part.state === "output-available") {
                return (
                  <ToolResultDisplay
                    key={partKey}
                    output={part.output as ToolOutput}
                    translations={translations}
                  />
                );
              }

              // Tool is still running
              return <GeneratingIndicator key={partKey} translations={translations} />;
            }

            return null;
          })}
        </div>
      ))}

      {isLoading && <LoadingDots />}
    </div>
  );
}
