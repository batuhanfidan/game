import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/game/TimerDisplay";
import ActionButton from "../components/game/ActionButton";
import TurnInfo from "../components/layout/TurnInfo";
import GameOverModal from "../components/common/GameOverModal";
import GameLayout from "../components/layout/GameLayout";
import { useGameLogic } from "../hooks/useGameLogic";
import { THEMES } from "../utils/constants";

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
      <div className="text-5xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] tracking-tighter animate-pulse">
        SERİ: {streak}
      </div>
      <div className="text-xs text-gray-500 mt-2 bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md">
        EN YÜKSEK: <span className="text-gray-300 font-bold">{highScore}</span>
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
      {/* Hazırlık Ekranı */}
      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-black/60 p-10 rounded-3xl border border-red-900/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl">
          <h2 className="text-2xl font-black text-red-500 tracking-widest uppercase drop-shadow-md">
            HAYATTA KALMA
          </h2>
          <p className="text-center text-gray-400 text-sm leading-relaxed">
            Tek bir hata yaparsan oyun biter.
            <br />
            Ne kadar dayanabilirsin?
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
        <div className="text-9xl font-black text-red-600 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-overlay">
          {countdown}
        </div>
      )}

      {/* Oyun Alanı */}
      {gameState === "playing" && (
        <>
          <div className="mt-16">
            <TimerDisplay totalMs={gameTimeMs} />
          </div>
          <div className="text-lg md:text-2xl mt-8 text-center font-bold px-4 h-8 text-red-400 tracking-wide drop-shadow-sm">
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
