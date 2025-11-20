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
    initialTime: 60, // 60 Saniye
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
      className={`h-screen w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 bg-cyan-950 ${
        visualEffect?.type === "goal" ? "animate-shake" : ""
      }`}
    >
      <VisualEffectOverlay effect={visualEffect} isTwoPlayerMode={false} />

      {gameState === "playing" && (
        <button
          onClick={togglePause}
          className="absolute top-4 left-4 z-[60] bg-gray-700/80 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg hover:scale-110"
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

      <div className="absolute top-4 right-4 z-[60] flex flex-col items-end">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-2xl font-bold border border-gray-500 shadow-lg active:scale-95"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <div
          className={`flex-col md:flex-row gap-2 mt-2 md:mt-0 ${
            isMenuOpen ? "flex" : "hidden"
          } md:flex transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={handleMuteToggle}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md"
          >
            ?
          </button>
        </div>
      </div>
      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
        <div className="text-4xl font-black text-cyan-400 drop-shadow-lg">
          SKOR: {scores.p1}
        </div>
        <div className="text-sm text-gray-400 mt-1 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
          ⭐ En Yüksek:{" "}
          <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>

      <div className="absolute top-32 w-full flex justify-center">
        <PlayerTimer
          player="⏱️ SÜRE"
          minutes={Math.floor(playerTimes.p1 / 60)}
          seconds={playerTimes.p1 % 60}
        />
      </div>

      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-neutral-900 p-8 rounded-2xl border border-cyan-700 shadow-2xl max-w-sm w-full mx-4">
          <h2 className="text-3xl font-black text-cyan-400 tracking-tighter">
            ZAMANA KARŞI
          </h2>
          <p className="text-center text-gray-400 text-sm">
            60 Saniye içinde atabildiğin kadar at!
          </p>

          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="px-10 py-4 rounded-xl text-xl font-bold transition w-full bg-cyan-600 hover:bg-cyan-500 cursor-pointer hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            {playerReady ? "Hazırlanıyor..." : "BAŞLA"}
          </button>
          <button
            onClick={handleBackToMenu}
            className="text-gray-500 hover:text-white text-sm underline cursor-pointer mt-2"
          >
            🔙 Menüye Dön
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="text-8xl font-black text-cyan-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {countdown}
        </div>
      )}

      {gameState === "playing" && (
        <>
          <TimerDisplay totalMs={gameTimeMs} />
          <div className="text-xl md:text-2xl mt-6 text-center font-bold px-4 h-8 text-cyan-300 drop-shadow-sm">
            {actionMessage}
          </div>

          <div className="flex justify-center w-full px-4 mt-10">
            <ActionButton
              onClick={handleAction}
              disabled={isPaused}
              customColor="bg-cyan-600 hover:bg-cyan-500"
            />
          </div>

          <div className="mt-6 text-gray-500 text-sm animate-pulse font-semibold hidden md:block">
            [SPACE] tuşu ile oyna
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
    </div>
  );
};

export default TimeAttackMode;
