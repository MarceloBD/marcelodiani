"use client";

import { useRef, useEffect, useState, useCallback, useTransition, useMemo } from "react";
import {
  getTopScores,
  startGameSession,
  submitScore,
  type ScoreEntry,
} from "@/app/actions/scoreboard";
import { initializeGameAudio, playJumpSound, playDeathSound, playCoinSound } from "@/lib/gameSounds";
import { type GameScreen, type GameState, TICK_MS } from "./types";
import { createSeededRandom } from "./seededRandom";
import { createInitialGameState, simulateTick } from "./simulation";
import { InputRecorder } from "./inputRecorder";
import { renderFrame } from "./renderer";

export function usePlatformGame(canvasReference: React.RefObject<HTMLCanvasElement | null>) {
  const [gameScreen, setGameScreen] = useState<GameScreen>("menu");
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [isSavingScore, startSaveTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const gameStateReference = useRef<GameState | null>(null);
  const randomReference = useRef<(() => number) | null>(null);
  const sessionIdReference = useRef<string | null>(null);
  const inputRecorderReference = useRef(new InputRecorder());

  const fetchScores = useCallback(async () => {
    const scores = await getTopScores();
    setTopScores(scores);
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const startGame = useCallback(async () => {
    initializeGameAudio();
    setSaveMessage(null);
    setShareMessage(null);
    setPlayerNameInput("");
    setScore(0);

    // Request a verified game session from the server
    let sessionId: string | null = null;
    let seed = Date.now();

    try {
      const session = await startGameSession();
      sessionId = session.sessionId;
      seed = session.seed;
    } catch {
      // Server unavailable -- game still works but score won't be verifiable
    }

    sessionIdReference.current = sessionId;

    const random = createSeededRandom(seed);
    randomReference.current = random;

    gameStateReference.current = createInitialGameState(random);
    inputRecorderReference.current.reset();

    setGameScreen("playing");
  }, []);

  const gameUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://marcelodiani.com/#projects";
    return `${window.location.origin}${window.location.pathname}#projects`;
  }, []);

  const handleShareGame = async () => {
    const currentScore = gameStateReference.current?.score ?? 0;
    const shareText = `I scored ${currentScore} points on Platform Jump! Can you beat me?`;
    const shareData = { title: "Platform Jump", text: shareText, url: gameUrl };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${gameUrl}`);
      setShareMessage("Link copied!");
    } catch {
      setShareMessage("Could not copy link");
    }
  };

  const handleSaveScore = () => {
    const name = playerNameInput.trim();
    if (!name) return;

    const sessionId = sessionIdReference.current;
    if (!sessionId) {
      setSaveMessage("Session unavailable. Play again to save your score.");
      return;
    }

    const inputEvents = inputRecorderReference.current.getRecordedEvents();

    startSaveTransition(async () => {
      const result = await submitScore(sessionId, name, inputEvents);
      if (result.success) {
        setSaveMessage("Score saved!");
        await fetchScores();
      } else {
        setSaveMessage(result.error ?? "Failed to save");
      }
    });
  };

  // Touch control callbacks -- feed into the same InputRecorder for replay compatibility
  const handleTouchDirectionStart = useCallback((key: string) => {
    inputRecorderReference.current.recordKeyDown(key);
  }, []);

  const handleTouchDirectionEnd = useCallback((key: string) => {
    inputRecorderReference.current.recordKeyUp(key);
  }, []);

  // Game loop effect -- runs when gameScreen becomes "playing"
  useEffect(() => {
    if (gameScreen !== "playing") return;

    const canvas = canvasReference.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const state = gameStateReference.current;
    const random = randomReference.current;
    if (!state || !random) return;

    const recorder = inputRecorderReference.current;

    let lastTimestamp = 0;
    let accumulator = 0;
    let animationFrameId = 0;

    const gameKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]);

    const handleKeyDown = (event: KeyboardEvent) => {
      recorder.recordKeyDown(event.key);
      if (gameKeys.has(event.key)) event.preventDefault();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      recorder.recordKeyUp(event.key);
      if (gameKeys.has(event.key)) event.preventDefault();
    };

    const pauseGame = () => {
      if (state.isDead || state.isPaused) return;
      state.isPaused = true;

      // Release all active keys so the replay stays deterministic across pauses
      const activeKeysList = [...recorder.getActiveKeys()];
      for (const key of activeKeysList) {
        recorder.recordKeyUp(key);
      }

      cancelAnimationFrame(animationFrameId);
      renderFrame(context, state);
    };

    const resumeGame = () => {
      if (!state.isPaused) return;
      state.isPaused = false;
      lastTimestamp = 0;
      accumulator = 0;
      canvas.focus();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) pauseGame();
    };

    const handleWindowBlur = () => {
      pauseGame();
    };

    const handleCanvasBlur = () => {
      pauseGame();
    };

    canvas.focus();
    document.body.dataset.gameActive = "true";

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    canvas.addEventListener("blur", handleCanvasBlur);

    const handleDeath = () => {
      playDeathSound();
      cancelAnimationFrame(animationFrameId);
      setScore(state.score);
      setGameScreen("gameover");
      fetchScores();
    };

    const gameLoop = (timestamp: number) => {
      if (state.isDead || state.isPaused) return;

      if (lastTimestamp === 0) lastTimestamp = timestamp;

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      accumulator += delta;

      // Advance simulation in fixed-timestep ticks (deterministic)
      while (accumulator >= TICK_MS) {
        const tickEvents = simulateTick(state, recorder.getActiveKeys(), random);
        recorder.advanceTick();
        accumulator -= TICK_MS;

        if (tickEvents.jumped) playJumpSound();
        if (tickEvents.coinsCollected > 0) playCoinSound();
        if (tickEvents.scoreChanged) setScore(state.score);

        if (tickEvents.died) {
          handleDeath();
          return;
        }
      }

      // Render at whatever frame rate the browser provides
      renderFrame(context, state);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    const handleCanvasClick = () => {
      if (state.isPaused) resumeGame();
    };
    canvas.addEventListener("click", handleCanvasClick);

    // Instant unpause on touch (avoids the 300ms click delay on mobile)
    const handleCanvasTouch = (event: TouchEvent) => {
      if (state.isPaused) {
        event.preventDefault();
        resumeGame();
      }
    };
    canvas.addEventListener("touchstart", handleCanvasTouch);

    return () => {
      delete document.body.dataset.gameActive;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      canvas.removeEventListener("blur", handleCanvasBlur);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("touchstart", handleCanvasTouch);
    };
  }, [gameScreen, fetchScores, canvasReference]);

  return {
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
    handleTouchDirectionStart,
    handleTouchDirectionEnd,
    fetchScores,
  };
}
