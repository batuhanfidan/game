import { useState, useRef, useEffect, useCallback } from "react";
import type { GameVariant } from "../../types";

interface UseGameTimerProps {
  variant: GameVariant;
  onTimeLimitReached?: () => void;
}

export const useGameTimer = ({
  variant,
  onTimeLimitReached,
}: UseGameTimerProps) => {
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Dengesiz mod için zaman bozulma haritası
  const distortTime = (realElapsed: number) => {
    if (variant !== "unstable") return realElapsed;
    // 300-700 arası 2x hızlansın
    if (realElapsed < 300) return realElapsed;
    if (realElapsed < 500) return 300 + (realElapsed - 300) * 2.5;
    return 800 + (realElapsed - 500) * 0.8; // Sonra yavaşlasın
  };

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    // Rastgele Başlangıç: 0 ile 600ms arasında bir yerden başla
    const startOffset =
      variant === "random_start" ? Math.floor(Math.random() * 600) : 0;

    startTimeRef.current = Date.now() - startOffset;
    setIsRunning(true);
  }, [variant]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setGameTimeMs(0);
    cancelAnimationFrame(animationFrameRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const update = () => {
      const now = Date.now();
      const realElapsed = now - startTimeRef.current;
      const displayTime = distortTime(realElapsed); // Zamanı bük

      setGameTimeMs(displayTime);

      // Süre sınırı (örn: 1500ms'yi geçerse ofsayt/bitiş)
      if (displayTime > 1500 && onTimeLimitReached) {
        onTimeLimitReached();
      } else {
        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isRunning, variant, onTimeLimitReached]);

  return { gameTimeMs, startTimer, stopTimer, resetTimer, isRunning };
};
