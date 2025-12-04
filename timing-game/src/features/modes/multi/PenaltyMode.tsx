import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../../components/game/TimerDisplay";
import ActionButton from "../../../components/common/ActionButton";
import GameOverModal from "../../../components/common/GameOverModal";
import VisualEffectOverlay from "../../../components/game/VisualEffectOverlay";

import { calculateShotResult } from "../../../shared/utils/calculateShotResult";
import {
  playSound,
  toggleMute,
  getMuteStatus,
} from "../../../shared/utils/sound";

import type { VisualEffectData } from "../../../shared/types";
import { Volume2, VolumeX, ArrowLeft, User } from "lucide-react";
import { GAME_DELAYS } from "../../../shared/constants/game";

type Player = "p1" | "p2";

const PenaltyMode = () => {
  const navigate = useNavigate();

  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [history, setHistory] = useState<{ p1: boolean[]; p2: boolean[] }>({
    p1: [],
    p2: [],
  });
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [actionMessage, setActionMessage] = useState(
    "Penaltı Atışları Başlıyor!"
  );

  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );

  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [shotTaken, setShotTaken] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  useEffect(() => {
    if (isGameOver || shotTaken) return;

    const animate = () => {
      const now = Date.now();
      if (startTimeRef.current === 0) startTimeRef.current = now;
      setGameTimeMs(now - startTimeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isGameOver, shotTaken]);

  const handleShoot = useCallback(() => {
    if (shotTaken || isGameOver) return;
    setShotTaken(true);
    playSound("kick");

    const currentMs = gameTimeMs % 1000;
    const { result, message, isGoal } = calculateShotResult(currentMs);
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

    const goalScored = result === "GOL" || (isGoal && result === "PENALTI");

    if (goalScored) {
      playSound("goal");
      setVisualEffect({ type: "goal", player: currentPlayer });
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
      setActionMessage(`⚽ GOL! (${displayMs}ms)`);
    } else {
      playSound("miss");
      const missType = result === "DİREK" ? "post" : "miss";
      setVisualEffect({ type: missType, player: currentPlayer });
      setActionMessage(`❌ KAÇTI! (${displayMs}ms) - ${message}`);
    }

    setHistory((h) => ({
      ...h,
      [currentPlayer]: [...h[currentPlayer], goalScored],
    }));
  }, [gameTimeMs, currentPlayer, shotTaken, isGameOver]);

  const finishGame = useCallback(() => {
    setIsGameOver(true);
    playSound("whistle");

    setScores((currentScores) => {
      let winnerMsg = "";
      if (currentScores.p1 > currentScores.p2) {
        winnerMsg = "🏆 Oyuncu 1 Kazandı!";
      } else if (currentScores.p2 > currentScores.p1) {
        winnerMsg = "🏆 Oyuncu 2 Kazandı!";
      } else {
        winnerMsg = "🤝 Berabere!";
      }
      setWinner(winnerMsg);
      return currentScores;
    });
  }, []);

  useEffect(() => {
    if (!shotTaken || isGameOver) return;

    const timer = setTimeout(() => {
      if (currentPlayer === "p1") {
        setCurrentPlayer("p2");
        setShotTaken(false);
      } else {
        if (round < 5) {
          setRound((r) => r + 1);
          setCurrentPlayer("p1");
          setShotTaken(false);
        } else {
          finishGame();
        }
      }
    }, GAME_DELAYS.SHOT_RESULT_DISPLAY);

    return () => clearTimeout(timer);
  }, [shotTaken, currentPlayer, round, isGameOver, finishGame]);

  const restartGame = () => {
    setRound(1);
    setScores({ p1: 0, p2: 0 });
    setHistory({ p1: [], p2: [] });
    setCurrentPlayer("p1");
    setIsGameOver(false);
    setShotTaken(false);
    setActionMessage("Penaltı Atışları Başlıyor!");
    startTimeRef.current = 0;
  };

  const renderScoreDots = (player: Player) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const result = history[player][i];
      let colorClass = "bg-gray-700";
      if (result === true) colorClass = "bg-green-500";
      if (result === false) colorClass = "bg-red-500";

      const isActive =
        !isGameOver && player === currentPlayer && i === round - 1;

      return (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 border-gray-600 ${colorClass} ${
            isActive ? "animate-ping border-white" : ""
          }`}
        />
      );
    });
  };

  return (
    <div className="h-screen-safe w-screen bg-linear-to-b from-slate-900 to-black text-white flex flex-col items-center font-mono overflow-hidden relative">
      <VisualEffectOverlay
        effect={visualEffect}
        isTwoPlayerMode={true}
        currentPlayer={currentPlayer}
      />

      <div className="w-full p-4 flex justify-between items-center z-50">
        <div className="text-xl font-bold text-yellow-400">PENALTI MODU</div>
        <div className="flex gap-2">
          <button
            onClick={handleMuteToggle}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={handleBackToMenu}
            className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-sm transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Çıkış
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-2xl px-4 mt-4 z-10">
        <div
          className={`flex items-center justify-between bg-gray-800/50 p-4 rounded-xl mb-2 border-2 transition-colors ${
            currentPlayer === "p1" ? "border-blue-500" : "border-transparent"
          }`}
        >
          <span className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <User size={24} /> Oyuncu 1
          </span>
          <div className="flex gap-2">{renderScoreDots("p1")}</div>
          <span className="text-3xl font-black">{scores.p1}</span>
        </div>

        <div
          className={`flex items-center justify-between bg-gray-800/50 p-4 rounded-xl border-2 transition-colors ${
            currentPlayer === "p2" ? "border-red-500" : "border-transparent"
          }`}
        >
          <span className="text-xl font-bold text-red-400 flex items-center gap-2">
            <User size={24} /> Oyuncu 2
          </span>
          <div className="flex gap-2">{renderScoreDots("p2")}</div>
          <span className="text-3xl font-black">{scores.p2}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10">
        <div className="text-4xl font-bold mb-6 text-yellow-400">
          TUR {round} / 5
        </div>

        <TimerDisplay totalMs={gameTimeMs} />

        <div className="h-12 mt-4 flex items-center justify-center w-full">
          <span className="text-xl font-bold text-center text-green-400 drop-shadow-md">
            {actionMessage}
          </span>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <ActionButton
            onClick={handleShoot}
            disabled={shotTaken || isGameOver}
            customText={shotTaken ? "Bekle..." : "ŞUT ÇEK!"}
          />
        </div>

        <div className="mt-4 text-gray-500 text-sm animate-pulse">
          Sıra:{" "}
          {currentPlayer === "p1" ? "Oyuncu 1 (Mavi)" : "Oyuncu 2 (Kırmızı)"}
        </div>
      </div>

      {isGameOver && (
        <GameOverModal
          winner={winner}
          finalScore={`Sonuç: ${scores.p1} - ${scores.p2}`}
          onRestart={restartGame}
        />
      )}
    </div>
  );
};

export default PenaltyMode;
