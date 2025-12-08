import { useState, useEffect } from "react";
import TimerDisplay from "../../../components/game/TimerDisplay";
import PlayerTimer from "../../../components/layout/PlayerTimer";
import ActionButton from "../../../components/common/ActionButton";
import TurnInfo from "../../../components/layout/TurnInfo";
import GameOverModal from "../../../components/common/GameOverModal";
import VariantIcon from "../../../components/game/VariantIcon";

import { useGameLogic } from "../../../hooks/useGameLogic";
import { VARIANTS } from "../../../shared/constants/game";
import type { GameVariant } from "../../../shared/types";
import { Trophy, User, ArrowLeft, Clock, Settings2 } from "lucide-react";
import GameLayout from "../../../components/layout/GameLayout";
import { GameProvider } from "../../../context/GameContext";
import { useTheme } from "../../../hooks/core/useTheme";
import { useTranslation } from "react-i18next";

const TwoPlayerMode = () => {
  const { t } = useTranslation();
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");
  const [gameDuration, setGameDuration] = useState(180);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const { currentTheme, nextTheme, theme } = useTheme(0);

  useEffect(() => {
    if (selectedVariant === "moving") setShowProgressBar(true);
  }, [selectedVariant]);

  const gameLogic = useGameLogic({
    gameMode: "classic",
    gameVariant: selectedVariant,
    initialTime: gameDuration,
  });

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
    setPlayerNames,
    playerNames,
    isPaused,
    targetOffset,
  } = gameLogic;

  const [p1Ready, setP1Ready] = useState(false);
  const [p2Ready, setP2Ready] = useState(false);

  useEffect(() => {
    if (p1Ready && p2Ready && gameState === "idle") startGame();
  }, [p1Ready, p2Ready, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") {
      setP1Ready(false);
      setP2Ready(false);
    }
  }, [gameState]);

  const scoreDisplay = gameState !== "idle" && (
    <div className="text-2xl md:text-3xl font-black text-yellow-400 drop-shadow-lg flex items-center gap-3 px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
      <Trophy size={24} />
      <span>
        {scores.p1} - {scores.p2}
      </span>
    </div>
  );

  return (
    <GameProvider
      {...gameLogic}
      currentTheme={currentTheme}
      isTwoPlayerMode={true}
      scoreDisplay={scoreDisplay}
      bottomInfo={`🎯 Tema: ${theme.name}`}
      onThemeChange={nextTheme}
    >
      <GameLayout>
        {/* OYUNCU SÜRELERİ (Sadece Oyun Başlayınca) */}
        {gameState === "playing" && (
          <div className="absolute top-16 sm:top-20 md:top-32 flex justify-between w-full px-2 sm:px-4 md:px-20 text-xs sm:text-sm md:text-xl font-bold text-gray-300">
            <PlayerTimer
              player={
                <span className="flex items-center gap-1 sm:gap-2">
                  <User size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">
                    {playerNames.p1}
                  </span>
                  <span className="inline xs:hidden sm:hidden">
                    {playerNames.p1.slice(0, 8)}
                  </span>
                </span>
              }
              minutes={Math.floor(playerTimes.p1 / 60)}
              seconds={playerTimes.p1 % 60}
            />
            <PlayerTimer
              player={
                <span className="flex items-center gap-1 sm:gap-2">
                  <User size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">
                    {playerNames.p2}
                  </span>
                  <span className="inline xs:hidden sm:hidden">
                    {playerNames.p2.slice(0, 8)}
                  </span>
                </span>
              }
              minutes={Math.floor(playerTimes.p2 / 60)}
              seconds={playerTimes.p2 % 60}
            />
          </div>
        )}

        {/* HAZIRLIK EKRANI */}
        {gameState === "idle" && !countdown && (
          <>
            <button
              onClick={() => (window.location.href = "/")}
              className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm group"
            >
              <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/20">
                <ArrowLeft size={20} />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-2 group-hover:ml-0">
                {t("components.pause.menu")}
              </span>
            </button>
            <div className="relative z-20 flex flex-col w-full max-w-3xl mx-auto px-4 animate-fade-in md:-mt-20">
              {/* Kart Başlığı */}
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center justify-center gap-2 md:gap-3">
                  <span className="text-emerald-400 text-3xl sm:text-4xl md:text-5xl">
                    1
                  </span>
                  <span className="text-white/30 text-2xl sm:text-2xl md:text-3xl">
                    vs
                  </span>
                  <span className="text-cyan-400 text-3xl sm:text-4xl md:text-5xl">
                    1
                  </span>
                </h2>
                <p className="text-blue-200/50 text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] mt-2 md:mt-3 uppercase">
                  Local Multiplayer
                </p>
              </div>

              {/* Ayarlar Paneli */}
              <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-2xl space-y-5 sm:space-y-6 md:space-y-8">
                {/* İsim Girişleri */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                    <User size={14} className="sm:w-4 sm:h-4" />{" "}
                    {t("setup.players")}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-black/20 p-2.5 sm:p-3 rounded-xl">
                    <input
                      type="text"
                      value={playerNames.p1}
                      onChange={(e) =>
                        setPlayerNames((p) => ({ ...p, p1: e.target.value }))
                      }
                      className="w-full sm:flex-1 bg-emerald-950/20 border border-emerald-500/30 focus:border-emerald-500 text-center text-emerald-100 font-bold py-3 sm:py-4 rounded-lg outline-none transition-all placeholder:text-emerald-500/30 text-sm sm:text-base"
                      placeholder="Oyuncu 1"
                    />
                    <div className="text-white/20 font-black text-xs sm:text-sm">
                      VS
                    </div>
                    <input
                      type="text"
                      value={playerNames.p2}
                      onChange={(e) =>
                        setPlayerNames((p) => ({ ...p, p2: e.target.value }))
                      }
                      className="w-full sm:flex-1 bg-cyan-950/20 border border-cyan-500/30 focus:border-cyan-500 text-center text-cyan-100 font-bold py-3 sm:py-4 rounded-lg outline-none transition-all placeholder:text-cyan-500/30 text-sm sm:text-base"
                      placeholder="Oyuncu 2"
                    />
                  </div>
                </div>

                {/* Ayarlar Grid */}
                <div className="space-y-5 sm:space-y-6 md:space-y-8">
                  {/* 1. Oyun Modu */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <Settings2 size={14} className="sm:w-4 sm:h-4" />{" "}
                      {t("setup.game_type")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      {VARIANTS.map((v) => (
                        <button
                          key={v.key}
                          onClick={() => setSelectedVariant(v.key)}
                          className={`
                          p-3 sm:p-4 rounded-xl border text-left transition-all group
                          ${
                            selectedVariant === v.key
                              ? "bg-gray-800 border-blue-500/50 shadow-lg shadow-green-900/20"
                              : "bg-gray-800/50 border-transparent hover:bg-gray-800"
                          }
                        `}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`p-2 sm:p-2.5 rounded-lg ${
                                selectedVariant === v.key
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-white/5 text-gray-500"
                              }`}
                            >
                              <VariantIcon variant={v.key} size={20} />
                            </div>
                            <div>
                              <div
                                className={`text-xs sm:text-sm font-bold ${
                                  selectedVariant === v.key
                                    ? "text-white"
                                    : "text-gray-300"
                                }`}
                              >
                                {t(v.labelKey)}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-0.5 sm:mt-1">
                                {t(v.descKey)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Alt Ayarlar (Süre & Bar) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    {/* Süre */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">
                        <Clock size={12} className="sm:w-4 sm:h-4" />{" "}
                        {t("setup.duration")}
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 bg-black/20 p-1 sm:p-1.5 rounded-xl">
                        {[60, 180, 300].map((d) => (
                          <button
                            key={d}
                            onClick={() => setGameDuration(d)}
                            className={`flex-1 py-2 sm:py-2.5 md:py-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                              gameDuration === d
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            {d / 60}
                            {t("setup.minute")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Yardımcı Bar */}
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">
                        {t("setup.helper_bar")}
                      </div>
                      <button
                        onClick={() => setShowProgressBar(!showProgressBar)}
                        disabled={selectedVariant === "moving"}
                        className={`
                        w-full py-2 sm:py-2.5 md:py-3 rounded-xl text-[10px] sm:text-xs font-bold border transition-all h-9 sm:h-10 md:h-11
                        ${
                          showProgressBar
                            ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                        }
                        ${
                          selectedVariant === "moving" &&
                          "opacity-50 cursor-not-allowed"
                        }
                      `}
                      >
                        {showProgressBar ? t("setup.on") : t("setup.off")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Başla Butonları */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setP1Ready(!p1Ready)}
                    disabled={!playerNames.p1.trim()}
                    className={`py-3 sm:py-3.5 md:py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest transition-all ${
                      p1Ready
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                        : "bg-neutral-800 text-gray-600 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {p1Ready
                      ? t("setup.ready_status.checked")
                      : t("setup.ready_status.p1")}
                  </button>

                  <button
                    onClick={() => setP2Ready(!p2Ready)}
                    disabled={!playerNames.p2.trim()}
                    className={`py-3 sm:py-3.5 md:py-4 rounded-xl font-black text-xs sm:text-sm tracking-widest transition-all ${
                      p2Ready
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40"
                        : "bg-neutral-800 text-gray-600 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    {p2Ready
                      ? t("setup.ready_status.checked")
                      : t("setup.ready_status.p2")}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {countdown !== null && (
          <div className="text-6xl md:text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {countdown}
          </div>
        )}

        {gameState === "playing" && (
          <>
            <TimerDisplay
              totalMs={gameTimeMs}
              targetOffset={targetOffset}
              variant={selectedVariant}
              showProgressBar={showProgressBar}
            />

            <div
              className={`text-xl md:text-2xl mt-4 text-center font-bold h-10 flex items-center justify-center gap-2 ${actionMessage.className}`}
            >
              {actionMessage.icon && <actionMessage.icon size={24} />}
              <span>{actionMessage.text}</span>
            </div>

            <TurnInfo
              currentPlayer={getCurrentPlayerName()}
              turnTimeLeft={turnTimeLeft}
            />

            <div className="flex justify-center w-full gap-4 mt-8">
              <div
                className={`flex flex-col items-center transition-opacity ${
                  currentPlayer !== "p1" ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <ActionButton
                  onClick={handleAction}
                  disabled={currentPlayer !== "p1" || isPaused}
                  customText="P1 VUR"
                  customColor="bg-emerald-600"
                />
              </div>
              <div
                className={`flex flex-col items-center transition-opacity ${
                  currentPlayer !== "p2" ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <ActionButton
                  onClick={handleAction}
                  disabled={currentPlayer !== "p2" || isPaused}
                  customText="P2 VUR"
                  customColor="bg-cyan-600"
                />
              </div>
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

export default TwoPlayerMode;
