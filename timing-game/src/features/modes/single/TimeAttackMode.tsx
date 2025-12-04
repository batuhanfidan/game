import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../../components/game/TimerDisplay";
import PlayerTimer from "../../../components/layout/PlayerTimer";
import ActionButton from "../../../components/common/ActionButton";
import GameOverModal from "../../../components/common/GameOverModal";
import GameLayout from "../../../components/layout/GameLayout";
import { useGameLogic } from "../../../hooks/useGameLogic";
import { THEMES } from "../../../shared/constants/ui";
import { GameProvider } from "../../../context/GameContext";
import { Timer, ArrowLeft, Trophy, Flame } from "lucide-react";

const TimeAttackMode = () => {
  const navigate = useNavigate();
  const [playerReady, setPlayerReady] = useState(false);

  const themeIndex = THEMES.findIndex((t) => t.name === "Zamana Karşı");
  const currentTheme = themeIndex !== -1 ? themeIndex : 0;

  const gameLogic = useGameLogic({
    gameMode: "time_attack",
    initialTime: 60,
  });

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
    isPaused,

    targetOffset,
    combo,
    multiplier,
    timeTargetWidth,
    timeBossActive,
    timeBossPosition,
    isTimeAttackFever,
    timeChangePopup,
  } = gameLogic;

  const handleBackToMenu = () => navigate("/", { replace: true });

  const isLowTime = playerTimes.p1 <= 10;
  const isFever = isTimeAttackFever;

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  const scoreDisplay = (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] tracking-tighter flex items-center gap-3">
        <Trophy size={48} /> {scores.p1}
      </div>

      {/* Kombo Göstergesi */}
      {combo > 1 && (
        <div className={`mt-2 ${isTimeAttackFever ? "animate-bounce" : ""}`}>
          <div
            className={`flex items-center gap-2 transition-transform duration-300 ${
              isTimeAttackFever ? "scale-110" : "scale-100"
            }`}
          >
            <span
              className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border ${
                isTimeAttackFever
                  ? "bg-red-600 border-red-400"
                  : "bg-orange-500 border-orange-400"
              }`}
            >
              {combo} KOMBO
            </span>
            {isTimeAttackFever && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-yellow-300 animate-pulse flex items-center gap-1">
                <Flame size={12} fill="black" /> FEVER!
              </span>
            )}
            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-purple-400">
              {multiplier}x PUAN
            </span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-300 mt-2 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md font-medium">
        EN YÜKSEK:{" "}
        <span className="text-white font-bold ml-1">{highScore}</span>
      </div>
    </div>
  );

  return (
    <GameProvider
      {...gameLogic}
      currentTheme={currentTheme}
      isTwoPlayerMode={false}
      scoreDisplay={scoreDisplay}
      bottomInfo="HARDCORE TIME ATTACK"
      showThemeButton={false}
    >
      <GameLayout>
        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-500 z-0
            ${
              isLowTime && gameState === "playing" ? "opacity-100" : "opacity-0"
            }
        `}
        >
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(220,38,38,0.6)] animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-red-600/50"></div>
        </div>

        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-700 z-0
            ${isFever ? "opacity-100" : "opacity-0"}
        `}
        >
          <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen animate-pulse"></div>
          <div className="absolute top-0 w-full h-2 bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,1)]"></div>
          <div className="absolute bottom-0 w-full h-2 bg-cyan-400 shadow-[0_0_40px_rgba(34,211,238,1)]"></div>
        </div>

        {gameState === "idle" && !countdown && (
          <div className="flex flex-col items-center gap-6 z-20 bg-black/80 p-8 md:p-10 rounded-3xl border border-cyan-900/30 shadow-2xl max-w-sm w-full mx-4 backdrop-blur-xl animate-popup">
            <h2 className="text-2xl font-black text-cyan-400 tracking-widest uppercase drop-shadow-md flex items-center gap-3">
              <Timer size={28} /> ZAMANA KARŞI
            </h2>

            <div className="text-center text-gray-300 text-sm leading-relaxed space-y-2">
              <p>Hedefi tam ortadan vur!</p>
              <p className="text-green-400 font-bold">GOL = PUAN & SÜRE</p>
              <p className="text-red-400 font-bold">KIRMIZI = -10 SN CEZA!</p>
            </div>
            <button
              onClick={() => setPlayerReady(true)}
              disabled={playerReady}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-200 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] cursor-pointer active:scale-95"
            >
              {playerReady ? "HAZIRLANIYOR..." : "BAŞLA"}
            </button>
            <button
              onClick={handleBackToMenu}
              className="text-gray-500 hover:text-gray-300 text-xs tracking-widest uppercase mt-2 transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Menüye Dön
            </button>
          </div>
        )}

        {countdown !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-[2px]">
            <div className="text-9xl font-black text-cyan-400 animate-ping drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]">
              {countdown}
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <>
            <div className="absolute top-28 md:top-36 w-full flex justify-center opacity-90 z-10">
              <div className="relative">
                <PlayerTimer
                  player={
                    <span
                      className={
                        playerTimes.p1 < 10
                          ? "text-red-500 animate-pulse font-bold"
                          : "text-white"
                      }
                    >
                      ⏱️ KALAN SÜRE
                    </span>
                  }
                  minutes={Math.floor(playerTimes.p1 / 60)}
                  seconds={playerTimes.p1 % 60}
                />

                {timeChangePopup && (
                  <div
                    key={timeChangePopup.id}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-2xl font-black whitespace-nowrap animate-popup
                        ${
                          timeChangePopup.type === "positive"
                            ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                            : "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                        }`}
                  >
                    {timeChangePopup.type === "positive" ? "+" : ""}
                    {timeChangePopup.value}sn
                  </div>
                )}
              </div>
            </div>

            <div className="mt-32 w-full flex justify-center">
              <TimerDisplay
                totalMs={gameTimeMs}
                targetOffset={targetOffset}
                threshold={timeTargetWidth}
                redTarget={timeBossActive ? timeBossPosition : null}
              />
            </div>

            <div className="text-lg md:text-2xl mt-8 text-center font-medium px-4 h-8 text-cyan-300 tracking-wide drop-shadow-sm truncate w-full">
              {actionMessage}
            </div>

            <div className="flex justify-center w-full px-4 mt-8 md:mt-12">
              <ActionButton
                onClick={handleAction}
                disabled={isPaused}
                customText={isFever ? "FEVER!" : "VUR!"}
                customColor={
                  isFever
                    ? "bg-cyan-600 hover:bg-cyan-500 border-2 border-white shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                    : "bg-slate-800 border border-cyan-500/50 text-cyan-100 hover:bg-slate-700 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] active:bg-cyan-900"
                }
              />
            </div>

            <div className="mt-8 text-gray-500 text-[10px] uppercase tracking-[0.2em] animate-pulse hidden md:block">
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
    </GameProvider>
  );
};

export default TimeAttackMode;
