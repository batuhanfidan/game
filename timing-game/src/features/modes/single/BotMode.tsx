import { useState, useEffect } from "react";
import TimerDisplay from "../../../components/game/TimerDisplay";
import PlayerTimer from "../../../components/layout/PlayerTimer";
import ActionButton from "../../../components/common/ActionButton";
import TurnInfo from "../../../components/layout/TurnInfo";
import GameOverModal from "../../../components/common/GameOverModal";
import VariantIcon from "../../../components/game/VariantIcon";
import { useGameLogic } from "../../../hooks/useGameLogic";
import { DIFFICULTIES, VARIANTS } from "../../../shared/constants/game";
import type { GameVariant } from "../../../shared/types";
import { User, Bot, ArrowLeft, Trophy, Settings2, Clock } from "lucide-react";
import GameLayout from "../../../components/layout/GameLayout";
import { GameProvider } from "../../../context/GameContext";
import { useTheme } from "../../../hooks/core/useTheme";
import { useTranslation } from "react-i18next";

type DifficultyKey = keyof typeof DIFFICULTIES;

const BotMode = () => {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<DifficultyKey>("MEDIUM");
  const [selectedVariant, setSelectedVariant] =
    useState<GameVariant>("classic");
  const [gameDuration, setGameDuration] = useState(180);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  const { currentTheme, nextTheme, theme } = useTheme(0);

  useEffect(() => {
    if (selectedVariant === "moving") setShowProgressBar(true);
  }, [selectedVariant]);

  const gameLogic = useGameLogic({
    gameMode: "bot",
    gameVariant: selectedVariant,
    botReactionTime: DIFFICULTIES[difficulty].reaction,
    botAccuracy: DIFFICULTIES[difficulty].accuracy,
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
    playerNames,
    isPaused,
    targetOffset,
    getCurrentPlayerName,
  } = gameLogic;

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
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
        {/* OYUNCU SÜRELERİ (Sadece Oyun Başlayınca Görünür) */}
        {gameState === "playing" && (
          <div className="absolute top-16 sm:top-20 md:top-32 flex justify-between w-full px-2 sm:px-4 md:px-20 text-xs sm:text-sm md:text-xl font-bold text-gray-300">
            <PlayerTimer
              player={
                <span className="flex items-center gap-1 sm:gap-2">
                  <User size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline sm:inline">
                    {playerNames.p1}
                  </span>
                  <span className="inline xs:hidden sm:hidden whitespace-normal max-w-[60px]">
                    {playerNames.p1}
                  </span>
                </span>
              }
              minutes={Math.floor(playerTimes.p1 / 60)}
              seconds={playerTimes.p1 % 60}
            />
            <PlayerTimer
              player={
                <span className="flex items-center gap-1 sm:gap-2">
                  <Bot size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">
                    Bot ({t(DIFFICULTIES[difficulty].labelKey)})
                  </span>
                  <span className="inline sm:hidden">Bot</span>
                </span>
              }
              minutes={Math.floor(playerTimes.p2 / 60)}
              seconds={playerTimes.p2 % 60}
            />
          </div>
        )}

        {/* HAZIRLIK MENÜSÜ */}
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
            <div className="relative z-20 flex flex-col w-full max-w-3xl mx-auto px-4 animate-fade-in  md:-mt-20">
              {/* Kart Başlığı */}
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center justify-center gap-2 md:gap-3">
                  <Bot size={28} className="text-blue-400 sm:w-8 sm:h-8" />
                  <span>{t("menu.modes.bot.title")}</span>
                </h2>
                <p className="text-blue-200/50 text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] mt-2 uppercase">
                  Simülasyon Ayarları
                </p>
              </div>

              {/* Ayarlar Paneli */}
              <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-2xl space-y-5 sm:space-y-6 md:space-y-8">
                {/* 1. Zorluk */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <Settings2 size={14} className="sm:w-4 sm:h-4" />{" "}
                    {t("setup.difficulty")}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-black/20 p-1 rounded-xl">
                    {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map(
                      (key) => (
                        <button
                          key={key}
                          onClick={() => setDifficulty(key)}
                          className={`
                        py-2 sm:py-2.5 rounded-lg text-[9px] sm:text-[10px] md:text-xs font-bold transition-all relative overflow-hidden
                        ${
                          difficulty === key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }
                      `}
                        >
                          {t(DIFFICULTIES[key].labelKey)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 2. Oyun Türü (Grid) */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
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
                            <VariantIcon variant={v.key} size={16} />
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
                            <div className="text-[10px] sm:text-xs text-gray-500 leading-tight mt-0.5">
                              {t(v.descKey)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Alt Ayarlar (Süre & Bar) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                  {/* Süre */}
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      <Clock size={12} className="sm:w-3.5 sm:h-3.5" />{" "}
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
                          {d / 60} {t("setup.minute")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yardımcı Bar */}
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
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

                {/* Başlat Butonu */}
                <button
                  onClick={() => setPlayerReady(true)}
                  disabled={playerReady}
                  className="w-full py-3.5 sm:py-4 md:py-5 rounded-xl bg-green-400 text-black font-black text-sm sm:text-base tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] mt-2"
                >
                  {playerReady ? t("setup.starting") : t("setup.start_game")}
                </button>
              </div>

              {/* Geri Dön */}
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
              className={`text-xl md:text-2xl mt-6 text-center font-bold h-12 flex items-center justify-center gap-2 ${actionMessage.className}`}
            >
              {actionMessage.icon && <actionMessage.icon size={24} />}
              <span>{actionMessage.text}</span>
            </div>

            <TurnInfo
              currentPlayer={getCurrentPlayerName()}
              turnTimeLeft={turnTimeLeft}
            />

            <div
              className={`flex justify-center w-full mt-10 transition-all ${
                currentPlayer !== "p1"
                  ? "opacity-50 grayscale pointer-events-none"
                  : ""
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p1" || isPaused}
                customText={t("survival.buttons.hit")}
              />
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

export default BotMode;
