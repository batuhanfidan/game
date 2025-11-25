import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/game/TimerDisplay";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import { useGameLogic } from "../hooks/useGameLogic";
import { THEMES } from "../utils/constants";

const renderHearts = (count: number) => {
  return "❤️".repeat(count) + "🖤".repeat(Math.max(0, 3 - count));
};

const SurvivalMode = () => {
  const navigate = useNavigate();
  const [playerReady, setPlayerReady] = useState(false);

  const themeIndex = THEMES.findIndex((t) => t.name === "Hayatta Kalma");
  const currentTheme = themeIndex !== -1 ? themeIndex : 0;

  const {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    highScore,
    streak,
    actionMessage,
    winner,
    finalScore,
    countdown,
    startGame,
    handleAction,
    restartGame,
    visualEffect,
    isPaused,
    togglePause,
    lives,
    speedMultiplier,
    survivalThreshold,
    targetOffset,
    adrenaline,
    isFeverActive,
    goldenThreshold,
  } = useGameLogic({
    gameMode: "survival",
    initialTime: 9999,
  });

  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  const scoreDisplay = (
    <div className="flex flex-col items-center">
      {/* Can Göstergesi */}
      <div className="text-4xl mb-2 drop-shadow-md animate-pulse">
        {renderHearts(lives)}
      </div>

      {/* Seri Bilgisi */}
      <div className="text-3xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
        SERİ: {streak}
      </div>

      {/* Detay Bilgi */}
      <div className="flex gap-3 mt-2 text-xs font-mono font-bold">
        <span className="bg-gray-800/80 px-2 py-1 rounded text-yellow-400 border border-yellow-600/30">
          ⚡ HIZ: {speedMultiplier.toFixed(2)}x
        </span>
        <span className="bg-gray-800/80 px-2 py-1 rounded text-green-400 border border-green-600/30">
          🎯 HEDEF: {survivalThreshold.toFixed(0)}ms
        </span>
      </div>
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
      showThemeButton={false}
      isTwoPlayerMode={false}
      bottomInfo="SURVIVAL MODE"
    >
      {/* FEVER EFEKT KATMANI */}
      {isFeverActive && (
        <div className="fixed inset-0 z-0 pointer-events-none animate-pulse">
          <div className="absolute inset-0 border-20 border-yellow-500/30 blur-sm"></div>
          <div className="absolute inset-0 bg-yellow-900/20 mix-blend-overlay"></div>
        </div>
      )}

      {/* Hazırlık Ekranı */}
      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-black/60 p-10 rounded-3xl border border-red-900/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl">
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase drop-shadow-md">
            HAYATTA KALMA
          </h2>
          <p className="text-center text-gray-400 text-sm leading-relaxed">
            3 Canın var.
            <br />
            Sarı alanı vurursan Adrenalin dolar.
            <br />
            Bar dolunca FEVER modu açılır!
          </p>

          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="w-full py-4 rounded-xl text-lg font-bold transition-all bg-red-900/20 border border-red-500/50 text-red-400 hover:bg-red-900/40 hover:text-red-200 hover:border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] cursor-pointer active:scale-95"
          >
            {playerReady ? "HAZIRLANIYOR..." : "MEYDAN OKU"}
          </button>
          <button
            onClick={handleBackToMenu}
            className="text-gray-600 hover:text-gray-400 text-xs tracking-widest uppercase mt-2 transition-colors"
          >
            ← Menüye Dön
          </button>
        </div>
      )}

      {/* Geri Sayım */}
      {countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-[2px]">
          <div className="text-9xl font-black text-red-500 animate-ping drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">
            {countdown}
          </div>
        </div>
      )}

      {/* Oyun Alanı */}
      {gameState === "playing" && (
        <>
          <div className="mt-24 relative w-full max-w-lg flex flex-col items-center z-10">
            {/* ADRENALİN BARI */}
            <div className="w-full flex items-center gap-2 mb-2 px-4">
              <span
                className={`text-xs font-bold w-16 ${
                  isFeverActive
                    ? "text-yellow-300 animate-bounce"
                    : "text-yellow-500"
                }`}
              >
                {isFeverActive ? "FEVER!" : "ADRENALİN"}
              </span>

              <div
                className={`flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border ${
                  isFeverActive
                    ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]"
                    : "border-gray-700"
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    isFeverActive
                      ? "bg-yellow-400 w-full animate-pulse"
                      : "bg-linear-to-r from-yellow-600 via-orange-500 to-red-500"
                  }`}
                  style={{ width: isFeverActive ? "100%" : `${adrenaline}%` }}
                />
              </div>
              <span className="text-xs font-bold text-yellow-500 w-8 text-right">
                {isFeverActive ? "∞" : `%${adrenaline}`}
              </span>
            </div>

            <TimerDisplay
              totalMs={gameTimeMs}
              targetOffset={targetOffset}
              threshold={survivalThreshold}
              goldenThreshold={goldenThreshold}
            />
          </div>

          <div
            className={`text-lg md:text-2xl mt-8 text-center font-bold px-4 h-8 tracking-wide drop-shadow-sm transition-colors ${
              lives === 1 ? "text-red-600 animate-ping" : "text-red-400"
            }`}
          >
            {actionMessage}
          </div>

          <TurnInfo currentPlayer="Hayatta Kal" turnTimeLeft={turnTimeLeft} />
          <div className="flex justify-center w-full px-4 mt-12">
            <ActionButton
              onClick={handleAction}
              disabled={isPaused}
              customColor="bg-red-950 border border-red-600/50 text-red-100 hover:bg-red-900 hover:border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.15)]"
            />
          </div>
          <div className="mt-8 text-gray-600 text-xs uppercase tracking-[0.2em] animate-pulse hidden md:block">
            [SPACE] TUŞU İLE OYNA
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

export default SurvivalMode;
