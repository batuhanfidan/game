import { useState, useEffect, useCallback, useRef } from "react";
import { calculateShotResult } from "../shared/utils/calculateShotResult";
import { triggerWinConfetti } from "../shared/utils/confetti";
import { playSound } from "../shared/utils/sound";
import { GAMEPLAY_CONSTANTS } from "../shared/constants/game";
import type {
  GameMode,
  GameVariant,
  VisualEffectData,
  TimeChangePopup,
  SoundType,
} from "../shared/types";

// Core Hooks
import { useGameState } from "./core/useGameState";
import { useGameTimer } from "./core/useGameTimer";
import { usePlayerSystem } from "./core/usePlayerSystem";
import { useScoring } from "./core/useScoring";
import { useInterval } from "./core/useInterval";

// Mode Hooks
import { useSurvivalSystem } from "./modes/useSurvivalSystem";
import { useTimeAttackSystem } from "./modes/useTimeAttackSystem";
import { useBotSystem } from "./modes/useBotSystem";

interface UseGameLogicProps {
  initialTime?: number;
  gameMode?: GameMode;
  gameVariant?: GameVariant;
  botReactionTime?: number;
  botAccuracy?: number;
}

export const useGameLogic = ({
  initialTime = 60,
  gameMode = "classic",
  gameVariant = "classic",
  botReactionTime = 2000,
  botAccuracy = 0.5,
}: UseGameLogicProps = {}) => {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { gameState, setGameState } = useGameState("idle");
  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [targetOffset, setTargetOffset] = useState(0);
  const [roundOffset, setRoundOffset] = useState(0);
  const [timeChangePopup, setTimeChangePopup] =
    useState<TimeChangePopup | null>(null);

  const playSoundSafe = useCallback((sound: SoundType) => playSound(sound), []);

  const survival = useSurvivalSystem(() => playSoundSafe("whistle"));
  const timeAttack = useTimeAttackSystem();

  const {
    spawnBoss: timeAttackSpawnBoss,
    handleTimeAttackShot,
    resetSystem: resetTimeAttack,
    isFever: timeFeverActive,
    targetWidth,
    isBossActive,
    bossPosition,
  } = timeAttack;

  const {
    streak: survivalStreak,
    lives: survivalLives,
    setLives: setSurvivalLives,
    speedMultiplier,
    isFeverActive: isSurvivalFever,
    activeCurse,
    resetSurvivalState,
    handleSurvivalShot,
    GOLDEN_THRESHOLD,
  } = survival;

  const timer = useGameTimer({
    gameState,
    setGameState,
    gameVariant,
    roundOffset,
    speedMultiplier,
    isFeverActive: isSurvivalFever,
    activeCurse,
    onGameStart: () => handleGameStartLogic(),
    onUpdate: () => {
      if (activeCurse === "MOVING_TARGET") {
        const now = Date.now();
        setTargetOffset(500 + 350 * Math.sin(now / 500));
      }
    },
  });

  const {
    currentPlayer,
    setCurrentPlayer,
    playerNames,
    setPlayerNames,
    switchTurn,
    resetPlayers,
    turnTimeLeft,
    setTurnTimeLeft,
    playerTimes,
    setPlayerTimes,
    isSharedTimeMode,
    currentPlayerRef,
  } = usePlayerSystem(initialTime, gameMode);

  const { scores, setScores, highScore, updateHighScore, resetScores } =
    useScoring(gameMode, gameVariant);

  const randomizeRound = useCallback(() => {
    if (gameMode === "time_attack") {
      const nextTarget = Math.floor(Math.random() * 800) + 100;
      setTargetOffset(nextTarget);
      timeAttackSpawnBoss(nextTarget);
      return;
    }
    if (gameVariant === "random")
      setRoundOffset(Math.floor(Math.random() * 800));
    else setRoundOffset(0);
    if (gameVariant === "moving")
      setTargetOffset(Math.floor(Math.random() * 800) + 100);
    else setTargetOffset(0);
  }, [gameVariant, gameMode, timeAttackSpawnBoss]);

  const handleGameStartLogic = useCallback(() => {
    if (gameMode === "survival" || gameMode === "time_attack") {
      setCurrentPlayer("p1");
      setActionMessage("Başarılar!");
    } else {
      const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
      setCurrentPlayer(startPlayer);
      setActionMessage(`🎲 ${playerNames[startPlayer]} başlıyor!`);
    }
    randomizeRound();
  }, [gameMode, playerNames, randomizeRound, setCurrentPlayer]);

  const handleTurnSwitch = useCallback(() => {
    if (!isMounted.current) return;
    switchTurn();
    randomizeRound();
  }, [switchTurn, randomizeRound]);

  const resetGame = useCallback(() => {
    timer.resetTimer();
    resetPlayers();
    resetScores();
    setGameState("idle");
    setTargetOffset(0);
    setActionMessage("");
    setVisualEffect(null);
    setWinner("");
    setFinalScore("");
    setTimeChangePopup(null);
    resetSurvivalState();
    resetTimeAttack();
  }, [
    timer,
    resetPlayers,
    resetScores,
    resetSurvivalState,
    resetTimeAttack,
    setGameState,
  ]);

  const finishGame = useCallback(() => {
    if (!isMounted.current) return;
    setGameState("finished");
    timer.setIsPaused(false);
    playSoundSafe("whistle");

    if (gameMode === "survival") {
      setFinalScore(
        `Seri: ${survivalStreak} | En İyi: ${Math.max(
          survivalStreak,
          highScore
        )}`
      );
      setWinner("💀 OYUN BİTTİ");
      updateHighScore(survivalStreak);
    } else if (gameMode === "time_attack") {
      setFinalScore(`Toplam Puan: ${scores.p1}`);
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
  }, [
    gameMode,
    survivalStreak,
    highScore,
    scores,
    playerNames,
    updateHighScore,
    setGameState,
    timer,
    playSoundSafe,
  ]);

  useInterval(
    () => {
      setTurnTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        const p = currentPlayerRef.current;
        if (gameMode === "time_attack" || gameMode === "survival") {
          if (newTimes.p1 > 0) newTimes.p1 -= 1;
        } else {
          if (newTimes[p] > 0) newTimes[p] -= 1;
        }
        return newTimes;
      });
    },
    gameState === "playing" &&
      !timer.isPaused &&
      !(gameMode === "time_attack" && timeFeverActive)
      ? 1000
      : null
  );

  useEffect(() => {
    if (gameState !== "playing" || timer.isPaused) return;
    if (isSharedTimeMode && timer.gameTimeMs >= initialTime * 1000) {
      finishGame();
      return;
    }
    if (gameMode === "time_attack" && playerTimes.p1 === 0) {
      finishGame();
    }
    if (turnTimeLeft === 0) {
      if (gameMode === "survival") {
        if (survivalLives > 1) {
          setSurvivalLives((l) => l - 1);
          setActionMessage("⏰ SÜRE DOLDU! (-1 Can)");
          setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
        } else {
          setActionMessage("⏰ SÜRE DOLDU! Elendin.");
          finishGame();
        }
      } else if (gameMode !== "time_attack") {
        setActionMessage(`${playerNames[currentPlayer]} süresini doldurdu!`);
        playSoundSafe("miss");
        if (isMounted.current)
          setVisualEffect({ type: "miss", player: currentPlayer });
        handleTurnSwitch();
      }
    }
  }, [
    turnTimeLeft,
    playerTimes,
    timer.gameTimeMs,
    gameState,
    timer.isPaused,
    gameMode,
    initialTime,
    isSharedTimeMode,
    survivalLives,
    handleTurnSwitch,
    finishGame,
    playerNames,
    currentPlayer,
    setSurvivalLives,
    setTurnTimeLeft,
    playSoundSafe,
  ]);

  useEffect(() => {
    if (visualEffect) {
      const t = setTimeout(() => {
        if (isMounted.current) setVisualEffect(null);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [visualEffect]);

  useEffect(() => {
    if (timeChangePopup) {
      const t = setTimeout(() => {
        if (isMounted.current) setTimeChangePopup(null);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [timeChangePopup]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || timer.isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;

    if (
      (gameMode === "classic" || gameMode === "bot") &&
      playerTimes[currentPlayer] <= 0
    ) {
      playSoundSafe("miss");
      setActionMessage("⏰ Süren bitti! Sıra karşı oyuncuda.");
      return;
    }

    playSoundSafe("kick");
    const currentMs = timer.gameTimeMs % 1000;

    if (gameMode === "time_attack") {
      handleTimeAttackShot(currentMs, targetOffset, {
        setActionMessage,
        setScores,
        setPlayerTimes,
        setTimeChangePopup,
        setVisualEffect,
        playSound: playSoundSafe,
        triggerWinConfetti,
        handleTurnSwitch,
        currentPlayer,
      });
      return;
    }

    if (gameMode === "survival") {
      handleSurvivalShot(currentMs, targetOffset, {
        playSound: playSoundSafe,
        setVisualEffect,
        setActionMessage,
        finishGame,
        setTurnTimeLeft,
        setTargetOffset,
        currentPlayer,
      });
      return;
    }

    const distance = Math.abs(currentMs - targetOffset);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");
    const { result, message, isGoal } = calculateShotResult(distance);
    setActionMessage(
      `${playerNames[currentPlayer]}: ${message} (${displayMs}ms)`
    );

    if (isGoal || result === "GOL") {
      playSoundSafe("goal");
      setVisualEffect({ type: "goal", player: currentPlayer });
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
    } else if (result === "DİREK") {
      playSoundSafe("miss");
      setVisualEffect({ type: "post", player: currentPlayer });
    } else {
      playSoundSafe("miss");
      setVisualEffect({ type: "miss", player: currentPlayer });
    }
    handleTurnSwitch();
  }, [
    gameState,
    timer.isPaused,
    timer.gameTimeMs,
    gameMode,
    currentPlayer,
    playerTimes,
    playSoundSafe,
    targetOffset,
    playerNames,
    handleTurnSwitch,
    handleTimeAttackShot,
    setScores,
    setPlayerTimes,
    handleSurvivalShot,
    finishGame,
    setTurnTimeLeft,
  ]);

  useBotSystem({
    gameMode,
    gameState,
    currentPlayer,
    isPaused: timer.isPaused,
    playerTimes,
    botReactionTime,
    botAccuracy,
    handleTurnSwitch,
    setScores,
    setVisualEffect,
    setActionMessage,
  });

  return {
    gameState,
    gameTimeMs: timer.gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
    actionMessage,
    winner,
    finalScore,
    countdown: timer.countdown,
    startGame: timer.startGame,
    handleAction,
    restartGame: resetGame,
    isPaused: timer.isPaused,
    togglePause: timer.togglePause,
    visualEffect,
    targetOffset,
    getCurrentPlayerName: () => playerNames[currentPlayer],
    setPlayerNames,
    playerNames,
    ...survival,
    ...timeAttack,
    timeTargetWidth: targetWidth,
    timeBossActive: isBossActive,
    timeBossPosition: bossPosition,
    isTimeAttackFever: timeFeverActive,
    timeChangePopup,
    isSurvivalFever: isSurvivalFever,
    goldenThreshold: GOLDEN_THRESHOLD,
  };
};
