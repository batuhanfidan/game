import { useState, useEffect, useRef, useCallback } from "react";
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

type CurseType = "REVERSE" | "UNSTABLE";

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
  const [isPaused, setIsPaused] = useState(false);

  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");

  const [targetOffset, setTargetOffset] = useState(0);
  const [roundOffset, setRoundOffset] = useState(0);

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  // --- SURVIVAL & ADRENALIN STATE
  const [lives, setLives] = useState(3);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [survivalThreshold, setSurvivalThreshold] = useState(250);
  const [adrenaline, setAdrenaline] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const GOLDEN_THRESHOLD = 15;
  const [hasShield, setHasShield] = useState(false);

  //SURVIVAL MEKANİKLERİ
  const [cursedRemaining, setCursedRemaining] = useState(0);
  const [activeCurse, setActiveCurse] = useState<CurseType | null>(null);
  const [redTarget, setRedTarget] = useState<number | null>(null);

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

  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [streak, setStreak] = useState(0);

  const getHighScoreKey = useCallback(
    () => `timing-game-highscore-${gameMode}-${gameVariant}`,
    [gameMode, gameVariant]
  );

  const [highScore, setHighScore] = useState(() => {
    if (gameMode === "classic" && gameVariant === "classic") return 0;
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

  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  const generateRedTarget = useCallback((greenTarget: number) => {
    if (Math.random() > 0.2) return null;

    let red = 0;

    if (Math.random() < 0.5) {
      red = Math.floor(Math.random() * 100);
    } else {
      red = 900 + Math.floor(Math.random() * 100);
    }

    if (Math.abs(red - greenTarget) < 150) return null;

    return red;
  }, []);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setIsPaused(false);
    setGameTimeMs(0);
    startTimeRef.current = 0;
    setTargetOffset(0);
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: startDuration, p2: startDuration });
    setTurnTimeLeft(10);
    setActionMessage("");
    setVisualEffect(null);
    setStreak(0);

    // Survival değerlerini sıfırla
    setLives(3);
    setSpeedMultiplier(1.0);
    setSurvivalThreshold(250);
    setAdrenaline(0);
    setIsFeverActive(false);
    setHasShield(false);

    // Yeni mekanikleri sıfırla
    setCursedRemaining(0);
    setActiveCurse(null);
    setRedTarget(null);
  }, [startDuration]);

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

  const getCurrentPlayerName = useCallback(
    () => playerNames[currentPlayer],
    [currentPlayer, playerNames]
  );

  const togglePause = useCallback(() => {
    if (gameState !== "playing") return;
    setIsPaused((prev) => !prev);
  }, [gameState]);

  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else if (pauseStartTimeRef.current > 0) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      startTimeRef.current += pausedDuration;
      pauseStartTimeRef.current = 0;
    }
  }, [isPaused]);

  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

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

  // --- FEVER TIMER ---
  useEffect(() => {
    if (isFeverActive) {
      const timer = setTimeout(() => {
        setIsFeverActive(false);
        setAdrenaline(0);
        setHasShield(true);
        playSound("whistle");
        setActionMessage("🛡️ KALKAN AKTİF! (Bir sonraki hatadan korur)");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFeverActive]);

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
    randomizeRound();
  }, [gameMode, randomizeRound]);

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

        if (gameMode === "survival" || gameMode === "time_attack") {
          setCurrentPlayer("p1");
          setActionMessage("Başarılar!");
        } else {
          const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
          setCurrentPlayer(startPlayer);
          setActionMessage(`🎲 ${playerNames[startPlayer]} başlıyor!`);
        }
        randomizeRound();
      }
    }, 1000);
  }, [playerNames, gameMode, randomizeRound]);

  // --- ANA ZAMANLAYICI ---
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;

      const currentSpeed = isFeverActive
        ? speedMultiplier * 0.5
        : speedMultiplier;

      let visualTime = elapsed * currentSpeed + roundOffset;

      // YENİ: Dengesiz Hız Laneti veya Varyasyonu Aktifse
      if (gameVariant === "unstable" || activeCurse === "UNSTABLE") {
        const t = now / 1000;
        // Sinüs dalgaları ile kaotik hızlanma/yavaşlama
        const chaos =
          Math.sin(t * 1.5) * 250 +
          Math.cos(t * 4.2) * 120 +
          Math.sin(t * 9.8) * 60;
        visualTime += chaos;
      }

      setGameTimeMs(visualTime);
    }, 10);

    return () => clearInterval(interval);
  }, [
    gameState,
    isPaused,
    gameVariant,
    roundOffset,
    speedMultiplier,
    isFeverActive,
    activeCurse,
  ]);

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

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    if (isSharedTimeMode && gameTimeMs >= initialTime * 1000) {
      finishGame();
      return;
    }

    if (turnTimeLeft === 0) {
      if (gameMode === "survival") {
        if (lives > 1) {
          setLives((l) => l - 1);
          setActionMessage("⏰ SÜRE DOLDU! (-1 Can)");
          setTurnTimeLeft(10);
        } else {
          setActionMessage("⏰ SÜRE DOLDU! Elendin.");
          finishGame();
        }
      } else {
        setActionMessage(`⏰ ${getCurrentPlayerName()} süresini doldurdu!`);
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
    handleTurnSwitch,
    finishGame,
    getCurrentPlayerName,
    isPaused,
    gameMode,
    gameTimeMs,
    initialTime,
    isSharedTimeMode,
    lives,
  ]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing" || isPaused) return;
    if (gameMode === "bot" && currentPlayer === "p2") return;

    if (
      (gameMode === "classic" || gameMode === "bot") &&
      playerTimes[currentPlayer] <= 0
    ) {
      return;
    }

    playSound("kick");

    const currentMs = gameTimeMs % 1000;

    // --- SURVIVAL MODİFİKASYONLARI ---
    if (gameMode === "survival") {
      // Cursed Round:
      const isReverseCurse = activeCurse === "REVERSE";
      const effectiveTarget = isReverseCurse
        ? 1000 - targetOffset
        : targetOffset;

      const distance = Math.abs(currentMs - effectiveTarget);
      const redDistance =
        redTarget !== null
          ? isReverseCurse
            ? Math.abs(currentMs - (1000 - redTarget))
            : Math.abs(currentMs - redTarget)
          : Infinity;

      // Kırmızı alanın toleransı yarı yarıya daha az
      const isRedHit = redDistance <= survivalThreshold / 2;
      const isGreenHit = distance <= survivalThreshold;
      const isCritical = distance <= GOLDEN_THRESHOLD;

      let successMessage = "";

      // ÖNCE KIRMIZI ELMA KONTROLÜ (Riskli Hedef)
      if (isRedHit) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        successMessage = "🍎 ELMA VURULDU! (+10 SERİ)";

        setStreak((prev) => prev + 9);
      } else if (!isGreenHit) {
        // HATA YAPILDI
        if (isFeverActive) {
          playSound("miss");
          setActionMessage("FEVER KORUMASI!");
          return;
        }
        if (hasShield) {
          setHasShield(false);
          setVisualEffect({ type: "save", player: currentPlayer });
          setActionMessage("🛡️ KALKAN KIRILDI! (Hayattasın)");
          return;
        }

        setAdrenaline((prev) => Math.floor(prev / 2));

        if (lives > 1) {
          setLives((l) => l - 1);
          playSound("miss");
          setVisualEffect({ type: "post", player: currentPlayer });
          setActionMessage(`⚠️ DİKKAT! (${lives - 1} Can Kaldı)`);
        } else {
          playSound("miss");
          setVisualEffect({ type: "miss", player: currentPlayer });
          setActionMessage(`💀 ÖLDÜN!`);
          finishGame();
        }
        return;
      } else {
        // YEŞİL VURULDU
        if (isCritical && !isFeverActive) {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
          setAdrenaline((prev) => {
            const newValue = Math.min(prev + 100, 100);
            if (newValue >= 100) {
              setIsFeverActive(true);
              playSound("whistle");
            }
            return newValue;
          });
        } else {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
        }
      }

      // --- ORTAK BAŞARI MANTIĞI ---
      setStreak((prevStreak) => {
        const bonus = isFeverActive && isCritical ? 3 : 1;
        const newStreak = prevStreak + bonus;

        // Zorluk Artışı
        if (newStreak % 5 === 0) {
          setSpeedMultiplier((s) => Math.min(s + 0.05, 2.5));
          setSurvivalThreshold((t) => Math.max(30, t * 0.95));
        }

        //Cursed Round Trigger (Her 15 turda bir)
        if (newStreak > 0 && newStreak % 15 === 0) {
          setCursedRemaining(3);
          // %50 ihtimalle Ters Akıntı veya Dengesiz Hız
          const nextCurse = Math.random() < 0.5 ? "REVERSE" : "UNSTABLE";
          setActiveCurse(nextCurse);

          const curseName =
            nextCurse === "REVERSE" ? "TERS AKINTI" : "DENGESİZ HIZ";
          setActionMessage(`⚠️ LANET BAŞLIYOR: ${curseName}!`);
        } else if (cursedRemaining > 0) {
          const nextRemaining = Math.max(0, cursedRemaining - 1);
          setCursedRemaining(nextRemaining);
          if (nextRemaining === 0) {
            setActiveCurse(null); // Laneti kaldır
            setActionMessage("Lanet Kalktı!");
          }
        }

        // Red Apple Spawn
        const nextGreenTarget =
          newStreak > 5 ? Math.floor(Math.random() * 800) + 100 : 0;
        setTargetOffset(nextGreenTarget);

        const newRed = generateRedTarget(nextGreenTarget);
        setRedTarget(newRed);

        // Mesaj belirleme
        if (successMessage) {
          setActionMessage(successMessage);
        } else if (newStreak % 10 === 0) {
          setLives((l) => Math.min(l + 1, 5));
          setActionMessage(`💖 +1 CAN! | Hız: ${speedMultiplier.toFixed(1)}x`);
        } else if (isFeverActive) {
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
    finishGame,
    targetOffset,
    playerTimes,
    survivalThreshold,
    lives,
    isFeverActive,
    GOLDEN_THRESHOLD,
    speedMultiplier,
    hasShield,
    cursedRemaining,
    activeCurse,
    redTarget,
    generateRedTarget,
  ]);

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
      const isSuccess =
        result === "GOL" || (isGoal && Math.random() < botAccuracy);
      const displayMs = String(Math.floor(error / 10)).padStart(2, "0");

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
    playerTimes.p2,
  ]);

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
    targetOffset,
    gameVariant,
    lives,
    speedMultiplier,
    survivalThreshold,
    adrenaline,
    isFeverActive,
    goldenThreshold: GOLDEN_THRESHOLD,
    hasShield,
    activeCurse,
    redTarget,
  };
};
