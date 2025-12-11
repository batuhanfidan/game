import { useState, useEffect, useCallback, useRef } from "react";
import { rtdb } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { calculateShotResult } from "../shared/utils/calculateShotResult";
import type {
  GameState,
  ActionMessage,
  VisualEffectData,
} from "../shared/types";
import { playSound } from "../shared/utils/sound";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { roomService } from "../services/roomService";

// ... (calculateVariantTime ve calculateTargetOffset AYNI KALSIN) ...
const calculateVariantTime = (
  elapsed: number,
  variant: string,
  seed: number = 0
): number => {
  switch (variant) {
    case "unstable":
      return elapsed + Math.sin(elapsed / 500) * 200;
    case "random":
      return elapsed + seed;
    default:
      return elapsed;
  }
};

const calculateTargetOffset = (variant: string, seed: number): number => {
  if (variant === "moving") return 200 + (seed % 600);
  return 500;
};

// YENİ: Mesaj Formatlayıcı (Gelen "penalty_miss" gibi kodları düzeltebiliriz)
const formatMessage = (msg: string, result: string) => {
  // Eğer mesaj düzgünse olduğu gibi döndür, değilse Result'u kullan
  if (!msg || msg.includes("_")) {
    return result; // "GOL", "ISKA", "DİREK" döner
  }
  return msg;
};

