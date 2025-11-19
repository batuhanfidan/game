import { useState, useEffect } from "react";
import TimerDisplay from "../components/TimerDisplay";
import PlayerTimer from "../components/PlayerTimer";
import ActionButton from "../components/ActionButton";
import TurnInfo from "../components/TurnInfo";
import GameOverModal from "../components/GameOverModal";
import RulesModal from "../components/RulesModel";
import { useGameLogic } from "../hooks/useGameLogic";
import { toggleMute, getMuteStatus } from "../utils/sound";

interface BotModeProps {
  onBack: () => void;
}

const DIFFICULTIES = {
  EASY: { label: "Kolay", reaction: 2500, accuracy: 0.3 },
  MEDIUM: { label: "Orta", reaction: 2000, accuracy: 0.5 },
  HARD: { label: "Zor", reaction: 1000, accuracy: 0.75 },
  IMPOSSIBLE: { label: "İmkansız", reaction: 600, accuracy: 0.95 },
};

type DifficultyKey = keyof typeof DIFFICULTIES;
const THEMES = [
  { name: "Klasik", class: "bg-black" },
  { name: "Çim Saha", class: "bg-green-900" },
  { name: "Gece Mavisi", class: "bg-slate-900" },
  { name: "Neon", class: "bg-purple-900" },
];

const BotMode: React.FC<BotModeProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<DifficultyKey>("MEDIUM");
  const [currentTheme, setCurrentTheme] = useState(0);
  const [isMuted, setIsMuted] = useState(getMuteStatus());

  // YENİ: Menü açık mı kapalı mı?
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
  } = useGameLogic({
    isBotMode: true,
    botReactionTime: DIFFICULTIES[difficulty].reaction,
    botAccuracy: DIFFICULTIES[difficulty].accuracy,
  });

  const [showRules, setShowRules] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);
  const handleMuteToggle = () => setIsMuted(toggleMute());

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  return (
    <div
      className={`h-screen w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${THEMES[currentTheme].class}`}
    >
      {/* --- YENİ ÜST MENÜ (Hamburger Yapısı) --- */}
      <div className="absolute top-4 right-4 z-[60] flex flex-col items-end">
        {/* Hamburger İkonu (Sadece Mobilde Görünür) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-2xl font-bold border border-gray-500 shadow-lg transition-transform active:scale-95"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        {/* Menü İçeriği (Mobilde isMenuOpen'a bağlı, Masaüstünde hep görünür) */}
        <div
          className={`
          flex-col md:flex-row gap-2 mt-2 md:mt-0 
          ${isMenuOpen ? "flex" : "hidden"} md:flex
          transition-all duration-300 ease-in-out
        `}
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
            title="Tema Değiştir"
          >
            🎨
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
            title="Oyun Kuralları"
          >
            ?
          </button>
        </div>
      </div>

      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* SKOR TABLOSU */}
      <div className="absolute top-4 w-full flex flex-col items-center z-10">
        <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
          🏆 Skor: {scores.p1} - {scores.p2}
        </div>
        <div className="text-sm text-gray-400 mt-1 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
          ⭐ En Yüksek Skor:{" "}
          <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      {/* OYUNCU SÜRELERİ */}
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
        <div className="flex flex-col items-center gap-6 z-20 bg-neutral-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-sm w-full mx-4">
          <h2 className="text-2xl font-bold text-blue-400">Zorluk Seviyesi</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  difficulty === key
                    ? "bg-blue-600 text-white scale-105"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="px-10 py-4 rounded-xl text-xl font-bold transition w-full bg-green-600 hover:bg-green-500 cursor-pointer hover:scale-105 shadow-lg shadow-green-500/20"
          >
            {playerReady ? "Başlatılıyor..." : "OYUNU BAŞLAT"}
          </button>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-white text-sm underline cursor-pointer mt-2"
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
          <TimerDisplay totalMs={gameTimeMs} />
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
              disabled={currentPlayer !== "p1"}
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
