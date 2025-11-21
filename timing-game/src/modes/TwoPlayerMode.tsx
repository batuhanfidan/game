import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import { useGameLogic } from "../hooks/useGameLogic";
import { THEMES } from "../utils/constants";

const TwoPlayerMode = () => {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(0);
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);

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
  } = useGameLogic();

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);
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

  const scoreDisplay = (
    <div className="text-2xl md:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
      🏆 Skor: {scores.p1} - {scores.p2}
    </div>
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
      isTwoPlayerMode={true}
      currentPlayer={currentPlayer}
    >
      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-10 bg-gray-900/80 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm w-11/12 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Oyuncu İsimleri</h2>
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
          <TimerDisplay totalMs={gameTimeMs} />
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
export default TwoPlayerMode;
