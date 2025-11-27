import { useState, useEffect, useCallback } from "react";
import { calculateShotResult } from "../utils/calculateShotResult";
import { triggerWinConfetti } from "../utils/confetti";
import { playSound } from "../utils/sound";
import type {
  GameMode,
  GameState,
  Player,
  VisualEffectData,
  GameVariant,
} from "../types";

// Alt hook'ları import ediyoruz
import { useSurvivalSystem } from "./useSurvivalSystem";
import { useGameTimer } from "./useGameTimer";
import { useBotSystem } from "./useBotSystem";

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
  const [gameState, setGameState] = useState<GameState>("idle");
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");

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

  // --- 1. SURVIVAL SİSTEMİ ---
  // DÜZELTME: Parametre kaldırıldı
  const survival = useSurvivalSystem();

  // --- 2. ZAMANLAYICI SİSTEMİ İÇİN GEREKLİ YARDIMCI FONKSİYONLAR ---
  const randomizeRound = useCallback(() => {
    if (gameVariant === "random") {
      setRoundOffset(Math.floor(Math.random() * 800));
    } else {
      setRoundOffset(0);
    }

    if (gameVariant === "moving") {
      setTargetOffset(Math.floor(Math.random() * 800));
    } else {
      setTargetOffset(0);
    }
  }, [gameVariant]);

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

  // --- 2. ZAMANLAYICI SİSTEMİ ---
  const timer = useGameTimer({
    gameState,
    setGameState,
    gameVariant,
    roundOffset,
    speedMultiplier: survival.speedMultiplier,
    isFeverActive: survival.isFeverActive,
    activeCurse: survival.activeCurse,
    onGameStart: handleGameStartLogic,
  });

  // --- HIGH SCORE ---
  const getHighScoreKey = useCallback(
    () => `timing-game-highscore-${gameMode}-${gameVariant}`,
    [gameMode, gameVariant]
  );

  const [highScore, setHighScore] = useState(() => {
    if (gameMode === "classic" && gameVariant === "classic") return 0;
    const saved = localStorage.getItem(getHighScoreKey());
    return saved ? parseInt(saved, 10) : 0;
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

  // --- PLAYER TIMES ---
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

  const restartGame = useCallback(() => {
    timer.resetTimer();
    setGameState("idle");
    setTargetOffset(0);
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: startDuration, p2: startDuration });
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);

    survival.resetSurvivalState();
  }, [startDuration, timer, survival]);

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
  }, [
    scores,
    gameMode,
    highScore,
    playerNames,
    survival.streak,
    updateHighScore,
    timer,
  ]);

  const handleTurnSwitch = useCallback(() => {
    if (gameMode === "survival" || gameMode === "time_attack") {
      setTurnTimeLeft(10);
    } else {
      setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      setTurnTimeLeft(10);
    }
    randomizeRound();
  }, [gameMode, randomizeRound]);

  // --- TURN & GAME OVER LOGIC ---
  useEffect(() => {
    if (gameState !== "playing" || timer.isPaused) return;
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
  }, [gameState, currentPlayer, timer.isPaused, gameMode]);

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
          setTurnTimeLeft(10);
        } else {
          setActionMessage("⏰ SÜRE DOLDU! Elendin.");
          finishGame();
        }
      } else {
        setActionMessage(`${playerNames[currentPlayer]} süresini doldurdu!`);
        playSound("miss");
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

  // --- VISUAL EFFECT TIMEOUT ---
  useEffect(() => {
    if (visualEffect) {
      const t = setTimeout(() => setVisualEffect(null), 1000);
      return () => clearTimeout(t);
    }
  }, [visualEffect]);

  const getCurrentPlayerName = useCallback(
    () => playerNames[currentPlayer],
    [currentPlayer, playerNames]
  );

  // --- ACTION HANDLER (CORE LOGIC) ---
  const handleAction = useCallback(() => {
    if (gameState !== "playing" || timer.isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;

    if (
      (gameMode === "classic" || gameMode === "bot") &&
      playerTimes[currentPlayer] <= 0
    ) {
      return;
    }

    playSound("kick");

    const currentMs = timer.gameTimeMs % 1000;

    // --- SURVIVAL MANTIĞI ---
    if (gameMode === "survival") {
      const isReverseCurse = survival.activeCurse === "REVERSE";
      const effectiveTarget = isReverseCurse
        ? 1000 - targetOffset
        : targetOffset;

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
        // HATA
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
        // BAŞARILI
        if (isCritical && !survival.isFeverActive) {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
          survival.setAdrenaline((prev) => {
            const newValue = Math.min(prev + 100, 100);
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

        if (newStreak % 5 === 0) {
          survival.setSpeedMultiplier((s) => Math.min(s + 0.05, 2.5));
          survival.setSurvivalThreshold((t) => Math.max(30, t * 0.95));
        }

        if (newStreak > 0 && newStreak % 15 === 0) {
          survival.setCursedRemaining(3);
          const nextCurse = Math.random() < 0.5 ? "REVERSE" : "UNSTABLE";
          survival.setActiveCurse(nextCurse);
          const curseName =
            nextCurse === "REVERSE" ? "TERS AKINTI" : "DENGESİZ HIZ";
          setActionMessage(`⚠️ LANET BAŞLIYOR: ${curseName}!`);
        } else if (survival.cursedRemaining > 0) {
          const nextRemaining = Math.max(0, survival.cursedRemaining - 1);
          survival.setCursedRemaining(nextRemaining);
          if (nextRemaining === 0) {
            survival.setActiveCurse(null);
            setActionMessage("Lanet Kalktı!");
          }
        }

        const nextGreenTarget =
          newStreak > 5 ? Math.floor(Math.random() * 800) + 100 : 0;
        setTargetOffset(nextGreenTarget);

        const newRed = survival.generateRedTarget(nextGreenTarget);
        survival.setRedTarget(newRed);

        if (successMessage) {
          setActionMessage(successMessage);
        } else if (newStreak % 10 === 0) {
          survival.setLives((l) => Math.min(l + 1, 5));
          setActionMessage(
            `💖 +1 CAN! | Hız: ${survival.speedMultiplier.toFixed(1)}x`
          );
        } else if (survival.isFeverActive) {
          setActionMessage(`🔥 FEVER MODU!`);
        } else if (isCritical) {
          setActionMessage(`🔥 KRİTİK! (+%20 Adrenalin)`);
        } else {
          setActionMessage(`GÜZEL! (Seri: ${newStreak})`);
        }

        return newStreak;
      });

      setTurnTimeLeft(10);
      return;
    }

    // --- DİĞER MODLAR ---
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
  ]);

  // --- KEYBOARD ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "playing" && !timer.isPaused) handleAction();
      }
      if (e.code === "Escape" && gameState === "playing") timer.togglePause();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, gameState, timer.isPaused, timer.togglePause, timer]);

  // --- 3. BOT SİSTEMİ ---
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
    restartGame,
    getCurrentPlayerName,
    setPlayerNames,
    playerNames,
    visualEffect,
    targetOffset,
    gameVariant,
    // Survival Props
    lives: survival.lives,
    speedMultiplier: survival.speedMultiplier,
    survivalThreshold: survival.survivalThreshold,
    adrenaline: survival.adrenaline,
    isFeverActive: survival.isFeverActive,
    goldenThreshold: survival.GOLDEN_THRESHOLD,
    hasShield: survival.hasShield,
    activeCurse: survival.activeCurse,
    redTarget: survival.redTarget,
  };
};
