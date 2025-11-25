import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, VisualEffectData, GameVariant } from "../types";

export const useGameCore = (gameVariant: GameVariant) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [targetOffset, setTargetOffset] = useState(0);
  const [roundOffset, setRoundOffset] = useState(0);

  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  // --- TEMEL FONKSİYONLAR ---

  const togglePause = useCallback(() => {
    if (gameState !== "playing") return;
    setIsPaused((prev) => !prev);
  }, [gameState]);

  const randomizeRound = useCallback(() => {
    if (gameVariant === "random") {
      setRoundOffset(Math.floor(Math.random() * 800));
    } else {
      setRoundOffset(0);
    }
    if (gameVariant === "moving") {
      setTargetOffset(Math.floor(Math.random() * 800));
    } else {
      setTargetOffset(0);
    }
  }, [gameVariant]);

  // --- ZAMANLAYICI MANTIĞI ---

  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else if (pauseStartTimeRef.current > 0) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      startTimeRef.current += pausedDuration;
      pauseStartTimeRef.current = 0;
    }
  }, [isPaused]);

  // Ana Oyun Döngüsü (10ms)
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (startTimeRef.current === 0) startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      let visualTime = elapsed + roundOffset;

      // Dengesiz Mod (Unstable)
      if (gameVariant === "unstable") {
        const t = now / 1000;
        const chaos = Math.sin(t * 1.5) * 250 + Math.cos(t * 4.2) * 120;
        visualTime = elapsed + roundOffset + chaos;
      }

      setGameTimeMs(visualTime);
    }, 10);

    return () => clearInterval(interval);
  }, [gameState, isPaused, gameVariant, roundOffset]);

  // Efekt Temizleyici
  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  return {
    gameState,
    setGameState,
    isPaused,
    togglePause,
    setIsPaused,
    gameTimeMs,
    setGameTimeMs,
    countdown,
    setCountdown,
    visualEffect,
    setVisualEffect,
    targetOffset,
    setTargetOffset,
    roundOffset,
    setRoundOffset,
    startTimeRef,
    randomizeRound,
  };
};
