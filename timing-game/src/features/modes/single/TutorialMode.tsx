import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../../components/game/TimerDisplay";
import PlayerTimer from "../../../components/layout/PlayerTimer";
import ActionButton from "../../../components/common/ActionButton";
import TurnInfo from "../../../components/layout/TurnInfo";
import { useGameLogic } from "../../../hooks/useGameLogic";
import { useTheme } from "../../../hooks/core/useTheme";
import { TUTORIAL_STEPS } from "../../../shared/constants/ui";
import {
  User,
  Bot,
  RotateCcw,
  CheckCircle,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import TutorialOverlay from "../../../components/common/TutorialOverlay";
import GameLayout from "../../../components/layout/GameLayout";
import { GameProvider } from "../../../context/GameContext";
import { useTranslation } from "react-i18next";

const TutorialMode = () => {
  const navigate = useNavigate();
  const { currentTheme, nextTheme, theme } = useTheme(0);
  const [step, setStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const { t } = useTranslation();

  const gameLogic = useGameLogic({
    gameMode: "bot",
    initialTime: 45,
    botReactionTime: 3000,
  });

  const {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    actionMessage,
    countdown,
    startGame,
    handleAction,
    restartGame,
    getCurrentPlayerName,
    isPaused,
  } = gameLogic;

  const nextStep = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setShowOverlay(false);
      startGame();
    }
  };

  const skipTutorial = () => {
    setShowOverlay(false);
    startGame();
  };

  const handleFinish = () => navigate("/");
  const handleRetry = () => {
    setStep(0);
    setShowOverlay(true);
    restartGame();
  };

  const isFinished = gameState === "finished";

  const scoreDisplay = (
    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-yellow-400 drop-shadow-lg flex items-center gap-2 sm:gap-3 px-2">
      <Trophy className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
      <span>
        {scores.p1} - {scores.p2}
      </span>
    </div>
  );

  return (
    <GameProvider
      {...gameLogic}
      currentTheme={currentTheme}
      isTwoPlayerMode={false}
      scoreDisplay={scoreDisplay}
      bottomInfo={`🎯 Tema: ${theme.name}`}
      onThemeChange={nextTheme}
    >
      <GameLayout>
        <TutorialOverlay
          step={step}
          isVisible={showOverlay}
          onNext={nextStep}
          onSkip={skipTutorial}
        />

        <div
          className={`transition-all duration-500 w-full h-full flex flex-col items-center justify-center ${
            showOverlay ? "pointer-events-none" : ""
          }`}
        >
          {/* Oyuncu Timer'ları */}
          <div className="absolute top-20 md:top-32 left-0 right-0 flex justify-between px-4 md:px-20 text-sm md:text-xl font-bold text-gray-300 z-10">
            <PlayerTimer
              player={
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    {t("tutorial.labels.you")}
                  </span>
                  <span className="sm:hidden text-xs">
                    {t("tutorial.labels.you")}
                  </span>
                </span>
              }
              minutes={Math.floor(playerTimes.p1 / 60)}
              seconds={playerTimes.p1 % 60}
            />
            <PlayerTimer
              player={
                <span className="flex items-center gap-2">
                  <Bot className="w-5 h-5 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    {t("tutorial.labels.bot")}
                  </span>
                  <span className="sm:hidden text-xs">
                    {t("tutorial.labels.bot")}
                  </span>
                </span>
              }
              minutes={Math.floor(playerTimes.p2 / 60)}
              seconds={playerTimes.p2 % 60}
            />
          </div>

          {/* Geri Sayım */}
          {countdown !== null && (
            <div className="text-6xl sm:text-7xl md:text-8xl font-black text-yellow-400 animate-ping z-30">
              {countdown}
            </div>
          )}

          {/* Timer Display */}
          <div className="mt-12 flex justify-center w-full px-4">
            <TimerDisplay totalMs={gameTimeMs} showProgressBar={true} />
          </div>

          {/* Action Message */}
          <div
            className={`text-xl md:text-2xl mt-6 text-center font-bold px-4 min-h-8 md:min-h-8 drop-shadow-sm flex items-center justify-center gap-2 ${
              actionMessage.className || "text-green-400"
            }`}
          >
            {actionMessage.icon && (
              <actionMessage.icon className="w-6 h-6 inline-block shrink-0" />
            )}
            <span className="truncate max-w-[90%]">
              {actionMessage.text || t("tutorial.labels.get_ready")}
            </span>
          </div>

          {/* Turn Info */}
          <div className="mt-4">
            <TurnInfo
              currentPlayer={getCurrentPlayerName()}
              turnTimeLeft={turnTimeLeft}
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center w-full px-4 mt-10">
            <ActionButton
              onClick={handleAction}
              disabled={currentPlayer !== "p1" || isPaused || showOverlay}
              isFirstTurn={false}
            />
          </div>

          {/* Çıkış Butonu */}
          <div className="absolute bottom-4 left-4 z-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> {t("tutorial.labels.exit")}
            </button>
          </div>
        </div>

        {/* EĞİTİM TAMAMLANDI POPUP'I */}
        {isFinished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-neutral-900 border border-green-500/30 p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle
                  size={40}
                  className="sm:w-12 sm:h-12 text-green-500"
                />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {t("tutorial.finished.title")}
              </h2>

              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
                {t("tutorial.finished.text")}
              </p>

              <div className="flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/game/bot")}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
                >
                  {t("tutorial.finished.start_real")}
                </button>

                <button
                  onClick={handleRetry}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>{t("tutorial.finished.retry")}</span>
                </button>

                <button
                  onClick={handleFinish}
                  className="text-gray-500 hover:text-white text-xs sm:text-sm mt-1 sm:mt-2 transition-colors"
                >
                  {t("tutorial.finished.menu")}
                </button>
              </div>
            </div>
          </div>
        )}
      </GameLayout>
    </GameProvider>
  );
};

export default TutorialMode;
