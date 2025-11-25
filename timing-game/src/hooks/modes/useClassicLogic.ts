import { useState, useEffect, useCallback } from "react";
import { useGameCore } from "../useGameCore";
import { calculateShotResult } from "../../utils/calculateShotResult";
import { triggerWinConfetti } from "../../utils/confetti";
import { playSound } from "../../utils/sound";
import type { GameVariant, Player } from "../../types";

interface Props {
  initialTime: number;
  gameMode: "classic" | "bot";
  gameVariant: GameVariant;
  botReactionTime?: number; // Opsiyonel yapıldı
  botAccuracy?: number; // Opsiyonel yapıldı
}

export const useClassicLogic = ({
  initialTime,
  gameMode,
  gameVariant,
  botReactionTime = 2000, // Varsayılan değer
  botAccuracy = 0.5, // Varsayılan değer
}: Props) => {
  const core = useGameCore(gameVariant);
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
    setTargetOffset,
    setGameTimeMs,
  } = core;

  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");

  const [highScore, setHighScore] = useState(() => {
    if (gameMode === "classic") return 0;
    const saved = localStorage.getItem(
      `timing-game-highscore-bot-${gameVariant}`
    );
    return saved ? parseInt(saved, 10) : 0;
  });

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  const startDuration = Math.ceil(initialTime / 2);
  const [playerTimes, setPlayerTimes] = useState({
    p1: startDuration,
    p2: startDuration,
  });

  // Helper fonksiyon eklendi
  const getCurrentPlayerName = useCallback(
    () => playerNames[currentPlayer],
    [currentPlayer, playerNames]
  );

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

        const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
        setCurrentPlayer(startPlayer);
        setActionMessage(`🎲 ${playerNames[startPlayer]} başlıyor!`);
        randomizeRound();
      }
    }, 1000);
  }, [
    playerNames,
    randomizeRound,
    setCountdown,
    setIsPaused,
    setGameState,
    startTimeRef,
  ]);

  const handleTurnSwitch = useCallback(() => {
    setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
    setTurnTimeLeft(10);
    randomizeRound();
  }, [randomizeRound]);

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
      if (gameMode === "bot" && scores.p1 > highScore) {
        setHighScore(scores.p1);
        localStorage.setItem(
          `timing-game-highscore-bot-${gameVariant}`,
          scores.p1.toString()
        );
      }
    } else if (scores.p2 > scores.p1) {
      setWinner(`🏆 ${playerNames.p2} kazandı!`);
    } else {
      setWinner("🤝 Berabere!");
    }
  }, [
    scores,
    playerNames,
    gameMode,
    gameVariant,
    highScore,
    setGameState,
    setIsPaused,
  ]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;
    if (playerTimes[currentPlayer] <= 0) return;

    playSound("kick");
    const currentMs = gameTimeMs % 1000;
    const distance = Math.abs(currentMs - targetOffset);
    const { result, message, isGoal } = calculateShotResult(distance);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");

    setActionMessage(
      `${playerNames[currentPlayer]}: ${message} (${displayMs}ms)`
    );

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
    isPaused,
    gameMode,
    currentPlayer,
    playerTimes,
    gameTimeMs,
    targetOffset,
    playerNames,
    handleTurnSwitch,
    setVisualEffect,
  ]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (gameTimeMs >= initialTime * 1000) {
      finishGame();
      return;
    }

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          setActionMessage(
            `⏰ ${playerNames[currentPlayer]} süresini doldurdu!`
          );
          playSound("miss");
          setVisualEffect({ type: "miss", player: currentPlayer });
          handleTurnSwitch();
          return 10;
        }
        return prev - 1;
      });

      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        if (newTimes[currentPlayer] > 0) newTimes[currentPlayer] -= 1;
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState,
    isPaused,
    currentPlayer,
    gameTimeMs,
    initialTime,
    finishGame,
    handleTurnSwitch,
    playerNames,
    setVisualEffect,
  ]);

  useEffect(() => {
    if (
      gameMode !== "bot" ||
      gameState !== "playing" ||
      currentPlayer !== "p2" ||
      isPaused
    )
      return;
    if (playerTimes.p2 <= 0) return;

    const timer = setTimeout(() => {
      let error = 0;
      if (botAccuracy >= 0.9) error = Math.floor(Math.random() * 10);
      else if (botAccuracy >= 0.7) error = Math.floor(Math.random() * 50);
      else error = Math.floor(Math.random() * 300);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(error);
      const displayMs = String(Math.floor(error / 10)).padStart(2, "0");
      const isSuccess =
        result === "GOL" || (isGoal && Math.random() < botAccuracy);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, currentPlayer, isPaused]);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setIsPaused(false);
    startTimeRef.current = 0;
    setTargetOffset(0);
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: startDuration, p2: startDuration });
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);
    setGameTimeMs(0);
  }, [
    startDuration,
    setGameState,
    setIsPaused,
    setTargetOffset,
    startTimeRef,
    setVisualEffect,
    setGameTimeMs,
  ]);

  return {
    ...core,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
    actionMessage,
    winner,
    finalScore,
    startGame,
    handleAction,
    restartGame,
    playerNames,
    setPlayerNames,
    getCurrentPlayerName, // EKLENDİ
    streak: 0,
    multiplier: 1,
    gameVariant,
  };
};
