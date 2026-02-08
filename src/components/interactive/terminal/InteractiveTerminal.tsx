"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type TerminalLine, FILE_SYSTEM, AVAILABLE_COMMANDS, WELCOME_MESSAGE } from "./terminalData";
import { processCommand } from "./commandProcessor";

function getLineColor(type: TerminalLine["type"]): string {
  switch (type) {
    case "input":
      return "text-accent";
    case "output":
      return "text-foreground/80";
    case "error":
      return "text-red-400";
    case "system":
      return "text-green-400";
  }
}

export function InteractiveTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_MESSAGE);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputReference = useRef<HTMLInputElement>(null);
  const scrollReference = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollReference.current) {
      scrollReference.current.scrollTop = scrollReference.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  const handleSubmit = () => {
    const inputLine: TerminalLine = { text: `$ ${currentInput}`, type: "input" };

    if (currentInput.trim().toLowerCase() === "clear") {
      setLines([]);
      setCurrentInput("");
      return;
    }

    const outputLines = processCommand(currentInput);
    setLines((previous) => [...previous, inputLine, ...outputLines]);

    if (currentInput.trim()) {
      setCommandHistory((previous) => [...previous, currentInput]);
    }
    setHistoryIndex(-1);
    setCurrentInput("");
  };

  const handleTabAutocomplete = () => {
    const parts = currentInput.split(" ");
    const isTypingArgument = parts.length > 1;

    if (isTypingArgument) {
      const command = parts[0];
      const partial = parts.slice(1).join(" ");
      if (command !== "cat") return;

      const fileNames = Object.keys(FILE_SYSTEM);
      const matches = fileNames.filter((fileName) => fileName.startsWith(partial));

      if (matches.length === 1) {
        setCurrentInput(`${command} ${matches[0]}`);
      }
      return;
    }

    const partial = parts[0];
    const matches = AVAILABLE_COMMANDS.filter((command) => command.startsWith(partial));

    if (matches.length === 1) {
      setCurrentInput(matches[0]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      handleTabAutocomplete();
      return;
    }

    if (event.key === "Enter") {
      handleSubmit();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden border border-card-border">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card-border/30 border-b border-card-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] text-muted font-mono ml-2">
          marcelo@portfolio:~
        </span>
        <span className="text-[9px] text-muted/70 ml-auto font-mono">
          Node.js / Linux / CLI
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollReference}
        onClick={() => inputReference.current?.focus()}
        className="p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed cursor-text"
      >
        {lines.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${getLineColor(line.type)}`}>
            {line.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center">
          <span className="text-accent mr-2">$</span>
          <input
            ref={inputReference}
            type="text"
            value={currentInput}
            onChange={(event) => setCurrentInput(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal command input"
            className="flex-1 bg-transparent outline-none focus-visible:outline-none text-foreground/90 caret-accent"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
