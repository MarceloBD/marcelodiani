"use client";

import { useState, useEffect, useRef, useCallback, type PointerEvent as ReactPointerEvent } from "react";
import {
  type CharacterState,
  type Direction,
  SCROLL_THRESHOLD,
  WALK_STOP_DELAY_MS,
  KEYBOARD_SCROLL_AMOUNT,
  CELEBRATION_DURATION_MS,
  FINAL_CELEBRATION_DURATION_MS,
  SECTION_MARKERS,
  CHECKPOINT_PROXIMITY,
  POSITION_MIN,
  POSITION_RANGE,
  DRAG_THRESHOLD,
} from "./constants";

function isInputElement(target: HTMLElement) {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function getCheckpointProgress(sectionIndex: number): number {
  return sectionIndex / (SECTION_MARKERS.length - 1);
}

export function useWalkAnimation() {
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [direction, setDirection] = useState<Direction>("right");
  const [positionX, setPositionX] = useState(POSITION_MIN);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const lastScrollYRef = useRef(0);
  const walkTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const animationFrameRef = useRef<number>(undefined);
  const celebratedSectionsRef = useRef(new Set<number>());
  const isCelebratingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastDragXRef = useRef(0);

  const triggerCelebration = useCallback((sectionIndex: number) => {
    const isFinal = sectionIndex === SECTION_MARKERS.length - 1;
    isCelebratingRef.current = true;

    clearTimeout(walkTimeoutRef.current);
    setCharacterState(isFinal ? "celebrating-final" : "celebrating");

    const duration = isFinal
      ? FINAL_CELEBRATION_DURATION_MS
      : CELEBRATION_DURATION_MS;

    walkTimeoutRef.current = setTimeout(() => {
      isCelebratingRef.current = false;
      setCharacterState("idle");
    }, duration);
  }, []);

  const scheduleStopWalking = useCallback(() => {
    clearTimeout(walkTimeoutRef.current);
    walkTimeoutRef.current = setTimeout(() => {
      if (!isCelebratingRef.current) {
        setCharacterState("idle");
      }
    }, WALK_STOP_DELAY_MS);
  }, []);

  const startWalking = useCallback(
    (newDirection: Direction) => {
      if (isCelebratingRef.current) return;

      setCharacterState("walking");
      setDirection(newDirection);
      scheduleStopWalking();
    },
    [scheduleStopWalking]
  );

  const updatePositionFromScroll = useCallback(
    (scrollY: number) => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = scrollY / maxScroll;
      setPositionX(POSITION_MIN + progress * POSITION_RANGE);

      // Section index for ground path dots (visual only)
      const currentSectionIndex = Math.min(
        Math.round(progress * (SECTION_MARKERS.length - 1)),
        SECTION_MARKERS.length - 1
      );
      setActiveSectionIndex(currentSectionIndex);

      // Celebrate only when the boy is very close to a checkpoint dot
      for (let i = 1; i < SECTION_MARKERS.length; i++) {
        if (celebratedSectionsRef.current.has(i)) continue;

        const checkpointAt = getCheckpointProgress(i);

        if (progress >= checkpointAt - CHECKPOINT_PROXIMITY) {
          celebratedSectionsRef.current.add(i);
          triggerCelebration(i);
          break;
        }
      }
    },
    [triggerCelebration]
  );

  // Scroll and keyboard event handling
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    updatePositionFromScroll(window.scrollY);

    const handleScroll = () => {
      if (isDraggingRef.current) return;
      if (animationFrameRef.current) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollYRef.current;

        if (Math.abs(delta) > SCROLL_THRESHOLD) {
          startWalking(delta > 0 ? "right" : "left");
          updatePositionFromScroll(currentScrollY);
        }

        lastScrollYRef.current = currentScrollY;
        animationFrameRef.current = undefined;
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputElement(event.target as HTMLElement)) return;
      if (document.body.dataset.gameActive) return;

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        startWalking("right");
        window.scrollBy({ top: KEYBOARD_SCROLL_AMOUNT, behavior: "smooth" });
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        startWalking("left");
        window.scrollBy({ top: -KEYBOARD_SCROLL_AMOUNT, behavior: "smooth" });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(walkTimeoutRef.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startWalking, updatePositionFromScroll]);

  const handleDragStart = useCallback((event: ReactPointerEvent) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    lastDragXRef.current = event.clientX;
    setIsDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }, []);

  const handleDragMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!isDraggingRef.current) return;

      const distanceFromStart = Math.abs(event.clientX - dragStartXRef.current);
      if (!hasDraggedRef.current && distanceFromStart < DRAG_THRESHOLD) return;
      hasDraggedRef.current = true;

      const viewportWidth = window.innerWidth;
      const rawPercent = (event.clientX / viewportWidth) * 100;
      const clampedPercent = Math.max(
        POSITION_MIN,
        Math.min(POSITION_MIN + POSITION_RANGE, rawPercent)
      );

      const progress = (clampedPercent - POSITION_MIN) / POSITION_RANGE;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const targetScrollY = Math.round(progress * maxScroll);

      window.scrollTo({ top: targetScrollY });
      lastScrollYRef.current = targetScrollY;

      updatePositionFromScroll(targetScrollY);

      const dragDirection: Direction = event.clientX > lastDragXRef.current ? "right" : "left";
      lastDragXRef.current = event.clientX;
      startWalking(dragDirection);
    },
    [updatePositionFromScroll, startWalking]
  );

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleCharacterClick = useCallback(() => {
    if (hasDraggedRef.current) return;
    setIsVisible(false);
  }, []);

  return {
    characterState,
    direction,
    positionX,
    isVisible,
    isDragging,
    activeSectionIndex,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleCharacterClick,
  };
}
