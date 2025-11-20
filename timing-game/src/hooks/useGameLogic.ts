import { useState, useEffect, useRef, useCallback } from "react";
// 'import type' kullanarak import ediyoruz
import { calculateShotResult } from "../utils/calculateShotResult";
import { triggerWinConfetti } from "../utils/confetti";
import { playSound } from "../utils/sound";

type Player = "p1" | "p2";
type GameState = "idle" | "countdown" | "playing" | "finished";

// Bu tipi dışarı aktarıyoruz (export)
export interface VisualEffectData {
  type: "goal" | "post" | "miss" | "save";
  player: Player;
}

interface UseGameLogicProps {
  initialTime?: number;
  isBotMode?: boolean;
  botReactionTime?: number;
  botAccuracy?: number;
}

export const useGameLogic = ({
  initialTime = 120,
  isBotMode = false,
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
    p2: isBotMode ? "Bot" : "Oyuncu 2",
  });
  const [playerTimes, setPlayerTimes] = useState({
    p1: initialTime,
    p2: initialTime,
  });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const [highScore, setHighScore] = useState(() => {
    if (!isBotMode) return 0;
    const saved = localStorage.getItem("timing-game-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);

  // DÜZELTME: State artık nesne (VisualEffectData) tutuyor
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );

  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  const getCurrentPlayerName = useCallback(() => {
    return playerNames[currentPlayer];
  }, [currentPlayer, playerNames]);

  const togglePause = useCallback(() => {
    if (gameState !== "playing") return;
    setIsPaused((prev) => !prev);
  }, [gameState]);

  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else {
      if (pauseStartTimeRef.current > 0) {
        const pausedDuration = Date.now() - pauseStartTimeRef.current;
        startTimeRef.current += pausedDuration;
        pauseStartTimeRef.current = 0;
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  const finishGame = useCallback(() => {
    setGameState("finished");
    setIsPaused(false);
    playSound("whistle");

    setFinalScore(
      `Skor: ${playerNames.p1} [${scores.p1}] - [${scores.p2}] ${playerNames.p2}`
    );

    if (scores.p1 > scores.p2) {
      setWinner(`🏆 ${playerNames.p1} kazandı!`);
      triggerWinConfetti();
      if (isBotMode && scores.p1 > highScore) {
        setHighScore(scores.p1);
        localStorage.setItem("timing-game-highscore", scores.p1.toString());
      }
    } else if (scores.p2 > scores.p1) {
      setWinner(`🏆 ${playerNames.p2} kazandı!`);
    } else {
      setWinner("🤝 Berabere!");
    }
  }, [scores, isBotMode, highScore, playerNames]);

  const handleTurnSwitch = useCallback(() => {
    setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
    setTurnTimeLeft(10);
  }, []);

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

        const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
        setCurrentPlayer(startPlayer);
        const startName = playerNames[startPlayer];
        setActionMessage(`🎲 Yazı tura sonucu: ${startName} başlıyor!`);
      }
    }, 1000);
  }, [playerNames]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (startTimeRef.current === 0 || gameTimeMs === 0) {
      startTimeRef.current = Date.now() - gameTimeMs;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      setGameTimeMs(elapsed);

      if (elapsed >= 300000) finishGame();
    }, 10);

    return () => clearInterval(interval);
  }, [gameState, finishGame, isPaused]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));

      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        if (newTimes[currentPlayer] <= 0) return prev;
        newTimes[currentPlayer] -= 1;
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, currentPlayer, isPaused]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (turnTimeLeft === 0) {
      setActionMessage(`⏰ ${getCurrentPlayerName()} süresini doldurdu!`);
      playSound("miss");
      // DÜZELTME: Nesne olarak set ediliyor
      setVisualEffect({ type: "miss", player: currentPlayer });
      handleTurnSwitch();
    }

    if (playerTimes[currentPlayer] === 0) {
      finishGame();
    }
  }, [
    turnTimeLeft,
    playerTimes,
    currentPlayer,
    gameState,
    handleTurnSwitch,
    finishGame,
    getCurrentPlayerName,
    isPaused,
  ]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;
    if (isBotMode && currentPlayer === "p2") return;

    playSound("kick");

    const currentMs = gameTimeMs % 1000;
    const { result, message, isGoal } = calculateShotResult(currentMs);
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

    const playerName = getCurrentPlayerName();
    setActionMessage(`${playerName}: ${message} (${displayMs}ms)`);

    // DÜZELTME: Nesne olarak set ediliyor
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
    isBotMode,
    currentPlayer,
    gameTimeMs,
    handleTurnSwitch,
    getCurrentPlayerName,
    isPaused,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing" && !isPaused) {
          handleAction();
        }
      }
      if (e.code === "Escape" && gameState === "playing") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, gameState, isPaused, togglePause]);

  useEffect(() => {
    if (
      !isBotMode ||
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

      // DÜZELTME: Nesne olarak set ediliyor
      if (isSuccess) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: "p2" });
        setActionMessage(`🤖 ${playerNames.p2}: ${message} (${displayMs}ms)`);
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      } else {
        playSound("miss");
        if (result === "DİREK") setVisualEffect({ type: "post", player: "p2" });
        else setVisualEffect({ type: "miss", player: "p2" });

        if (isGoal) {
          setActionMessage(
            `🤖 ${playerNames.p2}: İnanılmaz! Net golü kaçırdı! (${displayMs}ms)`
          );
        } else {
          setActionMessage(`🤖 ${playerNames.p2}: ${message} (${displayMs}ms)`);
        }
      }

      handleTurnSwitch();
    }, botReactionTime);

    return () => clearTimeout(timer);
  }, [
    gameState,
    currentPlayer,
    isBotMode,
    botReactionTime,
    handleTurnSwitch,
    botAccuracy,
    playerNames,
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
  }, [initialTime]);

  return {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
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
