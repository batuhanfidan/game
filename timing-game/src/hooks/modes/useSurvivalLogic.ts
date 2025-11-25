import { useState, useEffect, useCallback } from "react";
import { useGameCore } from "../useGameCore";
import { calculateShotResult } from "../../utils/calculateShotResult";
import { playSound } from "../../utils/sound";

export const useSurvivalLogic = () => {
  const core = useGameCore("classic");
  const {
    gameState,
    setGameState,
    gameTimeMs,
    isPaused,
    setVisualEffect,
    startTimeRef,
    setCountdown,
    setIsPaused,
    randomizeRound,
    targetOffset,
  } = core;

  // ... geri kalan kod aynı
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [streak, setStreak] = useState(0);
  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(
      "timing-game-highscore-survival-classic"
    );
    return saved ? parseInt(saved, 10) : 0;
  });

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
        setActionMessage("Başarılar!");
        randomizeRound();
      }
    }, 1000);
  }, [setCountdown, setIsPaused, setGameState, startTimeRef, randomizeRound]);

  const finishGame = useCallback(() => {
    setGameState("finished");
    setIsPaused(false);
    playSound("whistle");
    setWinner("💀 OYUN BİTTİ");
    setFinalScore(`Seri: ${streak} | En İyi: ${Math.max(streak, highScore)}`);

    if (streak > highScore) {
      setHighScore(streak);
      localStorage.setItem(
        "timing-game-highscore-survival-classic",
        streak.toString()
      );
    }
  }, [streak, highScore, setGameState, setIsPaused]);

  const handleTurnSwitch = useCallback(() => {
    setTurnTimeLeft(10);
    randomizeRound();
  }, [randomizeRound]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;

    playSound("kick");
    const currentMs = gameTimeMs % 1000;
    const distance = Math.abs(currentMs - targetOffset);
    const { message, isGoal } = calculateShotResult(distance);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");

    if (isGoal) {
      playSound("goal");
      setVisualEffect({ type: "goal", player: "p1" });
      setStreak((s) => s + 1);
      setActionMessage(`🔥 SERİ: ${streak + 1} | ${message}`);
      handleTurnSwitch();
    } else {
      playSound("miss");
      setVisualEffect({ type: "miss", player: "p1" });
      setActionMessage(`❌ HATA! (${displayMs}ms) - ${message}`);
      finishGame();
    }
  }, [
    gameState,
    isPaused,
    gameTimeMs,
    targetOffset,
    streak,
    handleTurnSwitch,
    finishGame,
    setVisualEffect,
  ]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          setActionMessage("⏰ Süre doldu! Elendin.");
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, isPaused, finishGame]);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setIsPaused(false);
    startTimeRef.current = 0;
    setStreak(0);
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);
  }, [setGameState, setIsPaused, startTimeRef, setVisualEffect]);

  return {
    ...core,
    turnTimeLeft,
    streak,
    highScore,
    actionMessage,
    winner,
    finalScore,
    startGame,
    handleAction,
    restartGame,
    currentPlayer: "p1",
    playerTimes: { p1: 0, p2: 0 },
    scores: { p1: 0, p2: 0 },
    playerNames: { p1: "Oyuncu 1", p2: "Bot" },
    setPlayerNames: () => {},
    getCurrentPlayerName: () => "Oyuncu 1",
    multiplier: 1,
    gameVariant: "classic" as const,
  };
};
