import { useState, useEffect, useCallback } from "react";
import { useGameCore } from "../useGameCore";
import { calculateShotResult } from "../../utils/calculateShotResult";
import { triggerWinConfetti } from "../../utils/confetti";
import { playSound } from "../../utils/sound";
import type { GameVariant } from "../../types";

interface Props {
  initialTime: number;
}

export const useTimeAttackLogic = ({ initialTime }: Props) => {
  // Variant dinamik olduğu için kendi state'inde tutuyoruz
  const [activeVariant, setActiveVariant] = useState<GameVariant>("classic");

  const core = useGameCore(activeVariant);
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

  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [playerTimes, setPlayerTimes] = useState({ p1: initialTime, p2: 0 });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [multiplier, setMultiplier] = useState(1);
  const [goalCount, setGoalCount] = useState(0);

  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(
      "timing-game-highscore-time_attack-classic"
    );
    return saved ? parseInt(saved, 10) : 0;
  });

  // Idle'a dönünce reset
  useEffect(() => {
    if (gameState === "idle") {
      setPlayerTimes({ p1: initialTime, p2: 0 });
      setMultiplier(1);
      setGoalCount(0);
      setActiveVariant("classic");
    }
  }, [gameState, initialTime]);

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
    setWinner("⏱️ SÜRE DOLDU!");
    setFinalScore(`Toplam Puan: ${scores.p1} (Gol: ${goalCount})`);
    triggerWinConfetti();

    if (scores.p1 > highScore) {
      setHighScore(scores.p1);
      localStorage.setItem(
        "timing-game-highscore-time_attack-classic",
        scores.p1.toString()
      );
    }
  }, [scores, goalCount, highScore, setGameState, setIsPaused]);

  const handleTurnSwitch = useCallback(() => {
    setTurnTimeLeft(10);
    randomizeRound();
  }, [randomizeRound]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;
    if (playerTimes.p1 <= 0) return;

    playSound("kick");
    const currentMs = gameTimeMs % 1000;
    const distance = Math.abs(currentMs - targetOffset);
    const { result, message, isGoal } = calculateShotResult(distance);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");

    let timeChange = 0;
    let timeMsg = "";
    let currentMultiplier = multiplier;
    let points = 0;

    if (result === "GOL") {
      timeChange = 3;
      timeMsg = "🔥 +3 SN!";
      currentMultiplier += 1;
      points = 1 * currentMultiplier;

      const newGoalCount = goalCount + 1;
      setGoalCount(newGoalCount);

      if (newGoalCount % 5 === 0) {
        const variants: GameVariant[] = [
          "classic",
          "ghost",
          "unstable",
          "random",
          "moving",
        ];
        const availableVariants = variants.filter((v) => v !== activeVariant);
        const nextVariant =
          availableVariants[
            Math.floor(Math.random() * availableVariants.length)
          ];
        setActiveVariant(nextVariant);
        timeMsg = `⚡ MOD DEĞİŞTİ: ${nextVariant.toUpperCase()}!`;
      }
    } else {
      currentMultiplier = 1;
      if (result === "OFSAYT") {
        timeChange = -3;
        timeMsg = "⚠️ -3 SN!";
      }
    }

    setMultiplier(currentMultiplier);
    setScores((s) => ({ ...s, p1: s.p1 + points }));

    if (timeChange !== 0) {
      setPlayerTimes((prev) => ({
        ...prev,
        p1: Math.max(0, prev.p1 + timeChange),
      }));
    }

    if (isGoal || result === "GOL") {
      playSound("goal");
      setVisualEffect({ type: "goal", player: "p1" });
      const comboMsg =
        currentMultiplier > 1 ? `| x${currentMultiplier} KOMBO!` : "";
      setActionMessage(`${timeMsg} ${comboMsg} (${displayMs}ms)`);
    } else {
      playSound("miss");
      setVisualEffect({
        type: result === "DİREK" ? "post" : "miss",
        player: "p1",
      });
      setActionMessage(`${timeMsg} ${message} (${displayMs}ms)`);
    }
    handleTurnSwitch();
  }, [
    gameState,
    isPaused,
    playerTimes,
    gameTimeMs,
    targetOffset,
    multiplier,
    goalCount,
    activeVariant,
    handleTurnSwitch,
    setVisualEffect,
  ]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (playerTimes.p1 <= 0) {
      finishGame();
      return;
    }

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          handleTurnSwitch();
          return 10;
        }
        return prev - 1;
      });
      setPlayerTimes((prev) => ({ ...prev, p1: Math.max(0, prev.p1 - 1) }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isPaused, playerTimes.p1, finishGame, handleTurnSwitch]);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setIsPaused(false);
    startTimeRef.current = 0;
    setScores({ p1: 0, p2: 0 });
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);
  }, [setGameState, setIsPaused, setVisualEffect, startTimeRef]);

  return {
    ...core,
    turnTimeLeft,
    playerTimes,
    scores,
    highScore,
    actionMessage,
    winner,
    finalScore,
    startGame,
    handleAction,
    restartGame,
    streak: 0,
    multiplier,
    gameVariant: activeVariant,
    currentPlayer: "p1",
    playerNames: { p1: "Oyuncu 1", p2: "" },
    setPlayerNames: () => {},
    getCurrentPlayerName: () => "Oyuncu 1",
  };
};
