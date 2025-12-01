import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, GameVariant } from "../types";
import { playSound } from "../utils/sound";
import type { CurseType } from "./useSurvivalSystem";

interface UseGameTimerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  gameVariant: GameVariant;
  roundOffset: number;
  speedMultiplier: number;
  isFeverActive: boolean;
  activeCurse: CurseType | null;
  onGameStart: () => void;
  onUpdate?: () => void;
}

export const useGameTimer = ({
  gameState,
  setGameState,
  gameVariant,
  roundOffset,
  speedMultiplier,
  isFeverActive,
  activeCurse,
  onGameStart,
  onUpdate,
}: UseGameTimerProps) => {
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Fever değişikliğini izlemek için ref
  const prevFeverRef = useRef<boolean>(isFeverActive);
  const prevSpeedRef = useRef<number>(speedMultiplier);

  const startGame = useCallback(() => {
    let count = 3;
    setCountdown(count);
    setIsPaused(false);

    const id = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(id);
        setCountdown(null);
        setGameState("playing");
        playSound("whistle");
        startTimeRef.current = Date.now();
        onGameStart();
      }
    }, 1000);
  }, [setGameState, onGameStart]);

  const togglePause = useCallback(() => {
    if (gameState !== "playing") return;
    setIsPaused((prev) => !prev);
  }, [gameState]);

  const resetTimer = useCallback(() => {
    setGameTimeMs(0);
    setIsPaused(false);
    startTimeRef.current = 0;
    pauseStartTimeRef.current = 0;
    prevFeverRef.current = false;
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // Pause Mantığı
  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    } else if (pauseStartTimeRef.current > 0) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      startTimeRef.current += pausedDuration;
      pauseStartTimeRef.current = 0;
    }
  }, [isPaused]);

  // --- REQUEST ANIMATION FRAME TABANLI ZAMANLAYICI ---
  useEffect(() => {
    if (gameState !== "playing" || isPaused) {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Fever değişti mi kontrol et
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    const feverChanged = prevFeverRef.current !== isFeverActive;

    if (feverChanged) {
      const currentElapsed = Date.now() - startTimeRef.current;

      const oldSpeed = prevSpeedRef.current ?? speedMultiplier;
      const currentVisualTime = currentElapsed * oldSpeed + roundOffset;

      const newSpeed = isFeverActive ? speedMultiplier * 0.5 : speedMultiplier;

      if (newSpeed > 0) {
        const newElapsed = currentVisualTime / newSpeed;
        startTimeRef.current = Date.now() - newElapsed;
      }
    }

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      const currentSpeed = isFeverActive
        ? speedMultiplier * 0.5
        : speedMultiplier;

      let visualTime = elapsed * currentSpeed + roundOffset;

      // Dengesiz Hız Laneti veya Varyasyonu
      if (gameVariant === "unstable" || activeCurse === "UNSTABLE") {
        const t = now / 1000;
        const chaos =
          Math.sin(t * 1.5) * 250 +
          Math.cos(t * 4.2) * 120 +
          Math.sin(t * 9.8) * 60;
        visualTime += chaos;
      }

      setGameTimeMs(visualTime);

      if (onUpdate) onUpdate();

      prevFeverRef.current = isFeverActive;
      prevSpeedRef.current = speedMultiplier;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    gameState,
    isPaused,
    gameVariant,
    roundOffset,
    speedMultiplier,
    isFeverActive,
    activeCurse,
    onUpdate,
  ]);

  return {
    gameTimeMs,
    setGameTimeMs,
    isPaused,
    setIsPaused,
    countdown,
    togglePause,
    startGame,
    resetTimer,
  };
};
