import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../components/game/TimerDisplay";
import PlayerTimer from "../../components/layout/PlayerTimer";
import ActionButton from "../../components/game/ActionButton";
import TurnInfo from "../../components/layout/TurnInfo";
import VisualEffectOverlay from "../../components/layout/VisualEffectOverlay";
import PauseMenu from "../../components/layout/PauseMenu";
import RulesModal from "../../components/layout/RulesModel";
import { useGameLogic } from "../../hooks/useGameLogic";
import { useTheme } from "../../hooks/useTheme";
import { TUTORIAL_STEPS } from "../../utils/constants";
import { toggleMute, getMuteStatus } from "../../utils/sound";
import {
  User,
  Bot,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Trophy,
  Menu,
  Volume2,
  VolumeX,
  Palette,
  CircleHelp,
} from "lucide-react";
import TutorialOverlay from "../../components/common/TutorialOverlay";

const TutorialMode = () => {
  const navigate = useNavigate();
  const { theme, nextTheme } = useTheme(0);

  // Tutorial State
  const [step, setStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [showRules, setShowRules] = useState(false);

  // Game Logic
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
    visualEffect,
    isPaused,
    togglePause,
  } = useGameLogic({
    gameMode: "bot",
    initialTime: 45,
    botReactionTime: 3000,
  });

  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

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

  const handleFinish = () => {
    navigate("/");
  };

  const handleRetry = () => {
    setStep(0);
    setShowOverlay(true);
    restartGame();
  };

  const isFinished = gameState === "finished";

  return (
    <div
      className={`h-screen-safe w-screen text-white flex flex-col justify-center items-center relative font-mono overflow-hidden transition-colors duration-500 ${theme.class}`}
    >
      <VisualEffectOverlay effect={visualEffect} isTwoPlayerMode={false} />

      {/* TUTORIAL OVERLAY */}
      <TutorialOverlay
        step={step}
        isVisible={showOverlay}
        onNext={nextStep}
        onSkip={skipTutorial}
      />

      {/* SOL ÜST PAUSE BUTONU */}
      {!showOverlay && gameState === "playing" && (
        <button
          onClick={togglePause}
          className="absolute top-4 left-4 z-60 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-blue-500"
          title="Duraklat"
        >
          ⏸
        </button>
      )}

      {/* PAUSE MENÜSÜ */}
      {isPaused && (
        <PauseMenu
          onResume={togglePause}
          onRestart={restartGame}
          onQuit={handleBackToMenu}
        />
      )}

      {/* SAĞ ÜST MENÜ */}
      <div className="absolute top-4 right-4 z-60 flex flex-col items-end">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
          aria-expanded={isMenuOpen}
          className="md:hidden bg-gray-700 hover:bg-gray-600 text-white rounded-lg w-10 h-10 flex items-center justify-center border border-gray-500 shadow-lg transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <Menu size={24} />
        </button>
        <div
          className={`flex-col md:flex-row gap-2 mt-2 md:mt-0 ${
            isMenuOpen ? "flex" : "hidden"
          } md:flex transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={handleMuteToggle}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={nextTheme}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Palette size={20} />
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <CircleHelp size={20} />
          </button>
        </div>
      </div>

      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* OYUN ALANI */}
      <div
        className={`transition-all duration-500 w-full h-full flex flex-col items-center justify-center ${
          showOverlay ? "pointer-events-none" : ""
        }`}
      >
        {/* STANDART SKOR TABLOSU */}
        <div className="absolute top-4 w-full flex flex-col items-center z-10 pointer-events-none">
          <div className="text-3xl font-extrabold text-yellow-400 drop-shadow-lg flex items-center gap-3">
            <Trophy size={32} /> {scores.p1} - {scores.p2}
          </div>
        </div>

        {/* Timers */}
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

        {/* Countdown */}
        {countdown !== null && (
          <div className="text-8xl font-black text-yellow-400 animate-ping z-30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {countdown}
          </div>
        )}

        {/* Main Display */}
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

        {/* Button */}
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

      {/* CUSTOM TUTORIAL FINISHED MODAL */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-green-500/30 p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              EĞİTİM TAMAMLANDI!
            </h2>
            <p className="text-gray-400 mb-8">Artık gerçek maçlara hazırsın.</p>

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
    </div>
  );
};

export default TutorialMode;
