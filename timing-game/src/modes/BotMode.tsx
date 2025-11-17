import { useEffect, useRef, useState } from "react";
import TimerDisplay from "../components/TimerDisplay";
import PlayerTimer from "../components/PlayerTimer";
import ActionButton from "../components/ActionButton";
import TurnInfo from "../components/TurnInfo";
import GameOverModal from "../components/GameOverModal";
import { calculateShotResult } from "../utils/calculateShotResult";
import RulesModal from "../components/RulesModel";

type Player = "Oyuncu 1" | "Bot";

const BotMode = () => {
  // Zaman durumları
  const [gameTime, setGameTime] = useState({ minutes: 0, seconds: 0, ms: 0 });
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("Oyuncu 1");
  const [player1Time, setPlayer1Time] = useState(120);
  const [botTime, setBotTime] = useState(120);

  // Oyun akışı
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Skor
  const [player1Score, setPlayer1Score] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");

  // Bot parametreleri
  const botReactionTime = 2500;
  const botAccuracy = 0.5;
  const botTimeoutRef = useRef<number | null>(null);

  const turnSwitchInProgressRef = useRef(false);
  const [showRules, setShowRules] = useState(false);

  // 🔹 Oyuncu hazır sistemi
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (playerReady && !gameStarted) {
      let c = 3;
      setCountdown(c);
      const countdownInterval = setInterval(() => {
        c--;
        setCountdown(c);
        if (c === 0) {
          clearInterval(countdownInterval);
          setCountdown(null);
          setGameStarted(true);
        }
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [playerReady, gameStarted]);

  //  Genel oyun süresi
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    if (gameTime.minutes * 60 + gameTime.seconds >= 300) {
      finishGame();
    }
  }, [gameTime, gameStarted, isGameOver]);

  //  Orta kronometre
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    const id = setInterval(() => {
      setGameTime((prev) => {
        let { minutes, seconds, ms } = prev;
        ms += 10;
        if (ms >= 1000) {
          ms = 0;
          seconds++;
        }
        if (seconds >= 60) {
          seconds = 0;
          minutes++;
        }
        return { minutes, seconds, ms };
      });
    }, 10);
    return () => clearInterval(id);
  }, [gameStarted, isGameOver]);

  //  Oyuncuların kendi süreleri
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    const id = setInterval(() => {
      if (currentPlayer === "Oyuncu 1") {
        setPlayer1Time((t) => Math.max(t - 1, 0));
      } else {
        setBotTime((t) => Math.max(t - 1, 0));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [currentPlayer, gameStarted, isGameOver]);

  //  Tur süresi
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    const id = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          if (!turnSwitchInProgressRef.current) {
            setActionMessage(`⏰ ${currentPlayer} süresini doldurdu!`);
            switchTurn();
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gameStarted, currentPlayer, isGameOver]);

  //  Başlangıç yazı-tura
  useEffect(() => {
    if (!gameStarted) return;
    const start: Player = Math.random() < 0.5 ? "Oyuncu 1" : "Bot";
    setCurrentPlayer(start);
    setActionMessage(`🎲 Yazı tura sonucu: ${start} başlıyor!`);
  }, [gameStarted]);

  //  Tur değiştirme fonksiyonu
  const switchTurn = () => {
    if (turnSwitchInProgressRef.current) return;
    turnSwitchInProgressRef.current = true;

    setTimeout(() => {
      setCurrentPlayer((prev) => (prev === "Oyuncu 1" ? "Bot" : "Oyuncu 1"));
      setTurnTimeLeft(10);
      turnSwitchInProgressRef.current = false;
    }, 100);
  };

  //  Oyuncu tıklayınca
  const handleButtonClick = () => {
    if (!gameStarted || isGameOver) return;
    if (currentPlayer !== "Oyuncu 1") return;
    if (turnSwitchInProgressRef.current) return;

    const msValue = gameTime.ms % 100;
    const { message, isGoal } = calculateShotResult(msValue);
    setActionMessage(`⚽ Oyuncu 1: ${message} (${msValue}ms)`);

    if (isGoal) {
      setPlayer1Score((s) => s + 1);
    }

    switchTurn();
  };

  //  Bot hamlesi
  useEffect(() => {
    if (!gameStarted || isGameOver) return;
    if (currentPlayer !== "Bot") {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
      return;
    }

    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);

    botTimeoutRef.current = window.setTimeout(() => {
      if (turnSwitchInProgressRef.current) return;

      const msValue = gameTime.ms % 100;
      const { message, isGoal } = calculateShotResult(msValue);
      const success = Math.random() < botAccuracy;
      const botMessage = success ? message : "Kötü atış! Top dışarıda.";

      setActionMessage(`🤖 Bot: ${botMessage} (${msValue}ms)`);

      if (success && isGoal) {
        setBotScore((s) => s + 1);
      }

      switchTurn();
    }, botReactionTime);

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
    };
  }, [currentPlayer, gameStarted, isGameOver]);

  //  Bitiş
  const finishGame = () => {
    setIsGameOver(true);
    setFinalScore(`Skor: Oyuncu 1 [${player1Score}] - [${botScore}] Bot`);
    if (player1Score > botScore) {
      setWinner("🏆 Oyuncu 1 kazandı!");
    } else if (botScore > player1Score) {
      setWinner("🤖 Bot kazandı!");
    } else {
      setWinner("🤝 Berabere!");
    }
  };

  //  Restart
  const handleRestart = () => window.location.reload();

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-center items-center relative font-mono overflow-hidden">
      <button
        onClick={() => setShowRules(true)}
        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 
             text-white rounded-full w-8 h-8 flex items-center 
             justify-center text-lg font-bold z-[60]
             sm:top-4 sm:right-4 sm:w-10 sm:h-10 sm:text-xl"
        title="Oyun Kuralları"
      >
        ?
      </button>
      <RulesModal showRules={showRules} onClose={() => setShowRules(false)} />

      {/* 🔹 Oyuncu Hazır ekranı */}
      {!gameStarted && (
        <div className="flex flex-col items-center justify-center gap-4 text-lg">
          <button
            onClick={() => setPlayerReady(true)}
            disabled={playerReady}
            className={`px-4 py-2 rounded text-base sm:text-lg ${
              playerReady ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Oyuncu Hazır
          </button>

          {/* Menüye dön butonu */}
          <button
            onClick={() => window.dispatchEvent(new Event("back-to-menu"))}
            className="text-white text-sm hover:underline"
          >
            🔙 Menüye Dön
          </button>

          {/* geri sayım sadece bir kere */}
          {countdown !== null && (
            <div className="text-5xl font-bold mt-4">{countdown}</div>
          )}
        </div>
      )}

      {/* Skor */}
      <div className="absolute top-2 sm:top-4 text-lg sm:text-2xl md:text-3xl font-extrabold text-center text-yellow-400 drop-shadow-lg px-4 max-sm:mt-6">
        🏆 Skor: Oyuncu 1 [{player1Score}] - [{botScore}] Bot
      </div>

      {/* Oyuncu süreleri */}
      <div className="absolute top-12 sm:top-16 flex justify-between w-full px-4 sm:px-10 md:px-20 text-base sm:text-lg md:text-xl">
        <PlayerTimer
          player="🧍‍♂️ Oyuncu 1"
          minutes={Math.floor(player1Time / 60)}
          seconds={player1Time % 60}
        />
        <PlayerTimer
          player="🤖 Bot"
          minutes={Math.floor(botTime / 60)}
          seconds={botTime % 60}
        />
      </div>

      {/* Oyun ekranı */}
      {gameStarted && !isGameOver && (
        <>
          <TimerDisplay
            minutes={gameTime.minutes}
            seconds={gameTime.seconds}
            milliseconds={gameTime.ms}
          />
          <div className="text-base sm:text-xl md:text-2xl mt-4 text-center text-green-400 font-semibold px-4">
            {actionMessage}
          </div>
          <TurnInfo currentPlayer={currentPlayer} turnTimeLeft={turnTimeLeft} />

          <div
            className={`flex justify-center w-full px-4 mt-8 transition-all duration-200 ${
              currentPlayer !== "Oyuncu 1"
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <ActionButton onClick={handleButtonClick} />
          </div>
        </>
      )}

      {/* Oyun sonu */}
      {isGameOver && (
        <GameOverModal
          winner={winner}
          finalScore={finalScore}
          onRestart={handleRestart}
        />
      )}

      <div className="absolute bottom-2 text-xs sm:text-xl ">
        🎯 Amaç: Doğru zamanlama ile gol atmaya çalış!
      </div>
    </div>
  );
};

export default BotMode;
