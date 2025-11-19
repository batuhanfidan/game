import { useState, useEffect, useRef, useCallback } from "react";
import { calculateShotResult } from "../utils/calculateShotResult";
import { triggerWinConfetti } from "../utils/confetti";
import { playSound } from "../utils/sound";

type Player = "p1" | "p2";
type GameState = "idle" | "countdown" | "playing" | "finished";

interface UseGameLogicProps {
  initialTime?: number;
  isBotMode?: boolean;
  botReactionTime?: number;
  botAccuracy?: number;
}

export const useGameLogic = ({
  initialTime = 120,
  isBotMode = false,
  botReactionTime = 2000,
  botAccuracy = 0.5,
}: UseGameLogicProps = {}) => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("p1");

  // YENİ: İsim Yönetimi
  const [playerNames, setPlayerNames] = useState({
    p1: "Oyuncu 1",
    p2: isBotMode ? "Bot" : "Oyuncu 2",
  });

  const [playerTimes, setPlayerTimes] = useState({
    p1: initialTime,
    p2: initialTime,
  });
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const [highScore, setHighScore] = useState(() => {
    if (!isBotMode) return 0;
    const saved = localStorage.getItem("timing-game-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [actionMessage, setActionMessage] = useState("");
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Oyuncu ismini getiren yardımcı fonksiyon
  const getCurrentPlayerName = useCallback(() => {
    return playerNames[currentPlayer];
  }, [currentPlayer, playerNames]);

  const finishGame = useCallback(() => {
    setGameState("finished");
    playSound("whistle");

    setFinalScore(
      `Skor: ${playerNames.p1} [${scores.p1}] - [${scores.p2}] ${playerNames.p2}`
    );

    if (scores.p1 > scores.p2) {
      setWinner(`🏆 ${playerNames.p1} kazandı!`);
      triggerWinConfetti();
      if (isBotMode && scores.p1 > highScore) {
        setHighScore(scores.p1);
        localStorage.setItem("timing-game-highscore", scores.p1.toString());
      }
    } else if (scores.p2 > scores.p1) {
      setWinner(`🏆 ${playerNames.p2} kazandı!`);
    } else {
      setWinner("🤝 Berabere!");
    }
  }, [scores, isBotMode, highScore, playerNames]);

  const handleTurnSwitch = useCallback(() => {
    setCurrentPlayer((prev) => (prev === "p1" ? "p2" : "p1"));
    setTurnTimeLeft(10);
  }, []);

  const startGame = useCallback(() => {
    playSound("whistle");
    let count = 3;
    setCountdown(count);

    const id = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(id);
        setCountdown(null);
        setGameState("playing");

        const startPlayer = Math.random() < 0.5 ? "p1" : "p2";
        setCurrentPlayer(startPlayer);
        const startName = playerNames[startPlayer];
        setActionMessage(`🎲 Yazı tura sonucu: ${startName} başlıyor!`);
      }
    }, 1000);
  }, [playerNames]);

  useEffect(() => {
    if (gameState !== "playing") return;
    startTimeRef.current = Date.now() - gameTimeMs;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      setGameTimeMs(elapsed);
      if (elapsed >= 300000) finishGame();
    }, 10);
    return () => clearInterval(interval);
  }, [gameState, finishGame]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => Math.max(0, prev - 1));
      setPlayerTimes((prev) => {
        const newTimes = { ...prev };
        if (newTimes[currentPlayer] <= 0) return prev;
        newTimes[currentPlayer] -= 1;
        return newTimes;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentPlayer]);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (turnTimeLeft === 0) {
      setActionMessage(`⏰ ${getCurrentPlayerName()} süresini doldurdu!`);
      playSound("miss");
      handleTurnSwitch();
    }
    if (playerTimes[currentPlayer] === 0) {
      finishGame();
    }
  }, [
    turnTimeLeft,
    playerTimes,
    currentPlayer,
    gameState,
    handleTurnSwitch,
    finishGame,
    getCurrentPlayerName,
  ]);

  const handleAction = useCallback(() => {
    if (gameState !== "playing") return;
    if (isBotMode && currentPlayer === "p2") return;

    playSound("kick");
    const currentMs = gameTimeMs % 1000;
    const { result, message, isGoal } = calculateShotResult(currentMs);
    const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");
    const playerName = getCurrentPlayerName();

    if (isGoal || result === "GOL") {
      playSound("goal");
      setActionMessage(`${playerName}: ${message} (${displayMs}ms)`);
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }));
    } else {
      playSound("miss");
      setActionMessage(`${playerName}: ${message} (${displayMs}ms)`);
    }
    handleTurnSwitch();
  }, [
    gameState,
    isBotMode,
    currentPlayer,
    gameTimeMs,
    handleTurnSwitch,
    getCurrentPlayerName,
  ]);

  // Klavye
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  useEffect(() => {
    if (!isBotMode || gameState !== "playing" || currentPlayer !== "p2") return;
    const timer = setTimeout(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      let currentMs = elapsed % 1000;
      if (botAccuracy >= 0.9) currentMs = Math.floor(Math.random() * 40);
      else if (botAccuracy >= 0.7) currentMs = Math.floor(Math.random() * 150);

      playSound("kick");
      const { result, message, isGoal } = calculateShotResult(currentMs);
      const isSuccess =
        result === "GOL" || (isGoal && Math.random() < botAccuracy);
      const displayMs = String(Math.floor(currentMs / 10)).padStart(2, "0");

      if (isSuccess) {
        playSound("goal");
        setActionMessage(`🤖 ${playerNames.p2}: ${message} (${displayMs}ms)`);
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      } else {
        playSound("miss");
        if (isGoal)
          setActionMessage(
            `🤖 ${playerNames.p2}: İnanılmaz! Net golü kaçırdı! (${displayMs}ms)`
          );
        else
          setActionMessage(`🤖 ${playerNames.p2}: ${message} (${displayMs}ms)`);
      }
      handleTurnSwitch();
    }, botReactionTime);
    return () => clearTimeout(timer);
  }, [
    gameState,
    currentPlayer,
    isBotMode,
    botReactionTime,
    handleTurnSwitch,
    botAccuracy,
    playerNames,
  ]);

  const restartGame = useCallback(() => {
    setGameState("idle");
    setGameTimeMs(0);
    setScores({ p1: 0, p2: 0 });
    setPlayerTimes({ p1: initialTime, p2: initialTime });
    setTurnTimeLeft(10);
    setActionMessage("");
  }, [initialTime]);

  return {
    gameState,
    gameTimeMs,
    turnTimeLeft,
    currentPlayer,
    playerTimes,
    scores,
    highScore,
    actionMessage,
    winner,
    finalScore,
    countdown,
    startGame,
    handleAction,
    restartGame,
    getCurrentPlayerName,
    setPlayerNames,
    playerNames, // setPlayerNames dışarı açıldı
  };
};
