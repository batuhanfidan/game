import { useState } from "react";
import TimerDisplay from "../components/game/TimerDisplay";
import PlayerTimer from "../components/layout/PlayerTimer";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import SetupScreen from "../components/game/SetupScreen";
import { useClassicLogic } from "../hooks/modes/useClassicLogic";
import { THEMES } from "../utils/constants";
import type { GameVariant } from "../types";

const TwoPlayerMode = () => {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");

  // Logic Hook'u çağırıyoruz
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
    restartGame: logicRestart, // Logic içindeki reset fonksiyonu
  } = useClassicLogic({ variant: selectedVariant, isBotMode: false });

  // Tema değiştirme
  const handleThemeChange = () =>
    setCurrentTheme((prev) => (prev + 1) % THEMES.length);

  // Tamamen yeniden başlatma (Setup ekranına dönme)
  const handleFullRestart = () => {
    logicRestart(); // Skorları sıfırla
    setGameState("setup"); // Ayar ekranına dön
  };

  // Sadece maçı yeniden başlatma (Aynı ayarlarla)
  const handleRematch = () => {
    logicRestart();
    setGameState("countdown");
    setTimeout(() => {
      setGameState("playing");
      sound.play("whistle");
    }, 3000);
  };

  // EĞER OYUN "SETUP" AŞAMASINDAYSA -> AYAR EKRANINI GÖSTER
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

  // OYUN BAŞLADIYSA -> OYUN ALANINI GÖSTER
  const scoreDisplay = (
    <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
      🏆 {scores.p1} - {scores.p2}
    </div>
  );

  return (
    <GameLayout
      gameState={gameState}
      visualEffect={visualEffect}
      isPaused={gameState === "idle"} // Basitlik için idle durumunu pause gibi kullanabiliriz veya logic'ten isPaused çekebiliriz
      togglePause={() => {}} // Şimdilik pause butonu yok veya logic'e eklenebilir
      restartGame={handleFullRestart}
      scoreDisplay={scoreDisplay}
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      isTwoPlayerMode={true}
      currentPlayer={currentPlayer}
    >
      {gameState === "countdown" && (
        <div className="text-9xl font-black text-yellow-400 animate-ping z-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          H4ZIR
        </div>
      )}

      <div className="absolute top-28 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer player={`🧍 ${playerNames.p1}`} minutes={0} seconds={0} />
        <PlayerTimer player={`🧍 ${playerNames.p2}`} minutes={0} seconds={0} />
      </div>

      {/* GHOST MOD: Eğer ghost mod ise ve süre 500ms'i geçtiyse opacity düşür */}
      <div
        className={`transition-opacity duration-300 ${
          selectedVariant === "ghost" && gameTimeMs > 500
            ? "opacity-0"
            : "opacity-100"
        }`}
      >
        {/* Timer Display Artık TargetOffset alabilir */}
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
          onRestart={handleRematch}
        />
      )}
    </GameLayout>
  );
};

export default TwoPlayerMode;
