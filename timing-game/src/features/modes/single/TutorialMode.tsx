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

// Layout & Context
import GameLayout from "../../../components/layout/GameLayout";
import { GameProvider } from "../../../context/GameContext";

const TutorialMode = () => {
  const navigate = useNavigate();
  const { currentTheme, nextTheme, theme } = useTheme(0);
  const [step, setStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

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
    <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg flex items-center gap-3">
      <Trophy size={32} /> {scores.p1} - {scores.p2}
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
          <div className="absolute top-32 flex justify-between w-full px-4 md:px-20 text-xl">
            <PlayerTimer
              player={
                <span className="flex items-center gap-2">
                  <User size={20} /> Sen
                </span>
              }
              minutes={Math.floor(playerTimes.p1 / 60)}
              seconds={playerTimes.p1 % 60}
            />
            <PlayerTimer
              player={
                <span className="flex items-center gap-2">
                  <Bot size={20} /> Bot
                </span>
              }
              minutes={Math.floor(playerTimes.p2 / 60)}
              seconds={playerTimes.p2 % 60}
            />
          </div>

          {countdown !== null && (
            <div className="text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {countdown}
            </div>
          )}

          <div className="mt-12 flex justify-center w-full">
            <TimerDisplay totalMs={gameTimeMs} showProgressBar={true} />
          </div>

          <div className="text-xl md:text-2xl mt-6 text-center font-bold px-4 h-8 text-green-400 drop-shadow-sm">
            {actionMessage || "Hazır ol..."}
          </div>

          <TurnInfo
            currentPlayer={getCurrentPlayerName()}
            turnTimeLeft={turnTimeLeft}
          />

          <div className="flex justify-center w-full px-4 mt-10">
            <ActionButton
              onClick={handleAction}
              disabled={currentPlayer !== "p1" || isPaused || showOverlay}
              isFirstTurn={false}
            />
          </div>

          <div className="absolute bottom-4 left-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white"
            >
              <ArrowLeft size={16} /> Çıkış
            </button>
          </div>
        </div>

        {isFinished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-green-500/30 p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                EĞİTİM TAMAMLANDI!
              </h2>
              <p className="text-gray-400 mb-8">
                Artık gerçek maçlara hazırsın.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/game/bot")}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Gerçek Maça Başla
                </button>
                <button
                  onClick={handleRetry}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Tekrar Dene
                </button>
                <button
                  onClick={handleFinish}
                  className="text-gray-500 hover:text-white text-sm mt-2"
                >
                  Ana Menü
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
