import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import { useGameLogic } from "../hooks/useGameLogic";
import { DIFFICULTIES, THEMES } from "../utils/constants";

type DifficultyKey = keyof typeof DIFFICULTIES;

const BotMode = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<DifficultyKey>("MEDIUM");
  const [currentTheme, setCurrentTheme] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);

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
  } = useGameLogic({
    gameMode: "bot",
    botReactionTime: DIFFICULTIES[difficulty].reaction,
    botAccuracy: DIFFICULTIES[difficulty].accuracy,
  });

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  const scoreDisplay = (
    <>
      <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
        🏆 Skor: {scores.p1} - {scores.p2}
      </div>
      <div className="text-sm text-gray-400 mt-1 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
        ⭐ En Yüksek Skor:{" "}
        <span className="text-white font-bold">{highScore}</span>
      </div>
    </>
  );

  return (
    <GameLayout
      gameState={gameState}
      visualEffect={visualEffect}
      isPaused={isPaused}
      togglePause={togglePause}
      restartGame={restartGame}
      scoreDisplay={scoreDisplay}
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      isTwoPlayerMode={false}
    >
      {/* Hazırlık Ekranı */}
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
            onClick={handleBackToMenu}
            className="text-gray-500 hover:text-white text-sm underline cursor-pointer mt-2"
          >
            🔙 Menüye Dön
          </button>
        </div>
      )}

      {/* Geri Sayım */}
      {countdown !== null && (
        <div className="text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {countdown}
        </div>
      )}

      {/* Oyun Alanı */}
      {gameState === "playing" && (
        <>
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
    </GameLayout>
  );
};

export default BotMode;
