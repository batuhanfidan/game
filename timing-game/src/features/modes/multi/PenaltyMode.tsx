import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TimerDisplay from "../../../components/game/TimerDisplay";
import ActionButton from "../../../components/common/ActionButton";
import GameOverModal from "../../../components/common/GameOverModal";
import VisualEffectOverlay from "../../../components/game/VisualEffectOverlay";
import PauseMenu from "../../../components/layout/PauseMenu";
import {
  playSound,
  toggleMute,
  getMuteStatus,
} from "../../../shared/utils/sound";
import type { VisualEffectData } from "../../../shared/types";
import { Volume2, VolumeX, ArrowLeft, User, Flame } from "lucide-react";
import { GAME_DELAYS } from "../../../shared/constants/game";

type Player = "p1" | "p2";

// Genişletilmiş Hedef Alanı (±60ms)
const calculatePenaltyOutcome = (diff: number) => {
  if (diff <= 60) {
    return { result: "GOL", message: "GOL!", isGoal: true };
  } else if (diff <= 110) {
    return { result: "KURTARDI", message: "KALECİ KURTARDI", isGoal: false };
  } else if (diff <= 160) {
    return { result: "DİREK", message: "DİREKTEN DÖNDÜ", isGoal: false };
  } else {
    return { result: "AUT", message: "DIŞARI GİTTİ", isGoal: false };
  }
};