export const useOnlineGameLogic = (roomId: string) => {
  const navigate = useNavigate();

  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const gameTimeRef = useRef(0);

  const [targetOffset, setTargetOffset] = useState(500);
  const targetOffsetRef = useRef(500);

  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<"p1" | "p2">("p1");
  const [actionMessage, setActionMessage] = useState<ActionMessage>({
    text: "",
  }); // Başlangıç boş
  const [visualEffect, setVisualEffect] = useState<VisualEffectData | null>(
    null
  );

  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: "Oyuncu 2",
  });

  const [gameVariant, setGameVariant] = useState("classic");
  const [roundSeed, setRoundSeed] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);

  const [isGamePaused, setIsGamePaused] = useState(false);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [playersTimeLeft, setPlayersTimeLeft] = useState({ p1: 180, p2: 180 });

  const initialPlayersTimeRef = useRef({ p1: 180, p2: 180 });
  const currentPlayerRef = useRef<"p1" | "p2">("p1");
  const timeoutTriggeredRef = useRef(false);

  const animationRef = useRef<number>(0);

  // 1. Sunucu Zaman Farkı
  useEffect(() => {
    const offsetRef = ref(rtdb, ".info/serverTimeOffset");
    const unsub = onValue(offsetRef, (snap) =>
      setServerOffset(snap.val() || 0)
    );
    return () => unsub();
  }, []);

  // 2. Veri Dinleme
  useEffect(() => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const gameRef = ref(rtdb, `games/${roomId}`);

    const unsubRoom = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        toast.error("Oda kapatıldı!", { id: "room-closed" });
        navigate("/online-lobby");
        return;
      }
      if (data.settings) setGameVariant(data.settings.variant || "classic");
      if (data.players) {
        setPlayerNames({
          p1: data.players.p1?.username || "Oyuncu 1",
          p2: data.players.p2?.username || "Oyuncu 2",
        });
        if (gameState === "playing" && !data.players.p2) {
          toast("Rakip oyundan ayrıldı.", { icon: "🏃‍♂️", id: "opponent-left" });
        }
      }
    });

    const unsubGame = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setGameState(data.status);
      if (data.scores) setScores(data.scores);

      if (data.currentTurn) {
        setCurrentPlayer(data.currentTurn);
        currentPlayerRef.current = data.currentTurn;
        timeoutTriggeredRef.current = false;
      }

      setIsGamePaused(data.isPaused || false);
      setTotalPausedTime(data.totalPaused || 0);
      setRoundSeed(data.roundSeed || 0);

      const newTarget = calculateTargetOffset(gameVariant, data.roundSeed || 0);
      setTargetOffset(newTarget);
      targetOffsetRef.current = newTarget;

      if (data.roundStartTime) setStartTime(data.roundStartTime);
      if (data.turnStartTime) setTurnStartTime(data.turnStartTime);

      if (data.timeRemaining) {
        initialPlayersTimeRef.current = data.timeRemaining;
        setPlayersTimeLeft(data.timeRemaining);
      }

      if (data.rematchRequested) {
        toast("Misafir tekrar oynamak istiyor!", {
          icon: "🔄",
          id: "rematch-request",
          duration: Infinity,
          style: { border: "1px solid #EAB308", color: "#EAB308" },
        });
      }

      // --- DÜZELTİLEN KISIM: GÖRSEL EFEKTLER ---
      if (data.lastAction && data.lastAction.timestamp > Date.now() - 2000) {
        // isGoal verisini direkt okuyoruz, yoksa result stringine bakıyoruz
        const { result, player, message, isGoal } = data.lastAction;

        // Güvenli Kontrol: isGoal varsa onu kullan, yoksa string kontrolü yap
        const success =
          isGoal !== undefined
            ? isGoal
            : result === "GOL" || result === "MÜKEMMEL";

        const displayText = formatMessage(message, result);

        if (success) {
          setVisualEffect({ type: "goal", player });
          playSound("goal");
          setActionMessage({
            text: displayText,
            icon: CheckCircle,
            className: "text-green-400",
          });
        } else {
          setVisualEffect({
            type: result === "DİREK" ? "post" : "miss",
            player,
          });
          playSound("miss");
          setActionMessage({
            text: displayText,
            icon: XCircle,
            className: "text-red-400",
          });
        }
      }
    });

    return () => {
      unsubRoom();
      unsubGame();
    };
  }, [roomId, gameState, navigate, gameVariant]);

  // 4. HAMLE YAP
  const handleAction = useCallback(
    async (isTimeout = false) => {
      if (gameState !== "playing") return;

      if (!isTimeout) playSound("kick");

      const currentMs = gameTimeRef.current % 1000;
      const currentTarget = targetOffsetRef.current;
      const diff = Math.abs(currentMs - currentTarget);

      let resultData;
      if (isTimeout) {
        resultData = {
          result: "SÜRE DOLDU",
          isGoal: false,
          message: "GEÇ KALDIN!",
        };
      } else {
        resultData = calculateShotResult(diff);
      }

      const { result, isGoal, message } = resultData;

      const currentRole = currentPlayerRef.current;
      const nextTurn = currentRole === "p1" ? "p2" : "p1";
      const newScore = isGoal ? scores[currentRole] + 1 : scores[currentRole];

      const now = Date.now() + serverOffset;
      const elapsedThisTurn = Math.max(
        0,
        (now - (turnStartTime || now)) / 1000
      );

      const newTimes = { ...initialPlayersTimeRef.current };
      newTimes[currentRole] = Math.max(
        0,
        newTimes[currentRole] - elapsedThisTurn
      );

      const WIN_SCORE = 5;
      let nextStatus: GameState = "playing";
      if (newScore >= WIN_SCORE || newTimes[currentRole] <= 0)
        nextStatus = "finished";

      const gameRef = ref(rtdb, `games/${roomId}`);

      await update(gameRef, {
        currentTurn: nextTurn,
        scores: { ...scores, [currentRole]: newScore },
        status: nextStatus,
        turnStartTime: now, // Tur süresini sıfırla
        roundSeed: Math.floor(Math.random() * 1000),
        timeRemaining: newTimes,
        isPaused: false,
        totalPaused: 0,
        lastAction: {
          player: currentRole,
          result: result,
          isGoal: isGoal, // <-- DÜZELTME: isGoal değerini de gönderiyoruz!
          message: message,
          timestamp: Date.now(),
        },
      });
    },
    [scores, roomId, gameState, turnStartTime, serverOffset]
  );

  // ... (Timeout handler ve Ana Döngü aynı kalsın) ...
  const handleAutoMiss = useCallback(() => {
    handleAction(true);
  }, [handleAction]);

  useEffect(() => {
    if (gameState !== "playing" || !startTime || isGamePaused) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    const animate = () => {
      const now = Date.now() + serverOffset;
      const elapsed = Math.max(0, now - startTime - totalPausedTime);
      const finalTime = calculateVariantTime(elapsed, gameVariant, roundSeed);
      setGameTimeMs(finalTime);
      gameTimeRef.current = finalTime;

      const turnElapsedRaw = Math.max(0, now - (turnStartTime || now));
      const currentTurnLeft = Math.max(0, 10 - turnElapsedRaw / 1000);
      setTurnTimeLeft(currentTurnLeft);

      const currentRole = currentPlayerRef.current;
      const initialTime = initialPlayersTimeRef.current[currentRole];
      const playerLeft = Math.max(0, initialTime - turnElapsedRaw / 1000);
      setPlayersTimeLeft((prev) => ({ ...prev, [currentRole]: playerLeft }));

      if (currentTurnLeft <= 0 && !timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true;
        handleAutoMiss();
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    gameState,
    startTime,
    turnStartTime,
    serverOffset,
    isGamePaused,
    totalPausedTime,
    gameVariant,
    roundSeed,
    handleAutoMiss,
  ]);

  useEffect(() => {
    if (visualEffect) {
      const t = setTimeout(() => setVisualEffect(null), 1500);
      return () => clearTimeout(t);
    }
  }, [visualEffect]);

  return {
    gameState,
    gameTimeMs,
    targetOffset,
    scores,
    currentPlayer,
    playerNames,
    actionMessage,
    visualEffect,
    handleAction: () => handleAction(false),
    initializeGame: () => {},
    isGamePaused,
    gameVariant,
    turnTimeLeft,
    playersTimeLeft,
    toggleGamePause: (paused: boolean) =>
      roomService.toggleGamePause(roomId, paused),
  };
};
