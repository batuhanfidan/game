import React, { memo, useState } from "react";
import { useGameContext } from "../../context/GameContext";
import VisualEffectOverlay from "../game/VisualEffectOverlay";
import PauseMenu from "./PauseMenu";
import RulesModal from "./RulesModel";
import { THEMES } from "../../shared/constants/ui";
import { toggleMute, getMuteStatus } from "../../shared/utils/sound";

import { Menu, Volume2, VolumeX, Palette, CircleHelp, X } from "lucide-react";

const GameLayout: React.FC<{ children: React.ReactNode }> = memo(
  ({ children }) => {
    const {
      gameState,
      visualEffect,
      isPaused,
      togglePause,
      restartGame,
      currentTheme,
      isTwoPlayerMode,
      currentPlayer,
      scoreDisplay,
      bottomInfo,
      showThemeButton = true,
      onThemeChange,
    } = useGameContext();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // Ses durumu başlatma ve yönetimi
    const [isMuted, setIsMuted] = useState(getMuteStatus());

    const handleMuteToggle = () => {
      const newStatus = toggleMute();
      setIsMuted(newStatus);
    };

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

        {/* --- SOL ÜST: DURAKLAT BUTONU (BotMode stili) --- */}
        {gameState === "playing" && (
          <button
            onClick={togglePause}
            className="absolute top-4 left-4 z-60 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-blue-500"
            title="Duraklat"
          >
            ⏸
          </button>
        )}

        {isPaused && (
          <PauseMenu
            onResume={togglePause}
            onRestart={restartGame}
            onQuit={() => (window.location.href = "/")}
          />
        )}

        {/* --- SAĞ ÜST: MENÜ (BotMode yapısı ve görselliği) --- */}
        <div className="absolute top-4 right-4 z-60 flex flex-col items-end">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            aria-expanded={isMenuOpen}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center border border-gray-500 shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none z-70 relative"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Menü arka planı (Mobil için) */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <div
            className={`flex-col md:flex-row gap-2 mt-2 md:mt-0 ${
              isMenuOpen ? "flex" : "hidden"
            } md:flex transition-all duration-300 ease-in-out z-60 relative`}
          >
            <button
              onClick={handleMuteToggle}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {showThemeButton && onThemeChange && (
              <button
                onClick={onThemeChange}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Palette size={20} />
              </button>
            )}

            <button
              onClick={() => setShowRules(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <CircleHelp size={20} />
            </button>
          </div>
        </div>

        <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

        {/* --- ÜST ORTA: SKOR --- */}
        <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
          {scoreDisplay}
        </div>

        {/* --- OYUN İÇERİĞİ --- */}
        {children}

        {/* --- ALT BİLGİ --- */}
        {bottomInfo && (
          <div className="absolute bottom-4 text-xs md:text-base text-gray-500 font-mono">
            {bottomInfo}
          </div>
        )}
      </div>
    );
  }
);

export default GameLayout;
