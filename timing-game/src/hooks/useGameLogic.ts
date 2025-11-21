import { useState, useEffect, useRef, useCallback } from "react";
import { calculateShotResult } from "../utils/calculateShotResult";
import { triggerWinConfetti } from "../utils/confetti";
import { playSound } from "../utils/sound";
import type { GameMode, GameState, Player, VisualEffectData } from "../types";

interface UseGameLogicProps {
  initialTime?: number;
  gameMode?: GameMode;
  botReactionTime?: number;
  botAccuracy?: number;
}

export const useGameLogic = ({
  initialTime = 120,
  gameMode = "classic",
  botReactionTime = 2000,
  botAccuracy = 0.5,
}: UseGameLogicProps = {}) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isPaused, setIsPaused] = useState(false);
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  const [playerTimes, setPlayerTimes] = useState({
    p1: initialTime,
    p2: initialTime,
  });

  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const getHighScoreKey = () => `timing-game-highscore-${gameMode}`;
  const [highScore, setHighScore] = useState(() => {
    if (gameMode === "classic") return 0;
    const saved = localStorage.getItem(getHighScoreKey());
    return saved ? parseInt(saved, 10) : 0;
  });

  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [streak, setStreak] = useState(0);

  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  const getCurrentPlayerName = useCallback(
    () => playerNames[currentPlayer],
    [currentPlayer, playerNames]
  );

  const togglePause = useCallback(() => {
    if (gameState !== "playing") return;
    setIsPaused((prev) => !prev);
  }, [gameState]);

  // Pause logic
  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else if (pauseStartTimeRef.current > 0) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      startTimeRef.current += pausedDuration;
      pauseStartTimeRef.current = 0;
    }
  }, [isPaused]);

  // Visual effect cleanup
  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  const updateHighScore = useCallback(
    (score: number) => {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(getHighScoreKey(), score.toString());
      }
    },
    [highScore, gameMode]
  );

  const finishGame = useCallback(() => {
    setGameState("finished");
    setIsPaused(false);
    playSound("whistle");

    if (gameMode === "survival") {
      setFinalScore(`Seri: ${streak} | En İyi: ${Math.max(streak, highScore)}`);
      setWinner("💀 OYUN BİTTİ");
      updateHighScore(streak);
    } else if (gameMode === "time_attack") {
      setFinalScore(`Toplam Gol: ${scores.p1}`);
      setWinner("⏱️ SÜRE DOLDU!");
      triggerWinConfetti();
      updateHighScore(scores.p1);
    } else {
      setFinalScore(
        `Skor: ${playerNames.p1} [${scores.p1}] - [${scores.p2}] ${playerNames.p2}`
      );
      if (scores.p1 > scores.p2) {
        setWinner(`🏆 ${playerNames.p1} kazandı!`);
        triggerWinConfetti();
        if (gameMode === "bot") updateHighScore(scores.p1);
      } else if (scores.p2 > scores.p1) {
        setWinner(`🏆 ${playerNames.p2} kazandı!`);
      } else {
        setWinner("🤝 Berabere!");
      }
    }
  }, [scores, gameMode, highScore, playerNames, streak, updateHighScore]);

  const handleTurnSwitch = useCallback(() => {
    if (gameMode === "survival" || gameMode === "time_attack") {
      setTurnTimeLeft(10);
    } else {
      setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      setTurnTimeLeft(10);
    }
  }, [gameMode]);

  const startGame = useCallback(() => {
    playSound("whistle");
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
        if (gameMode === "survival" || gameMode === "time_attack") {
          setCurrentPlayer("p1");
          setActionMessage("Başarılar!");
        } else {
          const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
          setCurrentPlayer(startPlayer);
          setActionMessage(`🎲 ${playerNames[startPlayer]} başlıyor!`);
        }
      }
    }, 1000);
  }, [playerNames, gameMode]);

  // Timers
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    if (startTimeRef.current === 0 || gameTimeMs === 0) {
      startTimeRef.current = Date.now() - gameTimeMs;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      setGameTimeMs(elapsed);
      if (gameMode !== "time_attack" && elapsed >= 300000) finishGame();
    }, 10);
    return () => clearInterval(interval);
  }, [gameState, finishGame, isPaused, gameMode]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));
      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        if (gameMode === "time_attack" || gameMode === "survival") {
          if (newTimes.p1 > 0) newTimes.p1 -= 1;
        } else {
          if (newTimes[currentPlayer] > 0) newTimes[currentPlayer] -= 1;
        }
        return newTimes;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentPlayer, isPaused, gameMode]);

  // Time checks
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    if (turnTimeLeft === 0) {
      if (gameMode === "survival") {
        setActionMessage("⏰ Süre doldu! Elendin.");
        finishGame();
      } else {
        setActionMessage(`⏰ ${getCurrentPlayerName()} süresini doldurdu!`);
        playSound("miss");
        setVisualEffect({ type: "miss", player: currentPlayer });
        handleTurnSwitch();
      }
    }
    if (gameMode === "time_attack" && playerTimes.p1 === 0) finishGame();
    else if (
      (gameMode === "classic" || gameMode === "bot") &&
      playerTimes[currentPlayer] === 0
    )
      finishGame();
  }, [
    turnTimeLeft,
    playerTimes,
    currentPlayer,
    gameState,
    handleTurnSwitch,
    finishGame,
    getCurrentPlayerName,
    isPaused,
    gameMode,
  ]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;

    playSound("kick");
    const currentMs = gameTimeMs % 1000;
    const { result, message, isGoal } = calculateShotResult(currentMs);
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

    if (gameMode === "survival") {
      if (isGoal) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        setStreak((s) => s + 1);
        setActionMessage(`🔥 SERİ: ${streak + 1} | ${message}`);
        handleTurnSwitch();
      } else {
        playSound("miss");
        setVisualEffect({ type: "miss", player: currentPlayer });
        setActionMessage(`❌ HATA! (${displayMs}ms) - ${message}`);
        finishGame();
      }
      return;
    }

    setActionMessage(`${getCurrentPlayerName()}: ${message} (${displayMs}ms)`);
    if (isGoal || result === "GOL") {
      playSound("goal");
      setVisualEffect({ type: "goal", player: currentPlayer });
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
    } else if (result === "DİREK") {
      playSound("miss");
      setVisualEffect({ type: "post", player: currentPlayer });
    } else {
      playSound("miss");
      setVisualEffect({ type: "miss", player: currentPlayer });
    }
    handleTurnSwitch();
  }, [
    gameState,
    gameMode,
    currentPlayer,
    gameTimeMs,
    handleTurnSwitch,
    getCurrentPlayerName,
    isPaused,
    streak,
    finishGame,
  ]);

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing" && !isPaused) handleAction();
      }
      if (e.code === "Escape" && gameState === "playing") togglePause();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, gameState, isPaused, togglePause]);

  // Bot AI
  useEffect(() => {
    if (
      gameMode !== "bot" ||
      gameState !== "playing" ||
      currentPlayer !== "p2" ||
      isPaused
    )
      return;
    const timer = setTimeout(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      let currentMs = elapsed % 1000;
      if (botAccuracy >= 0.9) currentMs = Math.floor(Math.random() * 40);
      else if (botAccuracy >= 0.7) currentMs = Math.floor(Math.random() * 150);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(currentMs);
      const isSuccess =
        result === "GOL" || (isGoal && Math.random() < botAccuracy);
      const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

      if (isSuccess) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: "p2" });
        setActionMessage(`🤖 Bot: ${message} (${displayMs}ms)`);
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      } else {
        playSound("miss");
        setVisualEffect({
          type: result === "DİREK" ? "post" : "miss",
          player: "p2",
        });
        setActionMessage(
          `🤖 Bot: ${isGoal ? "Golü kaçırdı!" : message} (${displayMs}ms)`
        );
      }
      handleTurnSwitch();
    }, botReactionTime);
    return () => clearTimeout(timer);
  }, [
    gameState,
    currentPlayer,
    gameMode,
    botReactionTime,
    handleTurnSwitch,
    botAccuracy,
    isPaused,
  ]);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setIsPaused(false);
    setGameTimeMs(0);
    startTimeRef.current = 0;
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: initialTime, p2: initialTime });
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);
    setStreak(0);
  }, [initialTime]);

  return {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
    streak,
    actionMessage,
    winner,
    finalScore,
    countdown,
    isPaused,
    togglePause,
    startGame,
    handleAction,
    restartGame,
    getCurrentPlayerName,
    setPlayerNames,
    playerNames,
    visualEffect,
  };
};
