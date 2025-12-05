import React, { memo } from "react";
import { useGameContext } from "../../context/GameContext";
import VisualEffectOverlay from "../game/VisualEffectOverlay";
import PauseMenu from "./PauseMenu";
import RulesModal from "./RulesModel";
import { THEMES } from "../../shared/constants/ui";
// EKLENEN SATIR: Ses kontrol fonksiyonlarını import et
import { toggleMute, getMuteStatus } from "../../shared/utils/sound";

import { Volume2, VolumeX, Menu, X } from "lucide-react";

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

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [showRules, setShowRules] = React.useState(false);

    // GÜNCELLENEN SATIR: Başlangıç değerini gerçek ses durumundan al
    const [isMuted, setIsMuted] = React.useState(getMuteStatus());

    // EKLENEN FONKSİYON: Sesi hem sistemde hem de arayüzde değiştir
    const handleToggleMute = () => {
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
            onQuit={() => (window.location.href = "/")}
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
              onClick={handleToggleMute} // GÜNCELLENEN SATIR: Yeni fonksiyon bağlandı
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
  }
);

export default GameLayout;
