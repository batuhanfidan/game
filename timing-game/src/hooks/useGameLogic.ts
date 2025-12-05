import { useState, useEffect, useCallback, useRef } from "react";
import { calculateShotResult } from "../shared/utils/calculateShotResult";
import { playSound } from "../shared/utils/sound";
import { GAMEPLAY_CONSTANTS, GAME_DELAYS } from "../shared/constants/game";
import type {
  GameMode,
  GameVariant,
  VisualEffectData,
  TimeChangePopup,
  SoundType,
  ActionMessage,
} from "../shared/types";

import { CheckCircle, XCircle, Goal, AlertCircle } from "lucide-react";

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

  const [actionMessage, setActionMessage] = useState<ActionMessage>({
    text: "",
  });

  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [targetOffset, setTargetOffset] = useState(0);
  const [roundOffset, setRoundOffset] = useState(0);
  const [timeChangePopup, setTimeChangePopup] =
    useState<TimeChangePopup | null>(null);

  const [showHint, setShowHint] = useState(false);

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
      setActionMessage({
        text: "Başarılar!",
        icon: CheckCircle,
        className: "text-white",
      });
    } else {
      const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
      setCurrentPlayer(startPlayer);
      setActionMessage({
        text: `${playerNames[startPlayer]} başlıyor!`,
        icon: AlertCircle,
        className: "text-blue-400",
      });
    }
    randomizeRound();
  }, [gameMode, playerNames, randomizeRound, setCurrentPlayer]);

  const handleTimerUpdate = useCallback(() => {
    if (activeCurse === "MOVING_TARGET") {
      const now = Date.now();
      setTargetOffset(500 + 350 * Math.sin(now / 500));
    }
  }, [activeCurse]);

  const timer = useGameTimer({
    gameState,
    setGameState,
    gameVariant,
    roundOffset,
    speedMultiplier,
    isFeverActive: isSurvivalFever,
    activeCurse,
    onGameStart: handleGameStartLogic,
    onUpdate: handleTimerUpdate,
  });

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
    setActionMessage({ text: "" });
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
      updateHighScore(scores.p1);
    } else {
      setFinalScore(
        `Skor: ${playerNames.p1} [${scores.p1}] - [${scores.p2}] ${playerNames.p2}`
      );
      if (scores.p1 > scores.p2) {
        setWinner(`🏆 ${playerNames.p1} kazandı!`);
        if (gameMode === "bot") updateHighScore(scores.p1);
      } else if (scores.p2 > scores.p1) {
        setWinner(`🏆 ${playerNames.p2} kazandı!`);
      } else {
        setWinner("🤝 Berabere!");
      }
    }

    // Oyun sayısını artır
    const currentCount = parseInt(
      localStorage.getItem("games_played_count") || "0"
    );
    localStorage.setItem("games_played_count", (currentCount + 1).toString());
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
          // İkonlu mesaj
          setActionMessage({
            text: "SÜRE DOLDU! (-1 Can)",
            icon: AlertCircle,
            className: "text-red-500 font-bold",
          });
          setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
        } else {
          setActionMessage({
            text: "SÜRE DOLDU! Elendin.",
            icon: XCircle,
            className: "text-red-600 font-black",
          });
          finishGame();
        }
      } else if (gameMode !== "time_attack") {
        setActionMessage({
          text: `${playerNames[currentPlayer]} süresini doldurdu!`,
          icon: XCircle,
          className: "text-gray-400",
        });
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

  // Hint mantığı
  useEffect(() => {
    const gamesPlayed = parseInt(
      localStorage.getItem("games_played_count") || "0"
    );
    if (gamesPlayed < 25) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  }, [gameMode]);

  useEffect(() => {
    if (visualEffect) {
      const t = setTimeout(() => {
        if (isMounted.current) setVisualEffect(null);
      }, GAME_DELAYS.EFFECT_DISPLAY_DURATION);
      return () => clearTimeout(t);
    }
  }, [visualEffect]);
  useEffect(() => {
    if (timeChangePopup) {
      const t = setTimeout(() => {
        if (isMounted.current) setTimeChangePopup(null);
      }, GAME_DELAYS.POPUP_FADE_DURATION);
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
      setActionMessage({
        text: "Süren bitti! Sıra karşı oyuncuda.",
        icon: AlertCircle,
        className: "text-red-400",
      });
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

    // Klasik Mod Mantığı
    const distance = Math.abs(currentMs - targetOffset);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");
    const { result, message, isGoal } = calculateShotResult(distance);

    // Mesaj objesi oluştur
    setActionMessage({
      text: `${playerNames[currentPlayer]}: ${message} (${displayMs}ms)`,
      icon: isGoal ? CheckCircle : result === "DİREK" ? Goal : XCircle,
      className: isGoal
        ? "text-green-400"
        : result === "DİREK"
        ? "text-orange-400"
        : "text-red-400",
    });

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
    showHint,
  };
};
