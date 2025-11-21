import { useState, useEffect, useCallback, useRef } from "react";
import { useGameTimer } from "./useGameTimer";
import { useScoreSystem } from "./useCoreSystem";
import { useSoundEffects } from "./useSoundEffects";
import { calculateShotResult } from "../../utils/calculateShotResult";
import { triggerWinConfetti } from "../../utils/confetti";
import type {
  GameVariant,
  Player,
  GameState,
  VisualEffectData,
} from "../../types";

export type GameModeType =
  | "classic"
  | "bot"
  | "survival"
  | "time_attack"
  | "penalty";

interface UseGameEngineProps {
  gameMode: GameModeType;
  variant?: GameVariant;
  botDifficulty?: { reaction: number; accuracy: number };
  initialTime?: number;
}

export const useGameEngine = ({
  gameMode,
  variant = "classic",
  botDifficulty,
  initialTime = 60,
}: UseGameEngineProps) => {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [isPaused, setIsPaused] = useState(false); // YENİ: Pause state eklendi
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const [targetOffset, setTargetOffset] = useState(0);
  const [actionMessage, setActionMessage] = useState("");
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [winner, setWinner] = useState("");
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  // Time Attack için sayaç
  const [matchTimeLeft, setMatchTimeLeft] = useState(initialTime);

  const sound = useSoundEffects();
  const score = useScoreSystem();

  const stateRef = useRef({ gameState, currentPlayer, isPaused });

  useEffect(() => {
    stateRef.current = { gameState, currentPlayer, isPaused };
  }, [gameState, currentPlayer, isPaused]);

  // --- OYUN MANTIĞI ---

  // Süre Dolduğunda (Bar sonuna gelince)
  const handleTimeLimit = useCallback(() => {
    if (gameMode === "survival") {
      finishGame("⏰ Süre doldu! Elendin.", "💀 OYUN BİTTİ");
    } else {
      setActionMessage("⏰ Süre Doldu! Sıra Kaybı.");
      sound.play("miss");
      setVisualEffect({ type: "miss", player: currentPlayer });
      switchTurn();
    }
  }, [currentPlayer, gameMode]); // Dependency eklendi

  const timer = useGameTimer({ variant, onTimeLimitReached: handleTimeLimit });

  const finishGame = useCallback(
    (msg: string, winMsg: string) => {
      setActionMessage(msg);
      setWinner(winMsg);
      setGameState("finished");
      timer.stopTimer();
      sound.play("whistle");
      if (
        gameMode === "time_attack" ||
        gameMode === "survival" ||
        score.scores.p1 > score.scores.p2
      ) {
        triggerWinConfetti();
      }
    },
    [gameMode, score.scores, timer, sound]
  );

  const switchTurn = useCallback(() => {
    timer.stopTimer();
    setTimeout(() => {
      if (stateRef.current.gameState !== "playing") return;

      if (gameMode !== "survival" && gameMode !== "time_attack") {
        setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      }

      timer.resetTimer();
      setTurnTimeLeft(10); // Süreyi sıfırla

      if (variant === "moving_target") {
        setTargetOffset(Math.floor(Math.random() * 700) + 100);
      } else {
        setTargetOffset(0);
      }
    }, 1000);
  }, [timer, variant, gameMode]);

  const startGame = () => {
    score.resetScores();
    score.resetStreak();
    setMatchTimeLeft(initialTime);
    setGameState("countdown");
    setIsPaused(false);

    setTimeout(() => {
      setGameState("playing");
      if (variant === "moving_target")
        setTargetOffset(Math.floor(Math.random() * 700) + 100);
      timer.startTimer();
      sound.play("whistle");
    }, 3000);
  };

  const togglePause = () => {
    if (gameState !== "playing") return;

    if (isPaused) {
      setIsPaused(false);
      timer.startTimer(); // Timer'ı devam ettir
    } else {
      setIsPaused(true);
      timer.stopTimer(); // Timer'ı durdur
    }
  };

  const handleAction = useCallback(() => {
    if (stateRef.current.gameState !== "playing" || stateRef.current.isPaused) {
      // Oyun başlamamışsa veya duraklatılmışsa işlem yapma
      // Ancak setup/idle durumunda başlatmak için timer kontrolü:
      if (
        gameState === "idle" ||
        (!timer.isRunning && gameState !== "finished" && !isPaused)
      )
        timer.startTimer();
      return;
    }

    if (!timer.isRunning) return;

    const currentMs = timer.gameTimeMs;
    timer.stopTimer();
    sound.play("kick");

    const { result, message, isGoal } = calculateShotResult(
      currentMs,
      targetOffset
    );
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

    if (gameMode === "survival") {
      if (isGoal) {
        sound.play("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        score.incrementStreak();
        setActionMessage(`🔥 SERİ: ${score.streak + 1} | ${message}`);
        switchTurn();
      } else {
        sound.play("miss");
        setVisualEffect({ type: "miss", player: currentPlayer });
        finishGame(`❌ HATA! (${displayMs}ms)`, "💀 OYUN BİTTİ");
      }
      return;
    }

    setActionMessage(
      `${playerNames[currentPlayer]}: ${message} (${displayMs}ms)`
    );

    if (isGoal) {
      sound.play("goal");
      setVisualEffect({ type: "goal", player: currentPlayer });
      score.incrementScore(currentPlayer);
    } else if (result === "DİREK") {
      sound.play("miss");
      setVisualEffect({ type: "post", player: currentPlayer });
    } else {
      sound.play("miss");
      setVisualEffect({ type: "miss", player: currentPlayer });
    }

    if (
      (gameMode === "classic" || gameMode === "bot") &&
      score.scores[currentPlayer] + (isGoal ? 1 : 0) >= 5
    ) {
      finishGame("Maç Bitti!", `🏆 ${playerNames[currentPlayer]} Kazandı!`);
    } else {
      switchTurn();
    }
  }, [
    gameState,
    isPaused, // Dependency eklendi
    timer,
    currentPlayer,
    playerNames,
    targetOffset,
    gameMode,
    score,
    sound,
    switchTurn,
    finishGame,
  ]);

  // --- YENİ EKLENENLER ---

  // 1. KLAVYE KONTROLLERİ (Space ve Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Sayfa kaymasını engelle
        handleAction();
      }
      if (e.code === "Escape") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]); // handleAction değiştiğinde listener güncellenir

  // 2. TUR SÜRESİ SAYACI (Turn Timer)
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          // Süre bitti
          if (gameMode === "survival") {
            clearInterval(interval);
            finishGame("⏰ Süre doldu! Elendin.", "💀 OYUN BİTTİ");
            return 0;
          } else {
            // Sıra diğer oyuncuya
            sound.play("miss");
            switchTurn();
            return 10;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, isPaused, gameMode, finishGame, switchTurn, sound]);

  // -----------------------

  // BOT YAPAY ZEKASI
  useEffect(() => {
    if (
      gameMode !== "bot" ||
      currentPlayer !== "p2" ||
      gameState !== "playing" ||
      isPaused || // Pause kontrolü eklendi
      !botDifficulty
    )
      return;

    const reactionTime = botDifficulty.reaction + (Math.random() * 500 - 250);
    const timeout = setTimeout(() => {
      if (
        stateRef.current.gameState === "playing" &&
        stateRef.current.currentPlayer === "p2" &&
        !stateRef.current.isPaused
      ) {
        handleAction();
      }
    }, Math.max(500, reactionTime));

    return () => clearTimeout(timeout);
  }, [
    currentPlayer,
    gameState,
    isPaused,
    gameMode,
    botDifficulty,
    handleAction,
  ]);

  // Time Attack Geri Sayımı
  useEffect(() => {
    if (gameMode !== "time_attack" || gameState !== "playing" || isPaused)
      return;

    const interval = setInterval(() => {
      setMatchTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame("Süre Doldu!", "⏱️ ZAMAN DOLDU");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, gameState, isPaused, finishGame]);

  const restartGame = () => {
    setGameState("setup");
    score.resetScores();
    score.resetStreak();
    timer.resetTimer();
    setVisualEffect(null);
    setActionMessage("");
    setIsPaused(false);
  };

  return {
    gameState,
    setGameState,
    isPaused, // DIŞARI AKTARILDI
    togglePause, // DIŞARI AKTARILDI
    currentPlayer,
    playerNames,
    setPlayerNames,
    scores: score.scores,
    streak: score.streak,
    gameTimeMs: timer.gameTimeMs,
    turnTimeLeft,
    matchTimeLeft,
    actionMessage,
    visualEffect,
    winner,
    handleAction,
    startGame,
    restartGame,
    targetOffset,
    sound,
  };
};
