import { useState } from "react";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import SetupScreen from "../components/game/SetupScreen";
import { useGameEngine } from "../hooks/core/useGameEngine";
import { THEMES } from "../utils/constants";
import type { GameVariant } from "../types";

const TwoPlayerMode = () => {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");

  const {
    gameState,
    currentPlayer,
    playerNames,
    setPlayerNames,
    scores,
    gameTimeMs,
    turnTimeLeft,
    actionMessage,
    visualEffect,
    winner,
    handleAction,
    startGame,
    targetOffset,
    restartGame,
  } = useGameEngine({
    gameMode: "classic",
    variant: selectedVariant,
  });

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);

  if (gameState === "setup") {
    return (
      <div
        className={`h-screen w-screen ${THEMES[currentTheme].class} transition-colors duration-500`}
      >
        <SetupScreen
          p1Name={playerNames.p1}
          p2Name={playerNames.p2}
          setP1Name={(name) =>
            setPlayerNames((prev) => ({ ...prev, p1: name }))
          }
          setP2Name={(name) =>
            setPlayerNames((prev) => ({ ...prev, p2: name }))
          }
          selectedVariant={selectedVariant}
          setVariant={setSelectedVariant}
          onStart={startGame}
          onBack={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <GameLayout
      gameState={gameState}
      visualEffect={visualEffect}
      isPaused={false}
      togglePause={() => {}}
      restartGame={restartGame}
      scoreDisplay={
        <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
          🏆 {scores.p1} - {scores.p2}
        </div>
      }
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      isTwoPlayerMode={true}
      currentPlayer={currentPlayer}
    >
      {gameState === "countdown" && (
        <div className="text-9xl font-black text-yellow-400 animate-ping z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          HAZIR
        </div>
      )}
      <div className="absolute top-28 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer player={`🧍 ${playerNames.p1}`} minutes={0} seconds={0} />
        <PlayerTimer player={`🧍 ${playerNames.p2}`} minutes={0} seconds={0} />
      </div>
      <div
        className={`transition-opacity duration-300 ${
          selectedVariant === "ghost" && gameTimeMs > 500
            ? "opacity-0"
            : "opacity-100"
        }`}
      >
        <TimerDisplay totalMs={gameTimeMs} targetOffset={targetOffset} />
      </div>
      <div className="text-xl md:text-2xl mt-6 text-center font-bold px-4 h-8 text-green-400 drop-shadow-sm">
        {actionMessage}
      </div>
      <TurnInfo
        currentPlayer={playerNames[currentPlayer]}
        turnTimeLeft={turnTimeLeft}
      />
      <div className="flex justify-center w-full gap-8 px-4 mt-10">
        <div
          className={`flex flex-col items-center transition-opacity duration-300 ${
            currentPlayer !== "p1" ? "opacity-30 pointer-events-none" : ""
          }`}
        >
          <ActionButton
            onClick={handleAction}
            disabled={currentPlayer !== "p1"}
          />
          <p className="mt-2 text-sm text-gray-400">{playerNames.p1}</p>
        </div>
        <div
          className={`flex flex-col items-center transition-opacity duration-300 ${
            currentPlayer !== "p2" ? "opacity-30 pointer-events-none" : ""
          }`}
        >
          <ActionButton
            onClick={handleAction}
            disabled={currentPlayer !== "p2"}
          />
          <p className="mt-2 text-sm text-gray-400">{playerNames.p2}</p>
        </div>
      </div>
      {gameState === "finished" && (
        <GameOverModal
          winner={winner}
          finalScore={`Skor: ${scores.p1} - ${scores.p2}`}
          onRestart={restartGame}
        />
      )}
    </GameLayout>
  );
};

export default TwoPlayerMode;
