import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../components/game/TimerDisplay";
import ActionButton from "../../components/game/ActionButton";
import GameOverModal from "../../components/common/GameOverModal";
import GameLayout from "../../components/layout/GameLayout";
import { useGameLogic } from "../../hooks/useGameLogic";
import { THEMES, UI_CONSTANTS } from "../../utils/constants";
import {
  Heart,
  Shield,
  Zap,
  Flame,
  Timer,
  Play,
  ArrowLeft,
  AlertTriangle,
  Skull,
} from "lucide-react";

const LivesDisplay = memo(
  ({ lives, maxLives }: { lives: number; maxLives: number }) => (
    <div className="flex gap-1">
      {Array.from({ length: maxLives }, (_, i) => (
        <Heart
          key={i}
          size={UI_CONSTANTS.HEART_ICON_SIZE}
          className={`transition-all duration-300 ${
            i < lives
              ? "fill-[#ef4444] text-[#ef4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              : "fill-[#27272a] text-[#27272a]"
          }`}
        />
      ))}
    </div>
  )
);

LivesDisplay.displayName = "LivesDisplay";

const SurvivalMode = () => {
  const navigate = useNavigate();
  const [playerReady, setPlayerReady] = useState(false);

  const themeIndex = THEMES.findIndex((t) => t.name === "Hayatta Kalma");
  const currentTheme = themeIndex !== -1 ? themeIndex : 0;

  const {
    gameState,
    gameTimeMs,
    turnTimeLeft,
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
    isSurvivalFever,
    goldenThreshold,
    hasShield,
    activeCurse,
    redTarget,
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

  const scoreDisplay =
    gameState === "idle" && countdown === null ? null : (
      <div className="flex flex-col items-center gap-2 animate-fade-in">
        {/* Canlar */}
        <div className="mb-1 animate-pulse flex items-center gap-4">
          <LivesDisplay
            lives={lives}
            maxLives={UI_CONSTANTS.MAX_LIVES_DISPLAY}
          />
          {hasShield && (
            <div className="animate-bounce bg-[#1d4ed8]/20 p-1.5 rounded-full border border-[#1d4ed8]">
              <Shield size={24} className="text-[#3b82f6] fill-[#3b82f6]" />
            </div>
          )}
        </div>

        {/* Seri Bilgisi */}
        <div className="text-4xl font-black text-[#ef4444] drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] tracking-tighter flex items-center gap-2">
          <Flame
            size={32}
            className={
              isSurvivalFever
                ? "text-[#f59e0b] fill-[#f59e0b] animate-bounce"
                : "text-[#ef4444]"
            }
          />
          SERİ: {streak}
        </div>

        {/* Detay Bilgi */}
        <div className="flex gap-2 mt-1 text-xs font-mono font-bold">
          <span className="bg-[#27272a] px-2 py-1 rounded text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
            <Zap size={12} /> HIZ: {speedMultiplier.toFixed(2)}x
          </span>
          <span className="bg-[#27272a] px-2 py-1 rounded text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
            <Timer size={12} /> HEDEF: {survivalThreshold.toFixed(0)}ms
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
      {isSurvivalFever && (
        <div className="fixed inset-0 z-0 pointer-events-none animate-pulse">
          <div className="absolute inset-0 border-20 border-[#f59e0b]/20 blur-sm"></div>
          <div className="absolute inset-0 bg-[#f59e0b]/5 mix-blend-overlay"></div>
        </div>
      )}

      {gameState === "idle" && !countdown && (
        <div className="flex flex-col items-center gap-6 z-20 bg-[#09090b]/90 p-8 rounded-3xl border border-[#ef4444]/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl animate-popup">
          {/* ... Hazırlık ekranı ... */}
          <div className="bg-[#ef4444]/10 p-4 rounded-full border border-[#ef4444]/20">
            <Skull size={48} className="text-[#ef4444]" />
          </div>
          <h2 className="text-2xl font-black text-[#e4e4e7] tracking-[0.2em] uppercase">
            HAYATTA KAL
          </h2>
          <div className="text-center text-[#a1a1aa] text-sm space-y-2 font-medium">
            <p className="flex items-center justify-center gap-2">
              <Heart size={14} className="text-[#ef4444]" /> 3 Canın var,
              dikkatli ol.
            </p>
            <p className="flex items-center justify-center gap-2">
              <Flame size={14} className="text-[#f59e0b]" /> Her 15 turda bir{" "}
              <span className="text-[#f59e0b] font-bold">LANET</span> başlar.
            </p>
          </div>
          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className="group w-full py-4 rounded-xl text-lg font-bold transition-all bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Play size={20} className="fill-current" />
            {playerReady ? "HAZIRLANIYOR..." : "MEYDAN OKU"}
          </button>
          <button
            onClick={handleBackToMenu}
            className="text-[#71717a] hover:text-[#e4e4e7] text-xs tracking-widest uppercase mt-2 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Menüye Dön
          </button>
        </div>
      )}

      {countdown !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-[2px]">
          <div className="text-9xl font-black text-[#ef4444] animate-ping drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] font-mono">
            {countdown}
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="mt-24 relative w-full max-w-lg flex flex-col items-center z-10">
            {/* ADRENALİN BARI */}
            <div className="w-full flex items-center gap-3 mb-3 px-4">
              <span
                className={`text-[10px] font-black w-16 tracking-widest ${
                  isSurvivalFever
                    ? "text-[#f59e0b] animate-bounce"
                    : "text-[#71717a]"
                }`}
              >
                {isSurvivalFever ? "FEVER!" : "ADRENALİN"}
              </span>

              <div
                className={`flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden border ${
                  isSurvivalFever
                    ? "border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "border-[#3f3f46]"
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    isSurvivalFever
                      ? "bg-[#f59e0b] w-full animate-pulse"
                      : "bg-linear-to-r from-[#f59e0b] to-[#ef4444]"
                  }`}
                  style={{ width: isSurvivalFever ? "100%" : `${adrenaline}%` }}
                />
              </div>
            </div>

            <TimerDisplay
              totalMs={gameTimeMs}
              targetOffset={targetOffset}
              threshold={survivalThreshold}
              goldenThreshold={goldenThreshold}
              isCursed={activeCurse === "REVERSE"}
              redTarget={redTarget}
              disableTransition={activeCurse === "MOVING_TARGET"}
            />
            {/* Lanet Uyarısı */}
            {activeCurse && (
              <div
                className={`mt-4 flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm animate-pulse border ${
                  activeCurse === "REVERSE"
                    ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/50"
                    : activeCurse === "UNSTABLE"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/50"
                    : "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/50"
                }`}
              >
                <AlertTriangle size={18} />
                {activeCurse === "REVERSE"
                  ? "LANET: TERS AKINTI"
                  : activeCurse === "UNSTABLE"
                  ? "LANET: DENGESİZ HIZ"
                  : "LANET: GEZİCİ HEDEF"}
              </div>
            )}
          </div>

          <div
            className={`text-xl mt-8 text-center font-bold px-4 h-8 tracking-wide drop-shadow-sm transition-colors ${
              lives === 1 ? "text-[#ef4444] animate-ping" : "text-[#e4e4e7]"
            }`}
          >
            {actionMessage}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 text-[#a1a1aa] text-sm font-mono">
            <div className="flex items-center gap-2">
              <Shield size={16} /> <span>HAYATTA KAL</span>
            </div>
            <div className="w-px h-4 bg-[#3f3f46]"></div>
            <div className="flex items-center gap-2">
              <Timer size={16} /> <span>{turnTimeLeft}s</span>
            </div>
          </div>

          <div className="flex justify-center w-full px-4 mt-10">
            <ActionButton
              onClick={handleAction}
              disabled={isPaused}
              customText="VUR!"
              customColor="bg-[#27272a] border border-[#ef4444]/50 text-[#ef4444] hover:bg-[#ef4444] hover:text-white shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-200"
            />
          </div>

          <div className="mt-6 text-[#52525b] text-[10px] uppercase tracking-[0.3em] animate-pulse hidden md:block">
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
