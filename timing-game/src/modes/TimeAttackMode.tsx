import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../components/TimerDisplay";
import PlayerTimer from "../components/PlayerTimer";
import ActionButton from "../components/ActionButton";
import GameOverModal from "../components/GameOverModal";
import RulesModal from "../components/RulesModel";
import VisualEffectOverlay from "../components/VisualEffectOverlay";
import PauseMenu from "../components/PauseMenu";
import { useGameLogic } from "../hooks/useGameLogic";
import { toggleMute, getMuteStatus } from "../utils/sound";

// Tema: Koyu Gece Mavisi (Slate)
const THEMES = [{ name: "Zamana Karşı", class: "bg-slate-950" }];

const TimeAttackMode = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

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

  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  return (
    <div
      className={`h-screen w-screen text-gray-200 flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${
        THEMES[0].class
      } ${visualEffect?.type === "goal" ? "animate-shake" : ""}`}
    >
      <VisualEffectOverlay effect={visualEffect} isTwoPlayerMode={false} />

      {gameState === "playing" && (
        <button
          onClick={togglePause}
          className="absolute top-6 left-6 z-[60] bg-slate-800/50 hover:bg-slate-700 text-white border border-white/10 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm transition-all hover:scale-105"
        >
          ⏸
        </button>
      )}

      {isPaused && (
        <PauseMenu
          onResume={togglePause}
          onRestart={restartGame}
          onQuit={handleBackToMenu}
        />
      )}

      <div className="absolute top-6 right-6 z-[60] flex flex-col items-end">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden bg-slate-800 text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl border border-white/10 shadow-lg active:scale-95"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <div
          className={`flex-col md:flex-row gap-3 mt-3 md:mt-0 ${
            isMenuOpen ? "flex" : "hidden"
          } md:flex transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={handleMuteToggle}
            className="bg-slate-900/80 border border-white/10 hover:bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-md backdrop-blur-sm transition-colors"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-slate-900/80 border border-white/10 hover:bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-md backdrop-blur-sm transition-colors"
          >
            ?
          </button>
        </div>
      </div>

      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* Skor Tablosu */}
      <div className="absolute top-6 w-full flex flex-col items-center z-10 pointer-events-none">
        <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] tracking-tighter">
          {scores.p1}
        </div>
        <div className="text-xs text-gray-500 mt-2 bg-black/40 px-4 py-1 rounded-full border border-white/5 backdrop-blur-md">
          EN YÜKSEK:{" "}
          <span className="text-gray-300 font-bold">{highScore}</span>
        </div>
      </div>

      <div className="absolute top-36 w-full flex justify-center opacity-90">
        <PlayerTimer
          player="⏱️ KALAN SÜRE"
          minutes={Math.floor(playerTimes.p1 / 60)}
          seconds={playerTimes.p1 % 60}
        />
      </div>

      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-black/60 p-10 rounded-3xl border border-cyan-900/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl">
          <h2 className="text-2xl font-black text-cyan-400 tracking-widest uppercase drop-shadow-md">
            ZAMANA KARŞI
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
            className="text-gray-600 hover:text-gray-400 text-xs tracking-widest uppercase mt-2 transition-colors"
          >
            ← Menüye Dön
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="text-9xl font-black text-cyan-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-overlay">
          {countdown}
        </div>
      )}

      {gameState === "playing" && (
        <>
          <TimerDisplay totalMs={gameTimeMs} />

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
      <div className="absolute bottom-6 text-[10px] text-cyan-900/40 font-mono font-bold tracking-[0.3em]">
        TIME ATTACK MODE
      </div>
    </div>
  );
};

export default TimeAttackMode;
