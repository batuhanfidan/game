import { useState } from "react";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import SetupScreen from "../components/game/SetupScreen";
import { useClassicLogic } from "../hooks/modes/useClassicLogic";
import { THEMES, DIFFICULTIES } from "../utils/constants";
import type { GameVariant } from "../types";

type DifficultyKey = keyof typeof DIFFICULTIES;

const BotMode = () => {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("MEDIUM");

  const {
    gameState,
    setGameState,
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
    sound,
    restartGame,
  } = useClassicLogic({
    variant: selectedVariant,
    isBotMode: true,
    botDifficulty: DIFFICULTIES[difficulty],
  });

  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);

  const handleFullRestart = () => {
    restartGame();
    setGameState("setup");
  };

  if (gameState === "setup") {
    return (
      <div
        className={`h-screen w-screen ${THEMES[currentTheme].class} flex flex-col items-center justify-center`}
      >
        {/* Basit bir zorluk seçici ekleyelim, SetupScreen'i genişletebiliriz ama şimdilik buraya koyalım */}
        <div className="bg-gray-900/90 p-8 rounded-2xl border border-gray-700 mb-4 w-full max-w-4xl">
          <h3 className="text-white font-bold mb-2">Bot Zorluğu</h3>
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-4 py-2 rounded ${
                  difficulty === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
        </div>

        <SetupScreen
          p1Name={playerNames.p1}
          p2Name="Bot"
          setP1Name={(name) =>
            setPlayerNames((prev) => ({ ...prev, p1: name }))
          }
          setP2Name={() => {}} // Bot ismi değişmez
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
      restartGame={handleFullRestart}
      scoreDisplay={
        <div className="text-3xl font-bold text-yellow-400">
          Skor: {scores.p1} - {scores.p2}
        </div>
      }
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      isTwoPlayerMode={false}
    >
      {gameState === "countdown" && (
        <div className="text-9xl font-black text-yellow-400 animate-ping z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          H4ZIR
        </div>
      )}

      <div className="absolute top-28 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer player={`🧍 ${playerNames.p1}`} minutes={0} seconds={0} />
        <PlayerTimer
          player={`🤖 ${DIFFICULTIES[difficulty].label}`}
          minutes={0}
          seconds={0}
        />
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

      <div className="text-xl mt-6 text-center font-bold text-green-400 h-8">
        {actionMessage}
      </div>
      <TurnInfo
        currentPlayer={playerNames[currentPlayer]}
        turnTimeLeft={turnTimeLeft}
      />

      <div
        className={`flex justify-center w-full mt-10 transition-all ${
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

      {gameState === "finished" && (
        <GameOverModal
          winner={winner}
          finalScore={`Skor: ${scores.p1} - ${scores.p2}`}
          onRestart={handleFullRestart}
        />
      )}
    </GameLayout>
  );
};

export default BotMode;
