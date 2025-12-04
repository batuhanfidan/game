import { useState } from "react";
import type { GameState } from "../../shared/types";

export const useGameState = (initialState: GameState = "idle") => {
  const [gameState, setGameState] = useState<GameState>(initialState);

  return { gameState, setGameState };
};
