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
    const feverChanged = prevFeverRef.current !== isFeverActive;

    if (feverChanged && isFeverActive) {
      // Fever başladı ->
      const currentElapsed = Date.now() - startTimeRef.current;
      const currentSpeed = speedMultiplier;
      const currentVisualTime = currentElapsed * currentSpeed + roundOffset;

      const newElapsed = currentVisualTime / (speedMultiplier * 0.5);
      startTimeRef.current = Date.now() - newElapsed;
    } else if (feverChanged && !isFeverActive) {
      // Fever bitti -> Normal hıza dön, geçen süreyi buna göre ayarla
      const currentElapsed = Date.now() - startTimeRef.current;
      const currentSpeed = speedMultiplier * 0.5;
      const currentVisualTime = currentElapsed * currentSpeed + roundOffset;

      const newElapsed = currentVisualTime / speedMultiplier;
      startTimeRef.current = Date.now() - newElapsed;
    }

    // Fever durumunu güncelle
    prevFeverRef.current = isFeverActive;

    // SADECE ilk başlatmada startTime'ı sıfırla (eğer henüz başlamadıysa)
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
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