const PenaltyMode = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [history, setHistory] = useState<{ p1: boolean[]; p2: boolean[] }>({
    p1: [],
    p2: [],
  });

  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [targetOffset, setTargetOffset] = useState(500);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [actionMessage, setActionMessage] = useState("Penaltı Atışları");

  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );
  const [shotTaken, setShotTaken] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const handleMuteToggle = () => setIsMuted(toggleMute());
  const handleBackToMenu = () => navigate("/", { replace: true });

  useEffect(() => {
    if (visualEffect) {
      const timer = setTimeout(() => setVisualEffect(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [visualEffect]);

  // --- OYUN DÖNGÜSÜ ---
  useEffect(() => {
    if (isGameOver || isPaused) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    if (pausedTimeRef.current > 0) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = 0;
    }

    const animate = () => {
      const now = Date.now();
      if (startTimeRef.current === 0) startTimeRef.current = now;

      const elapsed = now - startTimeRef.current;
      setGameTimeMs(elapsed);

      // Hedef Hızı (Tur arttıkça hızlanır)
      let speed = 0.002 + round * 0.0004;
      if (round > 5) speed *= 1.3;

      const newTarget = 500 + 400 * Math.sin(elapsed * speed);
      setTargetOffset(newTarget);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isGameOver, round, isPaused]);

  // Pause durumunda süreyi kaydet
  useEffect(() => {
    if (isPaused) {
      pausedTimeRef.current = gameTimeMs;
    }
  }, [gameTimeMs, isPaused]);

  // --- ŞUT MEKANİĞİ ---
  const handleShoot = useCallback(() => {
    if (shotTaken || isGameOver || isPaused) return;
    setShotTaken(true);
    playSound("kick");

    const currentCursor = gameTimeMs % 1000;
    const diff = Math.abs(currentCursor - targetOffset);
    const { result, message, isGoal } = calculatePenaltyOutcome(diff);

    if (isGoal) {
      playSound("goal");
      setVisualEffect({ type: "goal", player: currentPlayer });
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
      setActionMessage(`⚽ ${message}`);
    } else {
      playSound("miss");
      let effectType: "miss" | "post" | "save" = "miss";
      if (result === "DİREK") effectType = "post";
      if (result === "KURTARDI") effectType = "save";

      setVisualEffect({ type: effectType, player: currentPlayer });
      setActionMessage(`❌ ${message}`);
    }

    setHistory((h) => ({
      ...h,
      [currentPlayer]: [...h[currentPlayer], isGoal],
    }));
  }, [
    gameTimeMs,
    targetOffset,
    currentPlayer,
    shotTaken,
    isGameOver,
    isPaused,
  ]);

  const finishGame = useCallback((finalWinner: string) => {
    setIsGameOver(true);
    playSound("whistle");
    setWinner(finalWinner);
  }, []);

  // --- TUR GEÇİŞLERİ ---
  useEffect(() => {
    if (!shotTaken || isGameOver) return;

    const timer = setTimeout(() => {
      if (currentPlayer === "p1") {
        setCurrentPlayer("p2");
        setShotTaken(false);
      } else {
        setRound((r) => r + 1);
        setCurrentPlayer("p1");
        setShotTaken(false);
      }
    }, GAME_DELAYS.SHOT_RESULT_DISPLAY);

    return () => clearTimeout(timer);
  }, [shotTaken, currentPlayer, isGameOver]);

  // --- KAZANAN KONTROLÜ (SUDDEN DEATH) ---
  useEffect(() => {
    const p1Moves = history.p1.length;
    const p2Moves = history.p2.length;

    if (p1Moves === 0 || p1Moves !== p2Moves) return;

    const completedRound = p1Moves;
    const p1Score = history.p1.filter(Boolean).length;
    const p2Score = history.p2.filter(Boolean).length;

    if (completedRound === 5) {
      if (p1Score > p2Score) finishGame("🏆 Oyuncu 1 Kazandı!");
      else if (p2Score > p1Score) finishGame("🏆 Oyuncu 2 Kazandı!");
      else setActionMessage("SERİ PENALTILAR BAŞLIYOR!");
    } else if (completedRound > 5) {
      if (p1Score !== p2Score) {
        if (p1Score > p2Score) finishGame("🏆 Oyuncu 1 Kazandı!");
        else finishGame("🏆 Oyuncu 2 Kazandı!");
      } else {
        setActionMessage("HEYECAN DEVAM EDİYOR!");
      }
    }
  }, [history, finishGame]);

  const restartGame = () => {
    setRound(1);
    setScores({ p1: 0, p2: 0 });
    setHistory({ p1: [], p2: [] });
    setCurrentPlayer("p1");
    setIsGameOver(false);
    setShotTaken(false);
    setIsPaused(false);
    setTargetOffset(500);
    setActionMessage("Penaltı Atışları Başlıyor!");
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  };

  const renderScoreDots = (player: Player) => {
    const moves = history[player];
    // Son 5 atışı göster
    const displayMoves =
      moves.length > 5 ? moves.slice(moves.length - 5) : moves;
    const dots = [
      ...displayMoves,
      ...Array(Math.max(0, 5 - displayMoves.length)).fill(null),
    ];

    return dots.map((result, i) => {
      let colorClass = "bg-gray-700";
      if (result === true)
        colorClass = "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
      if (result === false) colorClass = "bg-red-500";

      const isActive =
        !isGameOver &&
        player === currentPlayer &&
        i === (moves.length > 4 ? 4 : moves.length);

      return (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 border-gray-600 transition-all ${colorClass} ${
            isActive ? "animate-pulse border-white scale-110" : ""
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

      {/* --- Header --- */}
      <div className="w-full p-4 flex justify-between items-center z-50">
        {!isGameOver && (
          <button
            onClick={() => setIsPaused(true)}
            className="bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center font-bold border border-gray-700"
          >
            ⏸
          </button>
        )}

        <div className="flex gap-2 ml-auto">
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
      <div className="text-4xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
        {round > 5 ? (
          <>
            <Flame className="text-red-500 animate-pulse" /> SERİ PENALTILAR
          </>
        ) : (
          `TUR ${round} / 5`
        )}
      </div>

      {/* --- KLASİK SKOR KARTLARI (ALTLI ÜSTLÜ) --- */}
      <div className="flex flex-col w-full max-w-2xl px-4 mt-4 z-10 gap-3">
        {/* Oyuncu 1 Kartı */}
        <div
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
            currentPlayer === "p1"
              ? "bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              : "bg-gray-800/50 border-transparent"
          }`}
        >
          <span className="text-lg md:text-xl font-bold text-blue-400 flex items-center gap-2">
            <User size={24} /> P1
          </span>
          <div className="flex gap-2">{renderScoreDots("p1")}</div>
          <span className="text-3xl font-black font-mono">{scores.p1}</span>
        </div>

        {/* Oyuncu 2 Kartı */}
        <div
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
            currentPlayer === "p2"
              ? "bg-red-900/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              : "bg-gray-800/50 border-transparent"
          }`}
        >
          <span className="text-lg md:text-xl font-bold text-red-400 flex items-center gap-2">
            <User size={24} /> P2
          </span>
          <div className="flex gap-2">{renderScoreDots("p2")}</div>
          <span className="text-3xl font-black font-mono">{scores.p2}</span>
        </div>
      </div>

      {/* --- OYUN ALANI --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative z-10 pb-45">
        {/* Timer */}
        <TimerDisplay
          totalMs={gameTimeMs}
          targetOffset={targetOffset}
          showProgressBar={true}
          isPenaltyMode={true}
          disableTransition={true}
        />

        {/* Mesaj */}
        <div className="h-12 mt-4 flex items-center justify-center w-full">
          <span
            className={`text-xl md:text-2xl font-black text-center tracking-wide drop-shadow-md transition-all ${
              actionMessage.includes("GOL")
                ? "text-green-400 scale-110"
                : actionMessage.includes("DIŞARI") ||
                  actionMessage.includes("KURTARDI") ||
                  actionMessage.includes("DİREK")
                ? "text-red-400"
                : "text-white"
            }`}
          >
            {actionMessage}
          </span>
        </div>

        {/* Buton */}
        <div className="mt-8 w-full flex justify-center">
          <ActionButton
            onClick={handleShoot}
            disabled={shotTaken || isGameOver || isPaused}
            customText={shotTaken ? "..." : "ŞUT ÇEK!"}
            customColor={
              currentPlayer === "p1"
                ? "bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                : "bg-red-600 hover:bg-red-500 border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
            }
            className="w-64 text-xl py-5 shadow-xl"
          />
        </div>

        <div className="mt-4 text-gray-500 text-xs uppercase tracking-widest animate-pulse">
          Sıra: {currentPlayer === "p1" ? "MAVİ TAKIM" : "KIRMIZI TAKIM"}
        </div>
      </div>

      {/* --- MODALLER --- */}
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={restartGame}
          onQuit={handleBackToMenu}
        />
      )}

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
