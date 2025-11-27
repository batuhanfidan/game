import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../components/game/TimerDisplay";
import PlayerTimer from "../../components/layout/PlayerTimer";
import ActionButton from "../../components/game/ActionButton";
import GameOverModal from "../../components/common/GameOverModal";
import GameLayout from "../../components/layout/GameLayout";
import { useGameLogic } from "../../hooks/useGameLogic";
import { THEMES } from "../../utils/constants";
import { Timer, ArrowLeft, Trophy } from "lucide-react";

const TimeAttackMode = () => {
  const navigate = useNavigate();
  const [playerReady, setPlayerReady] = useState(false);

  const themeIndex = THEMES.findIndex((t) => t.name === "Zamana Karşı");
  const currentTheme = themeIndex !== -1 ? themeIndex : 0;

  const {
    gameState,
    gameTimeMs,
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
    visualEffect,
    isPaused,
    togglePause,
  } = useGameLogic({
    gameMode: "time_attack",
    initialTime: 60,
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
      <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] tracking-tighter flex items-center gap-3">
        <Trophy size={48} /> {scores.p1}
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
      bottomInfo="TIME ATTACK MODE"
    >
      {/* Hazırlık */}
      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-black/60 p-10 rounded-3xl border border-cyan-900/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl">
          <h2 className="text-2xl font-black text-cyan-400 tracking-widest uppercase drop-shadow-md flex items-center gap-3">
            <Timer size={28} /> ZAMANA KARŞI
          </h2>
          <p className="text-center text-gray-400 text-sm leading-relaxed">
            60 Saniye içinde
            <br />
            atabildiğin kadar gol at!
          </p>
          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="w-full py-4 rounded-xl text-lg font-bold transition-all bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-200 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] cursor-pointer active:scale-95"
          >
            {playerReady ? "HAZIRLANIYOR..." : "BAŞLA"}
          </button>
          <button
            onClick={handleBackToMenu}
            className="text-gray-600 hover:text-gray-400 text-xs tracking-widest uppercase mt-2 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Menüye Dön
          </button>
        </div>
      )}

      {/* Geri Sayım */}
      {countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-[2px]">
          <div className="text-9xl font-black text-cyan-400 animate-ping drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
            {countdown}
          </div>
        </div>
      )}
      {/* Oyun Alanı */}
      {gameState === "playing" && (
        <>
          <div className="absolute top-36 w-full flex justify-center opacity-90 z-0">
            <PlayerTimer
              player="⏱️ KALAN SÜRE"
              minutes={Math.floor(playerTimes.p1 / 60)}
              seconds={playerTimes.p1 % 60}
            />
          </div>

          <div className="mt-32">
            <TimerDisplay totalMs={gameTimeMs} />
          </div>

          <div className="text-lg md:text-2xl mt-8 text-center font-medium px-4 h-8 text-cyan-300 tracking-wide drop-shadow-sm">
            {actionMessage}
          </div>

          <div className="flex justify-center w-full px-4 mt-12">
            <ActionButton
              onClick={handleAction}
              disabled={isPaused}
              customColor="bg-slate-800 border border-cyan-500/50 text-cyan-100 hover:bg-slate-700 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
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

export default TimeAttackMode;
