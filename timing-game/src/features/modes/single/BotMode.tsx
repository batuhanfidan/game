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
import { User, Bot, ArrowLeft, Trophy } from "lucide-react";
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
    getCurrentPlayerName,
    playerNames,
    isPaused,
    targetOffset,
  } = gameLogic;

  useEffect(() => {
    if (playerReady && gameState === "idle") startGame();
  }, [playerReady, gameState, startGame]);

  useEffect(() => {
    if (gameState === "idle") setPlayerReady(false);
  }, [gameState]);

  // Skor göstergesi (GameLayout'a prop olarak gidecek)
  const scoreDisplay = gameState !== "idle" && (
    <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg flex items-center gap-3">
      <Trophy size={32} /> {scores.p1} - {scores.p2}
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
        {/* OYUN ALANI (Timerlar ve Butonlar) */}

        {/* Oyuncu Süreleri */}
        <div className="absolute top-32 flex justify-between w-full px-4 md:px-20 text-xl">
          <PlayerTimer
            player={
              <span className="flex items-center gap-2">
                <User size={20} /> {playerNames.p1}
              </span>
            }
            minutes={Math.floor(playerTimes.p1 / 60)}
            seconds={playerTimes.p1 % 60}
          />
          <PlayerTimer
            player={
              <span className="flex items-center gap-2">
                <Bot size={20} /> Bot ({t(DIFFICULTIES[difficulty].labelKey)})
              </span>
            }
            minutes={Math.floor(playerTimes.p2 / 60)}
            seconds={playerTimes.p2 % 60}
          />
        </div>

        {/* Hazırlık Menüsü */}
        {gameState === "idle" && !countdown && (
          <div className="flex flex-col items-center gap-4 z-20 bg-neutral-900 p-6 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[95vh] animate-popup">
            <div className="w-full">
              <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {t("setup.difficulty")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`flex-1 px-2 py-2 rounded text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      difficulty === key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {t(DIFFICULTIES[key].labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {t("setup.game_type")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {VARIANTS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setSelectedVariant(v.key)}
                    className={`px-4 py-3 rounded-lg text-left flex flex-col transition-all border focus-visible:ring-2 focus-visible:ring-green-500 ${
                      selectedVariant === v.key
                        ? "bg-gray-800 border-green-500 shadow-lg shadow-green-900/20"
                        : "bg-gray-800/50 border-transparent hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`font-bold text-sm flex items-center gap-2 ${
                        selectedVariant === v.key
                          ? "text-green-400"
                          : "text-gray-300"
                      }`}
                    >
                      <VariantIcon variant={v.key} /> {t(v.labelKey)}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {t(v.descKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t("setup.duration")}
                </h2>
                <div className="flex gap-2 w-full">
                  {[60, 180, 300].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setGameDuration(duration)}
                      className={`flex-1 px-2 py-3 rounded text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        gameDuration === duration
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {duration / 60} {t("setup.minute")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t("setup.helper_bar")}
                </h2>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setShowProgressBar(true)}
                    className={`flex-1 py-3 rounded-lg border transition-all font-bold text-sm focus-visible:ring-2 focus-visible:ring-green-500 ${
                      showProgressBar
                        ? "bg-green-900/30 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                        : "bg-gray-800 border-transparent text-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    {t("setup.on")}
                  </button>

                  <button
                    onClick={() => setShowProgressBar(false)}
                    disabled={selectedVariant === "moving"}
                    className={`flex-1 py-3 rounded-lg border transition-all font-bold text-sm focus-visible:ring-2 focus-visible:ring-red-500 ${
                      selectedVariant === "moving"
                        ? "bg-gray-900/50 border-gray-800 text-gray-700 opacity-50 cursor-not-allowed"
                        : !showProgressBar
                        ? "bg-red-900/30 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        : "bg-gray-800 border-transparent text-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    {t("setup.off")}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-700 my-2"></div>

            <button
              onClick={() => setPlayerReady(true)}
              disabled={playerReady}
              className="px-10 py-4 rounded-xl text-xl font-bold transition w-full bg-green-600 hover:bg-green-500 cursor-pointer hover:scale-105 shadow-lg shadow-green-500/20 focus-visible:ring-4 focus-visible:ring-green-300"
            >
              {playerReady ? t("setup.starting") : t("setup.start_game")}
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-gray-500 hover:text-white text-sm underline cursor-pointer flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <ArrowLeft size={16} /> {t("components.pause.menu")}
            </button>
          </div>
        )}

        {/* Geri Sayım */}
        {countdown !== null && (
          <div className="text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {countdown}
          </div>
        )}

        {/* Oyun Aktif Durumu */}
        {gameState === "playing" && (
          <>
            <TimerDisplay
              totalMs={gameTimeMs}
              targetOffset={targetOffset}
              variant={selectedVariant}
              showProgressBar={showProgressBar}
            />

            <div
              className={`text-xl md:text-2xl mt-6 text-center font-bold px-4 h-8 drop-shadow-sm flex items-center justify-center gap-2 ${
                actionMessage.className || "text-green-400"
              }`}
            >
              {actionMessage.icon && (
                <actionMessage.icon size={24} className="inline-block" />
              )}
              {actionMessage.text}
            </div>
            <TurnInfo
              currentPlayer={getCurrentPlayerName()}
              turnTimeLeft={turnTimeLeft}
            />
            <div
              className={`flex justify-center w-full px-4 mt-10 transition-all duration-300 ${
                currentPlayer !== "p1"
                  ? "opacity-40 grayscale pointer-events-none scale-95"
                  : "scale-100"
              }`}
            >
              <ActionButton
                onClick={handleAction}
                disabled={currentPlayer !== "p1" || isPaused}
                customText={t("survival.buttons.hit")}
              />
            </div>
            <div className="mt-6 text-gray-500 text-sm animate-pulse font-semibold hidden md:block">
              {/* [SPACE] tuşuna basarak da oynayabilirsin */}
            </div>
          </>
        )}

        {/* Oyun Sonu */}
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
