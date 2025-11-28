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
  const stateRef = useRef({
    playerTimes,
    botAccuracy,
    gameState,
    currentPlayer,
    isPaused,
  });

  useEffect(() => {
    stateRef.current = {
      playerTimes,
      botAccuracy,
      gameState,
      currentPlayer,
      isPaused,
    };
  }, [playerTimes, botAccuracy, gameState, currentPlayer, isPaused]);

  useEffect(() => {
    if (
      gameMode !== "bot" ||
      gameState !== "playing" ||
      currentPlayer !== "p2" ||
      isPaused
    ) {
      return;
    }

    // Botun süresi bittiyse oynama
    if (stateRef.current.playerTimes.p2 <= 0) return;

    const timer = setTimeout(() => {
      // Oynama anında tekrar kontrol et
      if (
        stateRef.current.gameState !== "playing" ||
        stateRef.current.isPaused ||
        stateRef.current.playerTimes.p2 <= 0
      ) {
        return;
      }

      const currentAccuracy = stateRef.current.botAccuracy;

      // Hata payı hesaplama
      const baseErrorRange = 1000;
      const minErrorBuffer = 15;
      const maxError =
        Math.floor(baseErrorRange * (1 - currentAccuracy)) + minErrorBuffer;

      const error = Math.floor(Math.random() * maxError);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(error);
      const displayMs = String(Math.floor(error / 10)).padStart(2, "0");

      if (isGoal) {
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
          `🤖 Bot: ${
            result === "GOL" ? "Golü kaçırdı!" : message
          } (${displayMs}ms)`
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
    isPaused,
    handleTurnSwitch,
    setScores,
    setVisualEffect,
    setActionMessage,
  ]);
};
