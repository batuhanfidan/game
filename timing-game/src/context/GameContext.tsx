import React, { createContext, useContext } from "react";
import type { ReactNode } from "react"; // Fix: Type-only import
import type { GameState, VisualEffectData, Player } from "../shared/types";

interface GameContextValue {
  gameState: GameState;
  isPaused: boolean;
  togglePause: () => void;
  restartGame: () => void;
  currentTheme: number;
  visualEffect: VisualEffectData | null;
  isTwoPlayerMode: boolean;
  currentPlayer?: Player;
  showThemeButton?: boolean;
  scoreDisplay?: ReactNode;
  bottomInfo?: string;
  onThemeChange?: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps extends GameContextValue {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  ...value
}) => {
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
