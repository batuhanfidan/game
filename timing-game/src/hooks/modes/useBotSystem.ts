import { useEffect, useRef } from "react";
import { calculateShotResult } from "../../shared/utils/calculateShotResult";
import { playSound } from "../../shared/utils/sound";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  GameMode,
  GameState,
  Player,
  VisualEffectData,
  ActionMessage,
} from "../../shared/types";

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
  setActionMessage: (msg: ActionMessage) => void;
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
  const { t } = useTranslation();
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
    const abortController = new AbortController();

    if (
      gameMode !== "bot" ||
      gameState !== "playing" ||
      currentPlayer !== "p2" ||
      isPaused
    ) {
      return;
    }

    if (stateRef.current.playerTimes.p2 <= 0) return;

    const timer = setTimeout(() => {
      if (abortController.signal.aborted) return;

      if (
        stateRef.current.gameState !== "playing" ||
        stateRef.current.isPaused ||
        stateRef.current.playerTimes.p2 <= 0
      ) {
        return;
      }

      const currentAccuracy = stateRef.current.botAccuracy;

      const getMaxError = (acc: number) => {
        if (acc >= 0.9) return 25;
        if (acc >= 0.7) return 50;
        if (acc >= 0.5) return 200;
        return 700;
      };

      const maxError = getMaxError(currentAccuracy);
      const error = Math.floor(Math.random() * maxError);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(error);
      const displayMs = String(Math.floor(error / 10)).padStart(2, "0");

      const translatedMessage = t("game.turn_message", {
        player: "Bot",
        result: t(message),
        ms: displayMs,
      });

      if (isGoal) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: "p2" });
        setActionMessage({
          text: translatedMessage,
          icon: CheckCircle,
          className: "text-green-400",
        });
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      } else {
        playSound("miss");
        setVisualEffect({
          type: result === "DİREK" ? "post" : "miss",
          player: "p2",
        });
        setActionMessage({
          text: translatedMessage,
          icon: XCircle,
          className: "text-red-400",
        });
      }

      handleTurnSwitch();
    }, botReactionTime);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
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
    t,
  ]);
};
