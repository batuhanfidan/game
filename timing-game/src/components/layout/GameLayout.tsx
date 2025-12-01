import React, { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { THEMES } from "../../utils/constants";
import VisualEffectOverlay from "./VisualEffectOverlay";
import PauseMenu from "./PauseMenu";
import RulesModal from "./RulesModel";
import { toggleMute, getMuteStatus } from "../../utils/sound";
import type { GameState, VisualEffectData, Player } from "../../types";
import { Volume2, VolumeX } from "lucide-react";

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

const GameLayout: React.FC<GameLayoutProps> = ({
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

  return (
    <div
      className={`h-screen w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${
        THEMES[currentTheme].class
      } ${visualEffect?.type === "goal" ? "animate-shake" : ""}`}
    >
      {/* Görsel Efekt Katmanı */}
      <VisualEffectOverlay
        effect={visualEffect}
        isTwoPlayerMode={isTwoPlayerMode}
        currentPlayer={currentPlayer}
      />

      {/* Pause Butonu */}
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

      {/* Pause Menüsü */}
      {isPaused && (
        <PauseMenu
          onResume={togglePause}
          onRestart={restartGame}
          onQuit={handleBackToMenu}
        />
      )}

      {/* Sağ Üst Menü (Hamburger) */}
      <div className="absolute top-4 right-4 z-60 flex flex-col items-end">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-2xl font-bold border border-gray-500 shadow-lg transition-transform active:scale-95"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <div
          className={`flex-col md:flex-row gap-2 mt-2 md:mt-0 ${
            isMenuOpen ? "flex" : "hidden"
          } md:flex transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={handleMuteToggle}
            aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {showThemeButton && onThemeChange && (
            <button
              onClick={onThemeChange}
              aria-label="Temayı Değiştir"
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              🎨
            </button>
          )}
          <button
            onClick={() => setShowRules(true)}
            aria-label="Oyun Kuralları"
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            ?
          </button>
        </div>
      </div>

      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* Skor Alanı (Dinamik) */}
      <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
        {scoreDisplay}
      </div>

      {/* OYUN ALANI (Child Componentlar) */}
      {children}

      {/* Alt Bilgi */}
      {bottomInfo && (
        <div className="absolute bottom-4 text-xs md:text-base text-gray-500 font-mono font-bold uppercase tracking-widest opacity-50">
          {bottomInfo}
        </div>
      )}
    </div>
  );
};

export default GameLayout;
