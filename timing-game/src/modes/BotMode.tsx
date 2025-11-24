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

const DIFFICULTIES = {
  EASY: { label: "Kolay", reaction: 2500, accuracy: 0.3 },
  MEDIUM: { label: "Orta", reaction: 2000, accuracy: 0.5 },
  HARD: { label: "Zor", reaction: 1000, accuracy: 0.75 },
  IMPOSSIBLE: { label: "İmkansız", reaction: 600, accuracy: 0.95 },
};

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

type DifficultyKey = keyof typeof DIFFICULTIES;

const THEMES = [
  { name: "Karanlık", class: "bg-black" },
  { name: "Gece Mavisi", class: "bg-slate-950" },
  { name: "Grafit", class: "bg-neutral-950" },
];

const BotMode = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<DifficultyKey>("MEDIUM");
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");

  // SÜRE VE BAR AYARLARI (Varsayılan 1dk)
  const [gameDuration, setGameDuration] = useState(60);
  const [showProgressBar, setShowProgressBar] = useState(true);

  const [currentTheme, setCurrentTheme] = useState(0);
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
    actionMessage,
    winner,
    finalScore,
    countdown,
    startGame,
    handleAction,
    restartGame,
    getCurrentPlayerName,
    playerNames,
    visualEffect,
    isPaused,
    togglePause,
    targetOffset,
  } = useGameLogic({
    gameMode: "bot",
    gameVariant: selectedVariant,
    botReactionTime: DIFFICULTIES[difficulty].reaction,
    botAccuracy: DIFFICULTIES[difficulty].accuracy,
    initialTime: gameDuration, // Seçilen süre
  });

  const [showRules, setShowRules] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);
  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  return (
    <div
      className={`h-screen w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${
        THEMES[currentTheme].class
      } ${visualEffect?.type === "goal" ? "animate-shake" : ""}`}
    >
      <VisualEffectOverlay effect={visualEffect} isTwoPlayerMode={false} />

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

      <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
        <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
          🏆 Skor: {scores.p1} - {scores.p2}
        </div>
        <div className="text-sm text-gray-400 mt-1 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
          ⭐ En Yüksek Skor:{" "}
          <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      <div className="absolute top-32 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer
          player={`🧍 ${playerNames.p1}`}
          minutes={Math.floor(playerTimes.p1 / 60)}
          seconds={playerTimes.p1 % 60}
        />
        <PlayerTimer
          player={`🤖 Bot (${DIFFICULTIES[difficulty].label})`}
          minutes={Math.floor(playerTimes.p2 / 60)}
          seconds={playerTimes.p2 % 60}
        />
      </div>

      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-4 z-20 bg-neutral-900 p-6 rounded-2xl border border-gray-700 shadow-2xl max-w-sm w-full mx-4 overflow-y-auto max-h-[80vh]">
          {/* ZORLUK SEÇİMİ */}
          <div className="w-full">
            <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Zorluk
            </h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`flex-1 px-2 py-2 rounded text-xs font-bold transition-all ${
                    difficulty === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {DIFFICULTIES[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* OYUN TİPİ SEÇİMİ */}
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

          {/* SÜRE VE BAR AYARLARI */}
          <div className="w-full grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Süre
              </h2>
              <div className="flex flex-col gap-1">
                {[60, 180, 300].map((t) => (
                  <button
                    key={t}
                    onClick={() => setGameDuration(t)}
                    className={`px-2 py-2 rounded text-xs font-bold transition-all ${
                      gameDuration === t
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {t / 60} Dakika
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Yardımcı Bar
              </h2>
              <button
                onClick={() => setShowProgressBar(!showProgressBar)}
                className={`w-full h-full rounded-lg border transition-all font-bold text-sm ${
                  showProgressBar
                    ? "bg-green-900/30 border-green-500 text-green-400"
                    : "bg-gray-800 border-gray-600 text-gray-500"
                }`}
              >
                {showProgressBar ? "AÇIK" : "KAPALI"}
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-gray-700 my-2"></div>

          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="px-10 py-4 rounded-xl text-xl font-bold transition w-full bg-green-600 hover:bg-green-500 cursor-pointer hover:scale-105 shadow-lg shadow-green-500/20"
          >
            {playerReady ? "Başlatılıyor..." : "OYUNU BAŞLAT"}
          </button>
          <button
            onClick={handleBackToMenu}
            className="text-gray-500 hover:text-white text-sm underline cursor-pointer"
          >
            🔙 Menüye Dön
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {countdown}
        </div>
      )}

      {gameState === "playing" && (
        <>
          {/* TimerDisplay Props Güncellendi */}
          <TimerDisplay
            totalMs={gameTimeMs}
            targetOffset={targetOffset}
            variant={selectedVariant}
            showProgressBar={showProgressBar}
          />

          <div className="text-xl md:text-2xl mt-6 text-center font-bold px-4 h-8 text-green-400 drop-shadow-sm">
            {actionMessage}
          </div>
          <TurnInfo
            currentPlayer={getCurrentPlayerName()}
            turnTimeLeft={turnTimeLeft}
          />
          <div
            className={`flex justify-center w-full px-4 mt-10 transition-all duration-300 ${
              currentPlayer !== "p1"
                ? "opacity-40 grayscale pointer-events-none scale-95"
                : "scale-100"
            }`}
          >
            <ActionButton
              onClick={handleAction}
              disabled={currentPlayer !== "p1" || isPaused}
            />
          </div>
          <div className="mt-6 text-gray-500 text-sm animate-pulse font-semibold hidden md:block">
            [SPACE] tuşuna basarak da oynayabilirsin
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
      <div className="absolute bottom-4 text-xs md:text-base text-gray-500 font-mono">
        🎯 Tema: {THEMES[currentTheme].name}
      </div>
    </div>
  );
};

export default BotMode;
