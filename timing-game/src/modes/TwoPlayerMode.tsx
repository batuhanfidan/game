import { useEffect, useState } from "react";
import TimerDisplay from "../components/TimerDisplay";
import PlayerTimer from "../components/PlayerTimer";
import ActionButton from "../components/ActionButton";
import TurnInfo from "../components/TurnInfo";
import GameOverModal from "../components/GameOverModal";
import { calculateShotResult } from "../utils/calculateShotResult";
import RulesModal from "../components/RulesModel";

function App() {
  const [gameTime, setGameTime] = useState({ minutes: 0, seconds: 0, ms: 0 });
  const [turnTimeLeft, setTurnTimeLeft] = useState(10);
  const [currentPlayer, setCurrentPlayer] = useState("Oyuncu 1");
  const [isGameOver, setIsGameOver] = useState(false);
  const [player1Time, setPlayer1Time] = useState(120);
  const [player2Time, setPlayer2Time] = useState(120);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState("");
  const [finalScore, setFinalScore] = useState("");
  const [showRules, setShowRules] = useState(false);

  const [player1Ready, setPlayer1Ready] = useState(false);
  const [player2Ready, setPlayer2Ready] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  const [actionMessage, setActionMessage] = useState("");

  const finishGame = () => {
    setIsGameOver(true);
    setFinalScore(
      `Skor: Oyuncu 1 [${player1Score}] - [${player2Score}] Oyuncu 2`
    );
    if (player1Score > player2Score) setWinner("🏆 Oyuncu 1 kazandı!");
    else if (player2Score > player1Score) setWinner("🏆 Oyuncu 2 kazandı!");
    else setWinner("🤝 Oyun berabere bitti!");
  };

  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    if (player1Time === 0 && player2Time === 0) {
      finishGame();
    }

    if (gameTime.minutes * 60 + gameTime.seconds >= 300) {
      finishGame();
    }
  }, [gameTime, player1Time, player2Time, gameStarted, isGameOver]);

  // Timer
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      setGameTime((prev) => {
        let ms = prev.ms + 10;
        let seconds = prev.seconds;
        let minutes = prev.minutes;

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

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  // Oyuncuların süresi
  useEffect(() => {
    if (!gameStarted) return;
    const interval = setInterval(() => {
      if (activePlayer === 1) setPlayer1Time((t) => Math.max(t - 1, 0));
      else setPlayer2Time((t) => Math.max(t - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activePlayer, gameStarted]);

  // Tur süresi
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSwitch();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, currentPlayer]);

  // 🔹 Sıra değişince sayaç sıfırla
  useEffect(() => {
    setTurnTimeLeft(10);
  }, [currentPlayer]);

  // Yazı tura
  useEffect(() => {
    if (gameStarted) {
      const randomStart = Math.random() < 0.5 ? 1 : 2;
      setActivePlayer(randomStart);
      setCurrentPlayer(randomStart === 1 ? "Oyuncu 1" : "Oyuncu 2");
      setActionMessage(
        `🎲 Yazı tura sonucu: ${
          randomStart === 1 ? "Oyuncu 1" : "Oyuncu 2"
        } başlıyor!`
      );
    }
  }, [gameStarted]);

  // Eylem
  const handleButtonClick = (player: 1 | 2) => {
    if (!gameStarted || isGameOver) return;
    if (activePlayer !== player) return;
    const msValue = gameTime.ms % 100;
    const { message, isGoal } = calculateShotResult(msValue);

    setActionMessage(`${currentPlayer}: ${message} (${msValue}ms)`);

    if (isGoal) {
      if (player === 1) setPlayer1Score((s) => s + 1);
      else setPlayer2Score((s) => s + 1);
    }

    handleTurnSwitch();
  };

  const handleTurnSwitch = () => {
    const nextPlayer = activePlayer === 1 ? 2 : 1;
    setActivePlayer(nextPlayer);
    setCurrentPlayer(nextPlayer === 1 ? "Oyuncu 1" : "Oyuncu 2");
    setTurnTimeLeft(10);
  };

  const handleAutoSwitch = () => {
    setActionMessage(`⏰ ${currentPlayer} süresini doldurdu, sıra değişti.`);
    handleTurnSwitch();
  };

  const handleRestart = () => {
    setGameTime({ minutes: 0, seconds: 0, ms: 0 });
    setTurnTimeLeft(10);
    setCurrentPlayer("Oyuncu 1");
    setIsGameOver(false);
    setPlayer1Time(120);
    setPlayer2Time(120);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Ready(false);
    setPlayer2Ready(false);
    setCountdown(null);
    setGameStarted(false);
    setActionMessage("");
  };

  // Hazır ve başlama
  useEffect(() => {
    if (player1Ready && player2Ready && !gameStarted) {
      let count = 3;
      setCountdown(count);

      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(countdownInterval);
          setCountdown(null);
          setGameStarted(true);
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [player1Ready, player2Ready, gameStarted]);

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

      {/* 🏆 Skor Board */}
      <div className="absolute top-2 sm:top-4 text-lg sm:text-2xl md:text-3xl font-extrabold text-center text-yellow-400 drop-shadow-lg px-4 max-sm:mt-6">
        🏆 Skor: Oyuncu 1 [{player1Score}] - [{player2Score}] Oyuncu 2
      </div>

      {/* Oyuncuların süreleri */}
      <div className="absolute top-12 sm:top-16 flex justify-between w-full px-4 sm:px-10 md:px-20 text-base sm:text-lg md:text-xl">
        <PlayerTimer
          player="🧍‍♂️ Oyuncu 1"
          minutes={Math.floor(player1Time / 60)}
          seconds={player1Time % 60}
        />
        <PlayerTimer
          player="🧍‍♂️ Oyuncu 2"
          minutes={Math.floor(player2Time / 60)}
          seconds={player2Time % 60}
        />
      </div>

      {/* Hazır ekranı */}
      {!gameStarted && (
        <div className="flex flex-col items-center justify-center gap-4 text-white text-lg sm:text-xl md:text-2xl px-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
            <button
              onClick={() => setPlayer1Ready(true)}
              disabled={player1Ready}
              className={`px-4 py-2 rounded text-base sm:text-lg ${
                player1Ready ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Oyuncu 1 Hazır
            </button>
            <button
              onClick={() => setPlayer2Ready(true)}
              disabled={player2Ready}
              className={`px-4 py-2 rounded text-base sm:text-lg ${
                player2Ready ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Oyuncu 2 Hazır
            </button>
          </div>

          {/* 🔹 Menüye Dön butonu HAZIRLARIN ALTINA GETİRİLDİ */}
          <button
            onClick={() => window.dispatchEvent(new Event("back-to-menu"))}
            className="mt-2 text-white text-sm hover:underline"
          >
            🔙 Menüye Dön
          </button>

          {countdown !== null && (
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold mt-4">
              {countdown}
            </div>
          )}
        </div>
      )}

      {/* Orta Sayaç */}
      {gameStarted && (
        <>
          <TimerDisplay
            minutes={gameTime.minutes}
            seconds={gameTime.seconds}
            milliseconds={gameTime.ms}
          />

          {/* Aksiyon mesajı */}
          <div className="text-base sm:text-xl md:text-2xl mt-4 text-center text-green-400 font-semibold px-4">
            {actionMessage}
          </div>

          {/* Sıra Bilgisi */}
          <TurnInfo currentPlayer={currentPlayer} turnTimeLeft={turnTimeLeft} />

          {/* Butonlar */}
          <div className="flex justify-center w-full px-4 mt-8 transition-all duration-200">
            {currentPlayer === "Oyuncu 1" ? (
              <ActionButton
                onClick={() => handleButtonClick(1)}
                disabled={false}
              />
            ) : (
              <ActionButton
                onClick={() => handleButtonClick(2)}
                disabled={false}
              />
            )}
          </div>
        </>
      )}

      {/* Game Over ekranı */}
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
}

export default App;
