"use client";

import { useState, useRef, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { useTranslations, useLocale } from "next-intl";
import { DefaultChatTransport } from "ai";
import { ChatMessages } from "./ChatMessages";

interface ChatPanelProps {
  onClose: () => void;
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
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

export function ChatPanel({ onClose }: ChatPanelProps) {
  const translations = useTranslations("chat");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { locale },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    sendMessage({ text: trimmedInput });
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const suggestedPrompts = [
    translations("suggestions.skills"),
    translations("suggestions.experience"),
    translations("suggestions.chart"),
  ];

  const showSuggestions = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-card-border/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            {translations("title")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors cursor-pointer p-1"
          aria-label={translations("close")}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {showSuggestions ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
            <p className="text-xs text-muted text-center">
              {translations("welcome")}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[250px]">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-[10px] text-left px-3 py-2 rounded-lg border border-card-border hover:border-accent/30 hover:bg-accent/5 text-muted hover:text-foreground transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="px-3 py-2 text-[10px] text-red-400 bg-red-500/10 border-t border-red-500/20">
          {error.message || translations("error")}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 border-t border-card-border"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={translations("placeholder")}
          maxLength={1000}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted/40 outline-none"
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-1.5 rounded text-accent hover:text-accent-glow disabled:text-muted/30 transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label={translations("send")}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
