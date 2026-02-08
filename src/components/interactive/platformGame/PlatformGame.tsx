"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./types";
import { usePlatformGame } from "./usePlatformGame";

export function PlatformGame() {
  const canvasReference = useRef<HTMLCanvasElement>(null);
  const t = useTranslations("platformGame");
  const {
    gameScreen,
    setGameScreen,
    score,
    topScores,
    playerNameInput,
    setPlayerNameInput,
    isSavingScore,
    saveMessage,
    shareMessage,
    startGame,
    handleSaveScore,
    handleShareGame,
    fetchScores,
  } = usePlatformGame(canvasReference);

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-card-border">
      <div className="flex items-center justify-between px-4 py-2 bg-card-border/30 border-b border-card-border">
        <span className="text-[10px] text-muted font-mono">{t("headerTitle")}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchScores();
              setGameScreen("scoreboard");
            }}
            className="text-[9px] text-muted hover:text-accent transition-colors cursor-pointer font-mono"
          >
            {t("scoreboard")}
          </button>
          <span className="text-[9px] text-muted/70 font-mono">{t("techStack")}</span>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas
          ref={canvasReference}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          tabIndex={0}
          role="img"
          aria-label={t("canvasAriaLabel")}
          className="block cursor-pointer outline-none"
        />

        <AnimatePresence mode="wait">
          {/* Menu screen */}
          {gameScreen === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/90"
            >
              <p className="text-lg font-bold text-accent mb-1 font-mono">{t("gameTitle")}</p>
              <p className="text-[10px] text-muted mb-6">{t("gameSubtitle")}</p>
              <button
                onClick={startGame}
                className="px-6 py-2.5 text-xs rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer font-medium"
              >
                {t("startGame")}
              </button>
              <p className="text-[9px] text-muted mt-3">
                {t("controlsHint")}
              </p>
            </motion.div>
          )}

          {/* Game over screen */}
          {gameScreen === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 px-6"
            >
              <p className="text-sm font-bold text-red-400 mb-1">{t("gameOver")}</p>
              <p className="text-2xl font-bold text-accent font-mono mb-4">{score}</p>

              {/* Save score form */}
              {!saveMessage ? (
                <div className="flex flex-col items-center gap-2 w-full max-w-[200px] mb-4">
                  <input
                    type="text"
                    value={playerNameInput}
                    onChange={(event) => setPlayerNameInput(event.target.value.slice(0, 30))}
                    placeholder={t("yourNamePlaceholder")}
                    maxLength={30}
                    className="w-full px-3 py-1.5 bg-background/50 border border-card-border rounded text-xs text-foreground placeholder-muted/60 outline-none focus:border-accent/40 text-center"
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={isSavingScore || !playerNameInput.trim()}
                    className="w-full px-3 py-1.5 text-[10px] rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {isSavingScore ? t("saving") : t("saveScore")}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-green-400 mb-4">{saveMessage}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={startGame}
                  className="px-4 py-2 text-xs rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  {t("playAgain")}
                </button>
                <button
                  onClick={() => {
                    fetchScores();
                    setGameScreen("scoreboard");
                  }}
                  className="px-4 py-2 text-xs rounded border border-card-border text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {t("scoreboard")}
                </button>
              </div>

              <button
                onClick={handleShareGame}
                className="mt-3 px-4 py-1.5 text-[10px] rounded border border-accent/20 text-accent/70 hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
              >
                {shareMessage ?? t("challengeFriends")}
              </button>
            </motion.div>
          )}

          {/* Scoreboard screen */}
          {gameScreen === "scoreboard" && (
            <motion.div
              key="scoreboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center bg-background/95 px-6 py-6 overflow-y-auto"
            >
              <p className="text-sm font-bold text-accent mb-4 font-mono">{t("top10Scores")}</p>

              {topScores.length === 0 ? (
                <p className="text-[10px] text-muted">{t("noScoresYet")}</p>
              ) : (
                <div className="w-full max-w-[240px] space-y-1">
                  {topScores.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono ${
                        index === 0 ? "bg-accent/10 text-accent" : "text-foreground/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted w-4 text-right">{index + 1}.</span>
                        <span className="truncate max-w-[120px]">{entry.player_name}</span>
                      </div>
                      <span className="font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={startGame}
                  className="px-4 py-2 text-xs rounded bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
                >
                  {t("play")}
                </button>
                <button
                  onClick={() => setGameScreen("menu")}
                  className="px-4 py-2 text-xs rounded border border-card-border text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  {t("back")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
