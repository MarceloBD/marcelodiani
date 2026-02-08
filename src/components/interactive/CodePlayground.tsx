"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionTitle } from "../ui/SectionTitle";
import { PLAYGROUND_LANGUAGES } from "@/data/codePlaygroundLanguages";
import { executeCode } from "@/app/actions/executeCode";

interface BrowserExecutionResult {
  success: boolean;
  lines: string[];
}

async function runCodeInBrowser(
  codeToRun: string
): Promise<BrowserExecutionResult> {
  const logs: string[] = [];

  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(
        args
          .map((argument) => {
            if (typeof argument === "object") return JSON.stringify(argument);
            return String(argument);
          })
          .join(" ")
      );
    },
  };

  try {
    // Using Function constructor instead of eval() - it does not have access
    // to the local scope, reducing the attack surface for code injection
    const executionFunction = new Function(
      "console",
      `return (async function() { ${codeToRun} })();`
    );
    await executionFunction(customConsole);
    // Small delay so async logs can appear
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true, lines: logs.length > 0 ? logs : [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, lines: [message] };
  }
}

export function CodePlayground() {
  const translations = useTranslations("playground");
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(0);
  const [activeSnippetIndex, setActiveSnippetIndex] = useState(0);
  const [code, setCode] = useState(PLAYGROUND_LANGUAGES[0].snippets[0].code);
  const [output, setOutput] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const currentLanguage = PLAYGROUND_LANGUAGES[selectedLanguageIndex];

  const handleLanguageChange = (languageIndex: number) => {
    setSelectedLanguageIndex(languageIndex);
    setActiveSnippetIndex(0);
    setCode(PLAYGROUND_LANGUAGES[languageIndex].snippets[0].code);
    setOutput([]);
    setIsError(false);
  };

  const handleSnippetChange = (snippetIndex: number) => {
    setActiveSnippetIndex(snippetIndex);
    setCode(currentLanguage.snippets[snippetIndex].code);
    setOutput([]);
    setIsError(false);
  };

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput([]);

    const language = PLAYGROUND_LANGUAGES[selectedLanguageIndex];

    try {
      if (language.browserExecutable) {
        const result = await runCodeInBrowser(code);
        setOutput(result.lines);
        setIsError(!result.success);
      } else {
        const result = await executeCode({
          language: language.pistonRuntime,
          code,
        });

        if (result.success && result.output) {
          setOutput(result.output.split("\n"));
          setIsError(false);
        } else {
          setOutput((result.error || translations("unknownError")).split("\n"));
          setIsError(true);
        }
      }
    } catch {
      setOutput([translations("executionFailed")]);
      setIsError(true);
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguageIndex]);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title={translations("title")}
          subtitle={translations("subtitle")}
        />
        <ScrollReveal>
          <div className="glass-card rounded-xl overflow-hidden border border-card-border">
            {/* Header with language selector */}
            <div className="flex items-center justify-between px-4 py-2 bg-card-border/30 border-b border-card-border flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-muted font-mono ml-2">
                  {translations("windowTitle")}
                </span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {PLAYGROUND_LANGUAGES.map((language, index) => (
                  <button
                    key={language.id}
                    onClick={() => handleLanguageChange(index)}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap ${
                      index === selectedLanguageIndex
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted/60 hover:text-muted border border-transparent"
                    }`}
                  >
                    {language.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Snippet tabs */}
            <div className="flex border-b border-card-border overflow-x-auto">
              {currentLanguage.snippets.map((snippet, index) => (
                <button
                  key={snippet.label}
                  onClick={() => handleSnippetChange(index)}
                  className={`px-4 py-2 text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                    index === activeSnippetIndex
                      ? "text-accent border-b border-accent bg-accent/5"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {snippet.label}
                </button>
              ))}
            </div>

            {/* Editor + Output */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-card-border">
              {/* Code editor */}
              <div className="p-4">
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="w-full h-64 bg-transparent font-mono text-xs text-foreground/90 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Output */}
              <div className="p-4 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted uppercase tracking-wider">
                    {translations("output")}
                  </span>
                  <motion.button
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-[10px] bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {isRunning ? translations("running") : translations("run")}
                  </motion.button>
                </div>
                <div className="font-mono text-xs space-y-0.5 h-56 overflow-y-auto">
                  {output.length === 0 ? (
                    <span className="text-muted/40">
                      {translations("clickRunHint")}
                    </span>
                  ) : (
                    output.map((line, index) => (
                      <div
                        key={index}
                        className={
                          isError ? "text-red-400" : "text-green-400"
                        }
                      >
                        <span className="text-muted/30 mr-2">{">"}</span>
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
