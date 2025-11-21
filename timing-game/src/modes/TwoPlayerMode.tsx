import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import RulesModal from "../components/layout/RulesModel";
import VisualEffectOverlay from "../components/layout/VisualEffectOverlay";
import PauseMenu from "../components/layout/PauseMenu";
import { useGameLogic } from "../hooks/useGameLogic";
import { toggleMute, getMuteStatus } from "../utils/sound";
import type { GameVariant } from "../types";

const THEMES = [
  { name: "Klasik", class: "bg-black" },
  { name: "Çim Saha", class: "bg-green-900" },
  { name: "Gece Mavisi", class: "bg-slate-900" },
  { name: "Neon", class: "bg-purple-900" },
];

const VARIANTS: { key: GameVariant; label: string; desc: string }[] = [
  { key: "classic", label: "🟢 Klasik", desc: "Standart oyun. Hedef 00ms." },
  {
    key: "ghost",
    label: "👻 Hayalet",
    desc: "Sayaç 500ms'den sonra kaybolur.",
  },
  {
    key: "unstable",
    label: "📉 Dengesiz",
    desc: "Zamanın hızı sürekli değişir.",
  },
  {
    key: "random",
    label: "🔀 Rastgele",
    desc: "Her tur farklı yerden başlar.",
  },
  {
    key: "moving",
    label: "🎯 Gezgin",
    desc: "Hedef bölgesi her tur yer değiştirir.",
  },
];

const TwoPlayerMode = () => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");

  const {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    actionMessage,
    winner,
    finalScore,
    countdown,
    startGame,
    handleAction,
    restartGame,
    getCurrentPlayerName,
    setPlayerNames,
    playerNames,
    visualEffect,
    isPaused,
    togglePause,
    targetOffset,
  } = useGameLogic({
    gameMode: "classic",
    gameVariant: selectedVariant,
  });

  const [showRules, setShowRules] = useState(false);
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);

  const [currentTheme, setCurrentTheme] = useState(0);
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);
  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (p1Ready && p2Ready && gameState === "idle") startGame();
  }, [p1Ready, p2Ready, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") {
      setP1Ready(false);
      setP2Ready(false);
    }
  }, [gameState]);

  return (
    <div
      className={`h-screen w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${
        THEMES[currentTheme].class
      } ${visualEffect?.type === "goal" ? "animate-shake" : ""}`}
    >
      <VisualEffectOverlay effect={visualEffect} isTwoPlayerMode={true} />

      {gameState === "playing" && (
        <button
          onClick={togglePause}
          className="absolute top-4 left-4 z-60 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110"
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
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={handleThemeChange}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            🎨
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            ?
          </button>
        </div>
      </div>

      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      <div className="absolute top-4 text-2xl md:text-3xl font-extrabold text-center text-yellow-400 drop-shadow-lg px-4 pointer-events-none">
        🏆 Skor: {scores.p1} - {scores.p2}
      </div>

      <div className="absolute top-28 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer
          player={`🧍 ${playerNames.p1}`}
          minutes={Math.floor(playerTimes.p1 / 60)}
          seconds={playerTimes.p1 % 60}
        />
        <PlayerTimer
          player={`🧍 ${playerNames.p2}`}
          minutes={Math.floor(playerTimes.p2 / 60)}
          seconds={playerTimes.p2 % 60}
        />
      </div>

      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-10 bg-neutral-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full mx-4 overflow-y-auto max-h-[80vh]">
          {/* OYUN TİPİ SEÇİMİ (En üstte) */}
          <div className="w-full">
            <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Oyun Tipi
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {VARIANTS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setSelectedVariant(v.key)}
                  className={`px-4 py-3 rounded-lg text-left flex flex-col transition-all border ${
                    selectedVariant === v.key
                      ? "bg-gray-800 border-green-500 shadow-lg shadow-green-900/20"
                      : "bg-gray-800/50 border-transparent hover:bg-gray-800"
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      selectedVariant === v.key
                        ? "text-green-400"
                        : "text-gray-300"
                    }`}
                  >
                    {v.label}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider w-full mt-2">
            Oyuncular
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="text"
              value={playerNames.p1}
              onChange={(e) =>
                setPlayerNames((prev) => ({ ...prev, p1: e.target.value }))
              }
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-center w-full"
              placeholder="Oyuncu 1"
            />
            <input
              type="text"
              value={playerNames.p2}
              onChange={(e) =>
                setPlayerNames((prev) => ({ ...prev, p2: e.target.value }))
              }
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-center w-full"
              placeholder="Oyuncu 2"
            />
          </div>

          <div className="flex gap-4 mt-4 w-full justify-center">
            <button
              onClick={() => setP1Ready(true)}
              disabled={p1Ready}
              className={`px-4 py-3 rounded-lg text-lg font-bold transition w-full ${
                p1Ready
                  ? "bg-green-600 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {p1Ready ? "Hazır ✓" : "P1 Hazır"}
            </button>
            <button
              onClick={() => setP2Ready(true)}
              disabled={p2Ready}
              className={`px-4 py-3 rounded-lg text-lg font-bold transition w-full ${
                p2Ready
                  ? "bg-green-600 cursor-default"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {p2Ready ? "Hazır ✓" : "P2 Hazır"}
            </button>
          </div>
          <button
            onClick={handleBackToMenu}
            className="mt-2 text-gray-400 hover:text-white underline text-sm"
          >
            🔙 Menüye Dön
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="text-7xl font-bold text-yellow-400 animate-pulse z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {countdown}
        </div>
      )}

      {gameState === "playing" && (
        <>
          <TimerDisplay
            totalMs={gameTimeMs}
            targetOffset={targetOffset}
            variant={selectedVariant}
          />

          <div className="text-xl md:text-2xl mt-4 text-center text-green-400 font-semibold px-4 h-8">
            {actionMessage}
          </div>
          <TurnInfo
            currentPlayer={getCurrentPlayerName()}
            turnTimeLeft={turnTimeLeft}
          />
          <div className="flex justify-center w-full gap-4 sm:gap-10 px-4 mt-8">
            <div
              className={`flex flex-col items-center transition-opacity duration-200 ${
                currentPlayer !== "p1" ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p1" || isPaused}
              />
              <p className="mt-2 text-sm text-gray-400 text-center w-full truncate px-2">
                {playerNames.p1}
              </p>
            </div>
            <div
              className={`flex flex-col items-center transition-opacity duration-200 ${
                currentPlayer !== "p2" ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p2" || isPaused}
              />
              <p className="mt-2 text-sm text-gray-400 text-center w-full truncate px-2">
                {playerNames.p2}
              </p>
            </div>
          </div>
          <div className="mt-4 text-gray-500 text-sm animate-pulse hidden md:block">
            (İpucu: Sırası gelen SPACE tuşunu kullanabilir)
          </div>
        </>
      )}

      {gameState === "finished" && (
        <GameOverModal
          winner={winner}
          finalScore={finalScore}
          onRestart={restartGame}
        />
      )}
      <div className="absolute bottom-4 text-sm text-gray-400">
        🎯 Tema: {THEMES[currentTheme].name}
      </div>
    </div>
  );
};
export default TwoPlayerMode;
