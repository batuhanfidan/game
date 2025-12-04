import React, { useState, type ReactNode, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { THEMES } from "../../utils/constants";
import VisualEffectOverlay from "./VisualEffectOverlay";
import PauseMenu from "./PauseMenu";
import RulesModal from "./RulesModel";
import { toggleMute, getMuteStatus } from "../../utils/sound";
import type { GameState, VisualEffectData, Player } from "../../types";
import { Volume2, VolumeX, Menu, X } from "lucide-react";

interface GameLayoutProps {
  children: ReactNode;
  gameState: GameState;
  visualEffect: VisualEffectData | null;
  isPaused: boolean;
  togglePause: () => void;
  restartGame: () => void;
  currentTheme: number;
  onThemeChange?: () => void;
  isTwoPlayerMode: boolean;
  currentPlayer?: Player;
  showThemeButton?: boolean;
  scoreDisplay?: ReactNode;
  bottomInfo?: string;
}

const GameLayout: React.FC<GameLayoutProps> = memo(
  ({
    children,
    gameState,
    visualEffect,
    isPaused,
    togglePause,
    restartGame,
    currentTheme,
    onThemeChange,
    isTwoPlayerMode,
    currentPlayer,
    showThemeButton = true,
    scoreDisplay,
    bottomInfo,
  }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [isMuted, setIsMuted] = useState(getMuteStatus());

    const handleMuteToggle = () => setIsMuted(toggleMute());
    const handleBackToMenu = () => navigate("/", { replace: true });

    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isMenuOpen) {
          setIsMenuOpen(false);
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }, [isMenuOpen]);

    return (
      <div
        className={`h-screen-safe w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${
          THEMES[currentTheme].class
        } ${visualEffect?.type === "goal" ? "animate-shake" : ""}`}
      >
        <VisualEffectOverlay
          effect={visualEffect}
          isTwoPlayerMode={isTwoPlayerMode}
          currentPlayer={currentPlayer}
        />

        {gameState === "playing" && (
          <button
            onClick={togglePause}
            aria-label="Oyunu Duraklat"
            className="absolute top-4 left-4 z-60 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            title="Duraklat"
          >
            ⏸
          </button>
        )}

        {isPaused && (
          <PauseMenu
            onResume={togglePause}
            onRestart={restartGame}
            onQuit={handleBackToMenu}
          />
        )}

        <div className="absolute top-4 right-4 z-60 flex flex-col items-end">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-2xl font-bold border border-gray-500 shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none z-70 relative"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {isMenuOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <div
            id="mobile-menu"
            className={`flex-col md:flex-row gap-2 mt-2 md:mt-0 ${
              isMenuOpen ? "flex" : "hidden"
            } md:flex transition-all duration-300 ease-in-out z-60 relative`}
          >
            <button
              onClick={handleMuteToggle}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            {showThemeButton && onThemeChange && (
              <button
                onClick={onThemeChange}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                🎨
              </button>
            )}
            <button
              onClick={() => setShowRules(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ?
            </button>
          </div>
        </div>

        <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

        <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
          {scoreDisplay}
        </div>

        {children}

        {bottomInfo && (
          <div className="absolute bottom-4 text-xs md:text-base text-gray-300 font-mono font-bold uppercase tracking-widest opacity-50">
            {bottomInfo}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.gameState === next.gameState &&
      prev.isPaused === next.isPaused &&
      prev.visualEffect?.type === next.visualEffect?.type &&
      prev.visualEffect?.player === next.visualEffect?.player &&
      prev.currentTheme === next.currentTheme &&
      prev.currentPlayer === next.currentPlayer &&
      prev.scoreDisplay === next.scoreDisplay
    );
  }
);

export default GameLayout;
