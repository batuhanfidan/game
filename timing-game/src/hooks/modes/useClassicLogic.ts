import { useState, useEffect, useCallback } from "react";
import { useGameTimer } from "../core/useGameTimer";
import { useScoreSystem } from "../core/useCoreSystem";
import { useSoundEffects } from "../core/useSoundEffects";
import { calculateShotResult } from "../../utils/calculateShotResult";
import { triggerWinConfetti } from "../../utils/confetti";
import type {
  GameVariant,
  Player,
  GameState,
  VisualEffectData,
} from "../../types";

interface UseClassicLogicProps {
  variant: GameVariant;
  isBotMode?: boolean;
  botDifficulty?: { reaction: number; accuracy: number };
}

export const useClassicLogic = ({
  variant,
  isBotMode = false,
  botDifficulty,
}: UseClassicLogicProps) => {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const [targetOffset, setTargetOffset] = useState(0); // Gezgin hedef için
  const [actionMessage, setActionMessage] = useState("");
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [winner, setWinner] = useState("");

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: isBotMode ? "Bot" : "Oyuncu 2",
  });
  const [turnTimeLeft, setTurnTimeLeft] = useState(10); // Hamle süresi (saniye)

  // Core Hooks
  const sound = useSoundEffects();
  const score = useScoreSystem();

  // Süre aşımı (Ofsayt) mantığı
  const handleTimeLimit = useCallback(() => {
    setActionMessage("⏰ Süre Doldu! Sıra Kaybı.");
    sound.play("miss");
    setVisualEffect({ type: "miss", player: currentPlayer });
    switchTurn();
  }, [currentPlayer]);

  const timer = useGameTimer({ variant, onTimeLimitReached: handleTimeLimit });

  // Hedef Belirleme (Gezgin Hedef için)
  const randomizeTarget = useCallback(() => {
    if (variant === "moving_target") {
      // 100ms ile 800ms arasında rastgele bir hedef
      setTargetOffset(Math.floor(Math.random() * 700) + 100);
    } else {
      setTargetOffset(0);
    }
  }, [variant]);

  const switchTurn = useCallback(() => {
    timer.stopTimer();
    // Kısa bir bekleme ve sıra değişimi
    setTimeout(() => {
      setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      timer.resetTimer();
      setTurnTimeLeft(10);
      randomizeTarget(); // Yeni turda hedefi değiştir
      // Eğer yeni sıra botunsa timer'ı başlatma, bot kendi başlatacak (veya UI başlatacak)
      // Şimdilik manuel başlatma için bekletiyoruz
    }, 1000);
  }, [timer, randomizeTarget]);

  // Bot Mantığı
  useEffect(() => {
    if (
      !isBotMode ||
      currentPlayer !== "p2" ||
      gameState !== "playing" ||
      !botDifficulty
    )
      return;

    // Bot tepki süresi kadar bekle ve vur
    const reactionTime = botDifficulty.reaction + (Math.random() * 500 - 250); // Biraz varyasyon
    const timeout = setTimeout(() => {
      handleAction();
    }, Math.max(500, reactionTime)); // En az 500ms bekle

    return () => clearTimeout(timeout);
  }, [isBotMode, currentPlayer, gameState]);

  const startGame = () => {
    score.resetScores();
    setGameState("countdown");
    // Countdown bittiğinde playing'e geçişi UI tarafı veya bir useEffect yönetebilir
    // Basitlik için burada 3 sn sonra başlatıyoruz:
    setTimeout(() => {
      setGameState("playing");
      randomizeTarget();
      timer.startTimer();
      sound.play("whistle");
    }, 3000);
  };

  const handleAction = useCallback(() => {
    if (gameState !== "playing") {
      // Eğer oyun başlamadıysa ve basıldıysa, bu timer'ı başlatma komutudur
      if (!timer.isRunning) {
        timer.startTimer();
        return;
      }
    }

    if (!timer.isRunning) return; // Zaten durmuşsa işlem yapma

    const currentMs = timer.gameTimeMs;
    timer.stopTimer();
    sound.play("kick");

    const { result, message, isGoal } = calculateShotResult(
      currentMs,
      targetOffset
    );
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

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

    // Kazanma Kontrolü (Örn: 5 olan kazanır)
    if (score.scores[currentPlayer] + (isGoal ? 1 : 0) >= 5) {
      setWinner(`🏆 ${playerNames[currentPlayer]} Kazandı!`);
      setGameState("finished");
      triggerWinConfetti();
      sound.play("whistle");
    } else {
      switchTurn();
    }
  }, [gameState, timer, currentPlayer, playerNames, targetOffset, score]);

  return {
    gameState,
    setGameState,
    currentPlayer,
    scores: score.scores,
    gameTimeMs: timer.gameTimeMs,
    actionMessage,
    visualEffect,
    winner,
    playerNames,
    setPlayerNames,
    handleAction,
    startGame,
    turnTimeLeft,
    targetOffset, // UI'da yeşil alanı kaydırmak için lazım
    sound,
  };
};
