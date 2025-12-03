import { useState, useEffect, useCallback, useRef } from "react";
import { calculateShotResult } from "../utils/calculateShotResult";
import { triggerWinConfetti } from "../utils/confetti";
import { playSound } from "../utils/sound";
import { SURVIVAL_CONSTANTS, GAMEPLAY_CONSTANTS } from "../utils/constants";
import type {
  GameMode,
  GameState,
  Player,
  VisualEffectData,
  GameVariant,
} from "../types";

import { useSurvivalSystem } from "./useSurvivalSystem";
import { useGameTimer } from "./useGameTimer";
import { useBotSystem } from "./useBotSystem";
import { useTimeAttackSystem } from "./useTimeAttackSystem";
import { useInterval } from "./useInterval";
import type { CurseType } from "./useSurvivalSystem";

interface UseGameLogicProps {
  initialTime?: number;
  gameMode?: GameMode;
  gameVariant?: GameVariant;
  botReactionTime?: number;
  botAccuracy?: number;
}

interface TimeChangePopup {
  id: number;
  value: number;
  type: "positive" | "negative";
}

export const useGameLogic = ({
  initialTime = 60,
  gameMode = "classic",
  gameVariant = "classic",
  botReactionTime = 2000,
  botAccuracy = 0.5,
}: UseGameLogicProps = {}) => {
  // MEMORY LEAK GUARD
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(
    GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const currentPlayerRef = useRef<Player>(currentPlayer);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const [targetOffset, setTargetOffset] = useState(0);
  const [roundOffset, setRoundOffset] = useState(0);

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [timeChangePopup, setTimeChangePopup] =
    useState<TimeChangePopup | null>(null);

  // --- ALT SİSTEMLER ---
  const survival = useSurvivalSystem();
  const timeAttack = useTimeAttackSystem();

  const {
    spawnBoss,
    processHit,
    isFever: timeFeverActive,
    combo,
    multiplier,
    targetWidth,
    bossActive,
    bossPosition,
  } = timeAttack;

  const randomizeRound = useCallback(() => {
    if (gameMode === "time_attack") {
      const nextTarget = Math.floor(Math.random() * 800) + 100;
      setTargetOffset(nextTarget);
      spawnBoss(nextTarget);
      return;
    }

    if (gameVariant === "random") {
      setRoundOffset(Math.floor(Math.random() * 800));
    } else {
      setRoundOffset(0);
    }

    if (gameVariant === "moving") {
      setTargetOffset(Math.floor(Math.random() * 800) + 100);
    } else {
      setTargetOffset(0);
    }
  }, [gameVariant, gameMode, spawnBoss]);

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
  }, [gameMode, playerNames, randomizeRound]);

  const handleTimerUpdate = useCallback(() => {
    if (survival.activeCurse === "MOVING_TARGET") {
      const now = Date.now();
      const newTarget = 500 + 350 * Math.sin(now / 500);
      setTargetOffset(newTarget);
    }
  }, [survival.activeCurse]);

  const timer = useGameTimer({
    gameState,
    setGameState,
    gameVariant,
    roundOffset,
    speedMultiplier: survival.speedMultiplier,
    isFeverActive: survival.isFeverActive,
    activeCurse: survival.activeCurse,
    onGameStart: handleGameStartLogic,
    onUpdate: handleTimerUpdate,
  });

  const getHighScoreKey = useCallback(
    () => `timing-game-highscore-${gameMode}-${gameVariant}`,
    [gameMode, gameVariant]
  );

  const [highScore, setHighScore] = useState(() => {
    if (gameMode === "classic" && gameVariant === "classic") return 0;
    try {
      const saved = localStorage.getItem(getHighScoreKey());
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const updateHighScore = useCallback(
    (score: number) => {
      setHighScore((prevHighScore) => {
        if (score > prevHighScore) {
          localStorage.setItem(getHighScoreKey(), score.toString());
          return score;
        }
        return prevHighScore;
      });
    },
    [getHighScoreKey]
  );

  const isSharedTimeMode = gameMode === "classic" || gameMode === "bot";
  const startDuration = isSharedTimeMode
    ? Math.ceil(initialTime / 2)
    : initialTime;

  const [playerTimes, setPlayerTimes] = useState({
    p1: startDuration,
    p2: startDuration,
  });

  useEffect(() => {
    if (gameState === "idle") {
      setPlayerTimes({ p1: startDuration, p2: startDuration });
    }
  }, [startDuration, gameState]);

  const resetGame = useCallback(() => {
    timer.resetTimer();
    setGameState("idle");
    setTargetOffset(0);
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: startDuration, p2: startDuration });
    setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    setActionMessage("");
    setVisualEffect(null);
    setTimeChangePopup(null);

    survival.resetSurvivalState();
    timeAttack.resetSystem();
  }, [startDuration, timer, survival, timeAttack]);

  const finishGame = useCallback(() => {
    setGameState("finished");
    timer.setIsPaused(false);
    playSound("whistle");

    if (gameMode === "survival") {
      setFinalScore(
        `Seri: ${survival.streak} | En İyi: ${Math.max(
          survival.streak,
          highScore
        )}`
      );
      setWinner("💀 OYUN BİTTİ");
      updateHighScore(survival.streak);
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
    scores,
    gameMode,
    highScore,
    playerNames,
    updateHighScore,
    timer,
    survival.streak,
  ]);

  const handleTurnSwitch = useCallback(() => {
    if (gameMode === "survival" || gameMode === "time_attack") {
      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    } else {
      setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    }
    randomizeRound();
  }, [gameMode, randomizeRound]);

  useInterval(
    () => {
      setTurnTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));

      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        const player = currentPlayerRef.current;
        if (gameMode === "time_attack" || gameMode === "survival") {
          if (newTimes.p1 > 0) newTimes.p1 -= 1;
        } else {
          if (newTimes[player] > 0) newTimes[player] -= 1;
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

    if (turnTimeLeft === 0) {
      if (gameMode === "survival") {
        if (survival.lives > 1) {
          survival.setLives((l) => l - 1);
          setActionMessage("⏰ SÜRE DOLDU! (-1 Can)");
          setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
        } else {
          setActionMessage("⏰ SÜRE DOLDU! Elendin.");
          finishGame();
        }
      } else if (gameMode !== "time_attack") {
        setActionMessage(`${playerNames[currentPlayer]} süresini doldurdu!`);
        playSound("miss");
        if (isMounted.current)
          setVisualEffect({ type: "miss", player: currentPlayer });
        handleTurnSwitch();
      }
    }

    if (gameMode === "time_attack" && playerTimes.p1 === 0) {
      finishGame();
    }
  }, [
    turnTimeLeft,
    playerTimes,
    currentPlayer,
    gameState,
    timer.isPaused,
    timer.gameTimeMs,
    gameMode,
    initialTime,
    isSharedTimeMode,
    survival.lives,
    handleTurnSwitch,
    finishGame,
    playerNames,
    survival,
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

  const getCurrentPlayerName = useCallback(
    () => playerNames[currentPlayer],
    [currentPlayer, playerNames]
  );

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || timer.isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;

    if (
      (gameMode === "classic" || gameMode === "bot") &&
      playerTimes[currentPlayer] <= 0
    ) {
      playSound("miss");
      setActionMessage("⏰ Süren bitti! Sıra karşı oyuncuda.");
      return;
    }

    playSound("kick");
    const currentMs = timer.gameTimeMs % 1000;

    if (gameMode === "time_attack") {
      const result = processHit(currentMs, targetOffset);

      setActionMessage(result.message);
      setScores((s) => ({ ...s, p1: s.p1 + result.scoreBonus }));

      if (result.timeBonus !== 0) {
        setPlayerTimes((prev) => ({
          ...prev,
          p1: Math.max(0, prev.p1 + result.timeBonus),
        }));

        setTimeChangePopup({
          id: Date.now(),
          value: result.timeBonus,
          type: result.timeBonus > 0 ? "positive" : "negative",
        });
      }

      if (result.isGoal) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        if (result.isGolden) triggerWinConfetti();
      } else {
        playSound("miss");
        const effectType = result.message.includes("KIRMIZI") ? "save" : "miss";
        setVisualEffect({ type: effectType, player: currentPlayer });
      }

      if (result.shouldTriggerFever) playSound("whistle");

      handleTurnSwitch();
      return;
    }

    if (gameMode === "survival") {
      const isReverseCurse = survival.activeCurse === "REVERSE";

      let effectiveTarget = targetOffset;
      if (survival.activeCurse === "MOVING_TARGET") {
        const now = Date.now();
        effectiveTarget = 500 + 350 * Math.sin(now / 500);
      } else if (isReverseCurse) {
        effectiveTarget = 1000 - targetOffset;
      }

      const distance = Math.abs(currentMs - effectiveTarget);
      const redDistance =
        survival.redTarget !== null
          ? isReverseCurse
            ? Math.abs(currentMs - (1000 - survival.redTarget))
            : Math.abs(currentMs - survival.redTarget)
          : Infinity;

      const isRedHit = redDistance <= survival.survivalThreshold / 2;
      const isGreenHit = distance <= survival.survivalThreshold;
      const isCritical = distance <= survival.GOLDEN_THRESHOLD;

      let successMessage = "";

      if (isRedHit) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        successMessage = "🍎 ELMA VURULDU! (+10 SERİ)";
        survival.setStreak((prev) => prev + 9);
      } else if (!isGreenHit) {
        if (survival.isFeverActive) {
          playSound("miss");
          setActionMessage("FEVER KORUMASI!");
          return;
        }
        if (survival.hasShield) {
          survival.setHasShield(false);
          setVisualEffect({ type: "save", player: currentPlayer });
          setActionMessage("🛡️ KALKAN KIRILDI! (Hayattasın)");
          return;
        }

        survival.setAdrenaline((prev) => Math.floor(prev / 2));

        if (survival.lives > 1) {
          survival.setLives((l) => l - 1);
          playSound("miss");
          setVisualEffect({ type: "post", player: currentPlayer });
          setActionMessage(`⚠️ DİKKAT! (${survival.lives - 1} Can Kaldı)`);
        } else {
          playSound("miss");
          setVisualEffect({ type: "miss", player: currentPlayer });
          setActionMessage(`💀 ÖLDÜN!`);
          finishGame();
        }
        return;
      } else {
        if (isCritical && !survival.isFeverActive) {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
          survival.setAdrenaline((prev) => {
            const newValue = Math.min(prev + 35, 100);
            if (newValue >= 100) {
              survival.setIsFeverActive(true);
              playSound("whistle");
            }
            return newValue;
          });
        } else {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
        }
      }

      survival.setStreak((prevStreak) => {
        const bonus = survival.isFeverActive && isCritical ? 3 : 1;
        const newStreak = prevStreak + bonus;

        if (newStreak % SURVIVAL_CONSTANTS.SPEED_INCREASE_INTERVAL === 0) {
          survival.setSpeedMultiplier((s) => Math.min(s + 0.05, 2.5));
          survival.setSurvivalThreshold((t) => Math.max(30, t * 0.95));
        }

        if (
          newStreak > 0 &&
          newStreak % SURVIVAL_CONSTANTS.CURSE_INTERVAL === 0
        ) {
          survival.setCursedRemaining(3);
          const rand = Math.random();
          let nextCurse: CurseType = "REVERSE";
          if (rand < 0.33) nextCurse = "REVERSE";
          else if (rand < 0.66) nextCurse = "UNSTABLE";
          else nextCurse = "MOVING_TARGET";

          survival.setActiveCurse(nextCurse);

          let curseName = "";
          if (nextCurse === "REVERSE") curseName = "TERS AKINTI";
          else if (nextCurse === "UNSTABLE") curseName = "DENGESİZ HIZ";
          else curseName = "GEZİCİ HEDEF";

          setActionMessage(`⚠️ LANET BAŞLIYOR: ${curseName}!`);
        } else if (survival.cursedRemaining > 0) {
          const nextRemaining = Math.max(0, survival.cursedRemaining - 1);
          survival.setCursedRemaining(nextRemaining);
          if (nextRemaining === 0) {
            survival.setActiveCurse(null);
            setActionMessage("Lanet Kalktı!");
          }
        }

        if (survival.activeCurse !== "MOVING_TARGET") {
          const nextGreenTarget =
            newStreak > 5 ? Math.floor(Math.random() * 800) + 100 : 0;
          setTargetOffset(nextGreenTarget);

          const newRed = survival.generateRedTarget(nextGreenTarget);
          survival.setRedTarget(newRed);
        }

        if (successMessage) {
          setActionMessage(successMessage);
        } else if (newStreak % SURVIVAL_CONSTANTS.LIFE_BONUS_INTERVAL === 0) {
          survival.setLives((l) =>
            Math.min(l + 1, SURVIVAL_CONSTANTS.MAX_LIVES)
          );
          setActionMessage(
            `💖 +1 CAN! | Hız: ${survival.speedMultiplier.toFixed(1)}x`
          );
        } else if (survival.isFeverActive) {
          setActionMessage(`🔥 FEVER MODU!`);
        } else if (isCritical) {
          setActionMessage(`🔥 KRİTİK! (+%35 Adrenalin)`);
        } else {
          setActionMessage(`GÜZEL! (Seri: ${newStreak})`);
        }

        return newStreak;
      });

      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
      return;
    }

    const distance = Math.abs(currentMs - targetOffset);
    const displayMs = String(Math.floor(distance / 10)).padStart(2, "0");

    const { result, message, isGoal } = calculateShotResult(distance);
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
    gameMode,
    currentPlayer,
    timer.isPaused,
    timer.gameTimeMs,
    handleTurnSwitch,
    finishGame,
    targetOffset,
    playerTimes,
    playerNames,
    survival,
    processHit,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing" && !timer.isPaused) handleAction();
      }
      if (e.code === "Escape" && gameState === "playing") timer.togglePause();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, gameState, timer.isPaused, timer.togglePause, timer]);

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
    streak: survival.streak,
    actionMessage,
    winner,
    finalScore,
    countdown: timer.countdown,
    isPaused: timer.isPaused,
    togglePause: timer.togglePause,
    startGame: timer.startGame,
    handleAction,
    restartGame: resetGame,
    getCurrentPlayerName,
    setPlayerNames,
    playerNames,
    visualEffect,
    targetOffset,
    gameVariant,
    lives: survival.lives,
    speedMultiplier: survival.speedMultiplier,
    survivalThreshold: survival.survivalThreshold,
    adrenaline: survival.adrenaline,
    isSurvivalFever: survival.isFeverActive,
    goldenThreshold: survival.GOLDEN_THRESHOLD,
    hasShield: survival.hasShield,
    activeCurse: survival.activeCurse,
    redTarget: survival.redTarget,
    combo,
    multiplier,
    timeTargetWidth: targetWidth,
    timeBossActive: bossActive,
    timeBossPosition: bossPosition,
    isTimeAttackFever: timeFeverActive,
    timeChangePopup,
  };
};
