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
import { Timer, ArrowLeft, Trophy, Flame, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const TimeAttackMode = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const feverProgress = isFever ? 100 : (combo % 10) * 10;

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
              {combo} {t("time_attack.labels.combo")}
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
        {t("time_attack.labels.high_score")}:
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
              <Timer size={28} /> {t("time_attack.title")}
            </h2>

            <div className="text-center text-gray-300 text-sm leading-relaxed space-y-2">
              <p>{t("time_attack.rules.hint")}</p>
              <p className="text-green-400 font-bold">
                {t("time_attack.rules.goal")}
              </p>
              <p className="text-red-400 font-bold">
                {t("time_attack.rules.red_penalty")}
              </p>
            </div>
            <button
              onClick={() => setPlayerReady(true)}
              disabled={playerReady}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-200 hover:border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] cursor-pointer active:scale-95"
            >
              {playerReady
                ? t("survival.buttons.prepare")
                : t("time_attack.buttons.start")}
            </button>
            <button
              onClick={handleBackToMenu}
              className="text-gray-500 hover:text-gray-300 text-xs tracking-widest uppercase mt-2 transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} /> {t("components.pause.menu")}
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
                      ⏱️ {t("time_attack.labels.remaining_time")}
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

            <div className="mt-32 w-full flex flex-col items-center justify-center max-w-lg mx-auto">
              <div className="w-full px-4 mb-2 flex items-center gap-3">
                <span
                  className={`text-[10px] font-black w-12 tracking-widest ${
                    isFever ? "text-yellow-400 animate-pulse" : "text-cyan-600"
                  }`}
                >
                  FEVER
                </span>
                <div
                  className={`flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden border ${
                    isFever
                      ? "border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                      : "border-cyan-900/30"
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-300 ease-out ${
                      isFever
                        ? "bg-yellow-400 w-full animate-pulse"
                        : "bg-cyan-500"
                    }`}
                    style={{ width: `${feverProgress}%` }}
                  />
                </div>
                {isFever && (
                  <Zap
                    size={14}
                    className="text-yellow-400 animate-bounce"
                    fill="currentColor"
                  />
                )}
              </div>

              <TimerDisplay
                totalMs={gameTimeMs}
                targetOffset={targetOffset}
                threshold={timeTargetWidth}
                redTarget={timeBossActive ? timeBossPosition : null}
                goldenThreshold={20}
              />
            </div>

            <div
              className={`text-lg md:text-2xl mt-8 text-center font-medium px-4 h-8 tracking-wide drop-shadow-sm truncate w-full flex items-center justify-center gap-2 ${
                actionMessage.className || "text-cyan-300"
              }`}
            >
              {actionMessage.icon && (
                <actionMessage.icon size={24} className="inline-block" />
              )}
              {actionMessage.text}
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
              {/* {t("survival.buttons.space_hint")} */}
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
