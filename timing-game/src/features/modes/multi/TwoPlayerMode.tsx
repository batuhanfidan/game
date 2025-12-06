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
import { Trophy, User, ArrowLeft } from "lucide-react";
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
    <div className="text-2xl md:text-3xl font-extrabold text-center text-yellow-400 drop-shadow-lg px-4 pointer-events-none flex items-center gap-3 justify-center w-full">
      <Trophy size={32} />
      <span>
        Skor: {scores.p1} - {scores.p2}
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
        {/* Oyuncu Timerları */}
        <div className="absolute top-28 flex justify-between w-full px-4 md:px-20 text-xl">
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
                <User size={20} /> {playerNames.p2}
              </span>
            }
            minutes={Math.floor(playerTimes.p2 / 60)}
            seconds={playerTimes.p2 % 60}
          />
        </div>
        {/* Hazırlık Ekranı */}
        {gameState === "idle" && !countdown && (
          <div className="flex flex-col items-center gap-6 z-10 bg-neutral-900 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full mx-4 overflow-y-auto max-h-[95vh] animate-popup">
            <div className="w-full">
              <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {t("setup.game_type")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {VARIANTS.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setSelectedVariant(v.key)}
                    className={`px-4 py-3 rounded-lg text-left flex flex-col transition-all border ${
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
                      className={`flex-1 px-2 py-3 rounded text-xs font-bold transition-all ${
                        gameDuration === duration
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {duration / 60} {t("setup.minute")},
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
                    className={`flex-1 py-3 rounded-lg border transition-all font-bold text-sm ${
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
                    className={`flex-1 py-3 rounded-lg border transition-all font-bold text-sm ${
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

            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider w-full mt-2">
              {t("setup.players")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <input
                type="text"
                value={playerNames.p1}
                maxLength={20}
                onChange={(e) =>
                  setPlayerNames((prev) => ({ ...prev, p1: e.target.value }))
                }
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-center w-full text-white"
                placeholder={t("setup.player_1_placeholder")}
              />
              <input
                type="text"
                value={playerNames.p2}
                maxLength={20}
                onChange={(e) =>
                  setPlayerNames((prev) => ({ ...prev, p2: e.target.value }))
                }
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-center w-full text-white"
                placeholder={t("setup.player_2_placeholder")}
              />
            </div>

            <div className="flex gap-4 mt-4 w-full justify-center">
              <button
                onClick={() => setP1Ready(true)}
                disabled={p1Ready || playerNames.p1.trim().length === 0}
                className={`px-4 py-3 rounded-lg text-lg font-bold transition w-full ${
                  p1Ready
                    ? "bg-green-600 cursor-default"
                    : playerNames.p1.trim().length === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {p1Ready
                  ? t("setup.ready_status.checked")
                  : t("setup.ready_status.p1")}
              </button>
              <button
                onClick={() => setP2Ready(true)}
                disabled={p2Ready || playerNames.p2.trim().length === 0}
                className={`px-4 py-3 rounded-lg text-lg font-bold transition w-full ${
                  p2Ready
                    ? "bg-green-600 cursor-default"
                    : playerNames.p2.trim().length === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {p2Ready
                  ? t("setup.ready_status.checked")
                  : t("setup.ready_status.p2")}
              </button>
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-2 text-gray-400 hover:text-white underline text-sm flex items-center gap-1"
            >
              <ArrowLeft size={14} /> {t("components.pause.menu")}
            </button>
          </div>
        )}
        {/* Geri Sayım */}
        {countdown !== null && (
          <div className="text-7xl font-bold text-yellow-400 animate-pulse z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {countdown}
          </div>
        )}
        {/* Oyun Alanı */}
        {gameState === "playing" && (
          <>
            <TimerDisplay
              totalMs={gameTimeMs}
              targetOffset={targetOffset}
              variant={selectedVariant}
              showProgressBar={showProgressBar}
            />

            <div className="text-xl md:text-2xl mt-4 text-center text-green-400 font-semibold px-4 h-8 flex items-center justify-center gap-2">
              {actionMessage.icon && (
                <actionMessage.icon size={24} className="inline-block" />
              )}
              {actionMessage.text}
            </div>
            <TurnInfo
              currentPlayer={getCurrentPlayerName()}
              turnTimeLeft={turnTimeLeft}
            />
            <div className="flex justify-center w-full gap-4 sm:gap-10 px-4 mt-8">
              <div
                className={`flex flex-col items-center transition-opacity duration-200 ${
                  currentPlayer !== "p1" ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <ActionButton
                  onClick={handleAction}
                  disabled={currentPlayer !== "p1" || isPaused}
                  customText={t("survival.buttons.hit")}
                />
                <p className="mt-2 text-sm text-gray-400 text-center w-full truncate px-2">
                  {playerNames.p1}
                </p>
              </div>
              <div
                className={`flex flex-col items-center transition-opacity duration-200 ${
                  currentPlayer !== "p2" ? "opacity-30 pointer-events-none" : ""
                }`}
              >
                <ActionButton
                  onClick={handleAction}
                  disabled={currentPlayer !== "p2" || isPaused}
                  customText={t("survival.buttons.hit")}
                />
                <p className="mt-2 text-sm text-gray-400 text-center w-full truncate px-2">
                  {playerNames.p2}
                </p>
              </div>
            </div>
            <div className="mt-4 text-gray-500 text-sm animate-pulse hidden md:block">
              (İpucu: Sırası gelen SPACE tuşunu kullanabilir)
            </div>
          </>
        )}
        {/* Bitiş Ekranı */}
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
