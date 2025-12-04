import { useState, useCallback, useRef, useEffect } from "react";
import { GAMEPLAY_CONSTANTS } from "../../shared/constants/game";
import type { Player, GameMode } from "../../shared/types";

export const usePlayerSystem = (initialTime: number, gameMode: GameMode) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  // Fix: Tip çıkarımını number olarak zorluyoruz, yoksa '10' literal tipi sanıyor
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(
    GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT
  );

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: gameMode === "bot" ? "Bot" : "Oyuncu 2",
  });

  const isSharedTimeMode = gameMode === "classic" || gameMode === "bot";
  const startDuration = isSharedTimeMode
    ? Math.ceil(initialTime / 2)
    : initialTime;

  const [playerTimes, setPlayerTimes] = useState({
    p1: startDuration,
    p2: startDuration,
  });

  const currentPlayerRef = useRef(currentPlayer);
  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  const resetPlayers = useCallback(() => {
    setCurrentPlayer("p1");
    setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    setPlayerTimes({ p1: startDuration, p2: startDuration });
  }, [startDuration]);

  const switchTurn = useCallback(() => {
    if (gameMode === "survival" || gameMode === "time_attack") {
      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    } else {
      setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    }
  }, [gameMode]);

  return {
    currentPlayer,
    setCurrentPlayer,
    turnTimeLeft,
    setTurnTimeLeft,
    playerNames,
    setPlayerNames,
    playerTimes,
    setPlayerTimes,
    resetPlayers,
    switchTurn,
    currentPlayerRef,
    isSharedTimeMode,
  };
};
