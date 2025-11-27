import { useEffect, useRef } from "react";
import { calculateShotResult } from "../utils/calculateShotResult";
import { playSound } from "../utils/sound";
import type { GameMode, GameState, Player, VisualEffectData } from "../types";

interface UseBotSystemProps {
  gameMode: GameMode;
  gameState: GameState;
  currentPlayer: Player;
  isPaused: boolean;
  playerTimes: { p1: number; p2: number };
  botReactionTime: number;
  botAccuracy: number;
  handleTurnSwitch: () => void;
  setScores: React.Dispatch<React.SetStateAction<{ p1: number; p2: number }>>;
  setVisualEffect: (effect: VisualEffectData | null) => void;
  setActionMessage: (msg: string) => void;
}

export const useBotSystem = ({
  gameMode,
  gameState,
  currentPlayer,
  isPaused,
  playerTimes,
  botReactionTime,
  botAccuracy,
  handleTurnSwitch,
  setScores,
  setVisualEffect,
  setActionMessage,
}: UseBotSystemProps) => {
  const latestState = useRef({
    playerTimes,
    botAccuracy,
  });

  // Her render'da ref'i güncelle (ama re-render tetikleme)
  useEffect(() => {
    latestState.current = { playerTimes, botAccuracy };
  }, [playerTimes, botAccuracy]);

  useEffect(() => {
    // Temel şartlar sağlanmıyorsa çık
    if (
      gameMode !== "bot" ||
      gameState !== "playing" ||
      currentPlayer !== "p2" ||
      isPaused
    )
      return;

    // Zaman bittiyse oynama (Ref üzerinden kontrol)
    if (latestState.current.playerTimes.p2 <= 0) return;

    const timer = setTimeout(() => {
      const currentAccuracy = latestState.current.botAccuracy;

      // Hata payı hesaplama
      let error = 0;
      if (currentAccuracy >= 0.9) error = Math.floor(Math.random() * 10);
      else if (currentAccuracy >= 0.7) error = Math.floor(Math.random() * 50);
      else error = Math.floor(Math.random() * 300);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(error);
      const isSuccess =
        result === "GOL" || (isGoal && Math.random() < currentAccuracy);
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
    // DÜZELTME: playerTimes ve botAccuracy LİSTEDEN ÇIKARILDI.
    // Artık sadece oyun durumu veya sıra değiştiğinde bu effect çalışacak.
    // Saatin her saniye ilerlemesi botu resetlemeyecek.
    gameState,
    currentPlayer,
    gameMode,
    botReactionTime,
    handleTurnSwitch,
    isPaused,
    setScores,
    setVisualEffect,
    setActionMessage,
  ]);
};
