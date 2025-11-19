import { useState, useEffect } from "react";
import TimerDisplay from "../components/TimerDisplay";
import PlayerTimer from "../components/PlayerTimer";
import ActionButton from "../components/ActionButton";
import TurnInfo from "../components/TurnInfo";
import GameOverModal from "../components/GameOverModal";
import RulesModal from "../components/RulesModel";
import { useGameLogic } from "../hooks/useGameLogic";

interface TwoPlayerModeProps {
  onBack: () => void;
}

const TwoPlayerMode: React.FC<TwoPlayerModeProps> = ({ onBack }) => {
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
  } = useGameLogic(); // Varsayılan (Bot yok, 2 kişilik)

  const [showRules, setShowRules] = useState(false);
  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);

  // Her iki oyuncu da hazırsa oyunu başlat
  useEffect(() => {
    if (p1Ready && p2Ready && gameState === "idle") {
      startGame();
    }
  }, [p1Ready, p2Ready, gameState, startGame]);

  // Oyun bittiyse veya yeniden başlatıldıysa hazır durumlarını sıfırla
  useEffect(() => {
    if (gameState === "idle") {
      setP1Ready(false);
      setP2Ready(false);
    }
  }, [gameState]);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-center items-center relative font-mono overflow-hidden">
      {/* Yardım Butonu */}
      <button
        onClick={() => setShowRules(true)}
        className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 
             text-white rounded-full w-10 h-10 flex items-center 
             justify-center text-xl font-bold z-[60] cursor-pointer"
        title="Oyun Kuralları"
      >
        ?
      </button>
      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* Skor Board */}
      <div className="absolute top-4 text-2xl md:text-3xl font-extrabold text-center text-yellow-400 drop-shadow-lg px-4">
        🏆 Skor: Oyuncu 1 [{scores.p1}] - [{scores.p2}] Oyuncu 2
      </div>

      {/* Oyuncu Süreleri */}
      <div className="absolute top-20 flex justify-between w-full px-4 md:px-20 text-xl">
        <PlayerTimer
          player="🧍‍♂️ Oyuncu 1"
          minutes={Math.floor(playerTimes.p1 / 60)}
          seconds={playerTimes.p1 % 60}
        />
        <PlayerTimer
          player="🧍‍♂️ Oyuncu 2"
          minutes={Math.floor(playerTimes.p2 / 60)}
          seconds={playerTimes.p2 % 60}
        />
      </div>

      {/* Hazırlık Ekranı */}
      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-10 bg-gray-900/80 p-8 rounded-2xl border border-gray-700">
          <div className="flex gap-8">
            <button
              onClick={() => setP1Ready(true)}
              disabled={p1Ready}
              className={`px-6 py-3 rounded-lg text-xl font-bold transition ${
                p1Ready
                  ? "bg-green-600 cursor-default"
                  : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
              }`}
            >
              {p1Ready ? "Oyuncu 1 Hazır ✓" : "Oyuncu 1 Hazır"}
            </button>

            <button
              onClick={() => setP2Ready(true)}
              disabled={p2Ready}
              className={`px-6 py-3 rounded-lg text-xl font-bold transition ${
                p2Ready
                  ? "bg-green-600 cursor-default"
                  : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
              }`}
            >
              {p2Ready ? "Oyuncu 2 Hazır ✓" : "Oyuncu 2 Hazır"}
            </button>
          </div>

          <button
            onClick={onBack}
            className="mt-4 text-gray-400 hover:text-white underline cursor-pointer text-sm"
          >
            🔙 Menüye Dön
          </button>
        </div>
      )}

      {/* Geri Sayım */}
      {countdown !== null && (
        <div className="text-7xl font-bold text-yellow-400 animate-pulse z-10">
          {countdown}
        </div>
      )}

      {/* Oyun Alanı */}
      {gameState === "playing" && (
        <>
          <TimerDisplay totalMs={gameTimeMs} />

          <div className="text-xl md:text-2xl mt-4 text-center text-green-400 font-semibold px-4 h-8">
            {actionMessage}
          </div>

          <TurnInfo
            currentPlayer={getCurrentPlayerName()}
            turnTimeLeft={turnTimeLeft}
          />

          {/* Butonlar - Sıra kimdeyse o buton aktif görünür */}
          <div className="flex justify-center w-full gap-10 px-4 mt-8">
            <div
              className={`flex flex-col items-center transition-opacity duration-200 ${
                currentPlayer !== "p1" ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p1"}
              />
              <p className="mt-2 text-sm text-gray-400">Oyuncu 1 (Sol)</p>
            </div>

            <div
              className={`flex flex-col items-center transition-opacity duration-200 ${
                currentPlayer !== "p2" ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p2"}
              />
              <p className="mt-2 text-sm text-gray-400">Oyuncu 2 (Sağ)</p>
            </div>
          </div>

          <div className="mt-4 text-gray-500 text-sm animate-pulse">
            (İpucu: Sırası gelen SPACE tuşunu kullanabilir)
          </div>
        </>
      )}

      {/* Oyun Sonu */}
      {gameState === "finished" && (
        <GameOverModal
          winner={winner}
          finalScore={finalScore}
          onRestart={restartGame}
        />
      )}

      <div className="absolute bottom-4 text-sm md:text-lg text-gray-400">
        🎯 Amaç: Doğru zamanlama ile gol atmaya çalış!
      </div>
    </div>
  );
};

export default TwoPlayerMode;
