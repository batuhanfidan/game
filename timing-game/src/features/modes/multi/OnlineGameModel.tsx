import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOnlineGameLogic } from "../../../hooks/useOnlineGameLogic";
import GameLayout from "../../../components/layout/GameLayout";
import { GameProvider } from "../../../context/GameContext";
import { useTheme } from "../../../hooks/core/useTheme";
import TimerDisplay from "../../../components/game/TimerDisplay";
import ActionButton from "../../../components/common/ActionButton";
import TurnInfo from "../../../components/layout/TurnInfo";
import PlayerTimer from "../../../components/layout/PlayerTimer";
import GameOverModal from "../../../components/common/GameOverModal";
import PauseMenu from "../../../components/layout/PauseMenu";
import { Trophy, Loader2, User, Eye, Pause, LogOut } from "lucide-react";
import { secureStorage } from "../../../shared/utils/secureStorage";
import { roomService } from "../../../services/roomService";
import toast from "react-hot-toast";

const OnlineGameMode = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentTheme, nextTheme } = useTheme(2);

  const myName = secureStorage.getItem("timing_game_username");
  const myUid = secureStorage.getItem("timing_game_uid");

  const {
    gameState,
    gameTimeMs,
    scores,
    currentPlayer,
    playerNames,
    actionMessage,
    visualEffect,
    handleAction,
    initializeGame,
    isGamePaused,
    toggleGamePause,
    targetOffset,
    gameVariant,
    turnTimeLeft,
    playersTimeLeft,
  } = useOnlineGameLogic(roomId || "");

  const [amIHost, setAmIHost] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [myRole, setMyRole] = useState<"p1" | "p2" | null>(null);

  // Rol Belirleme
  useEffect(() => {
    if (!playerNames.p1 || playerNames.p1 === "Oyuncu 1") return;

    if (playerNames.p1 === myName) {
      setMyRole("p1");
      setAmIHost(true);
      setIsSpectator(false);
    } else if (playerNames.p2 === myName) {
      setMyRole("p2");
      setAmIHost(false);
      setIsSpectator(false);
    } else {
      setMyRole(null);
      setAmIHost(false);
      setIsSpectator(true);
    }
  }, [playerNames, myName]);

  // Host Başlatma (Artık Lobi yapıyor ama güvenlik için kalsın)
  useEffect(() => {
    if (amIHost && (gameState === "idle" || gameState === "waiting")) {
      initializeGame();
    }
  }, [amIHost, gameState, initializeGame]);

  // --- FONKSİYONLAR ---
  const handleHostRematch = async () => {
    toast.dismiss("rematch-request");
    await roomService.resetGame(roomId || "");
    toast.success("Lobiye dönülüyor...");
  };

  const handleGuestRequestRematch = async () => {
    await roomService.requestRematch(roomId || "");
    toast.success("İstek gönderildi! Host bekleniyor...", { icon: "⏳" });
  };

  const handleGuestQuit = async () => {
    if (roomId) {
      await roomService.leaveRoom(roomId, myUid || "", false);
      navigate("/online-lobby");
      toast("Oyun sonlandırıldı.");
    }
  };

  const handleHostQuit = async () => {
    if (roomId) {
      await roomService.leaveRoom(roomId, myUid || "", true);
      navigate("/online-lobby");
      toast("Oda kapatıldı.");
    }
  };

  useEffect(() => {
    if (gameState === "waiting") {
      navigate("/online-lobby", { state: { roomId: roomId } });
    }
  }, [gameState, navigate, roomId]);

  const handlePauseToggle = () => {
    if (amIHost) {
      toggleGamePause(!isGamePaused);
    }
  };

  const isMyTurn = myRole === currentPlayer;

  const scoreDisplay = (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="text-3xl font-black text-blue-400 drop-shadow-lg flex items-center gap-3 px-6 py-2 bg-black/40 rounded-full border border-blue-500/30">
        <Trophy size={24} className="text-yellow-400" />
        <span>
          {scores.p1} - {scores.p2}
        </span>
      </div>
      <div className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest uppercase">
        {roomId} ODA
      </div>
    </div>
  );

  if (!roomId)
    return <div className="p-10 text-center text-white">Oda Bulunamadı</div>;

  return (
    <GameProvider
      gameState={gameState}
      isPaused={isGamePaused}
      togglePause={handlePauseToggle}
      restartGame={() => {}}
      currentTheme={currentTheme}
      visualEffect={visualEffect}
      isTwoPlayerMode={true}
      currentPlayer={currentPlayer}
      scoreDisplay={scoreDisplay}
      bottomInfo={isSpectator ? "İZLEYİCİ MODU" : "ONLINE PVP"}
      onThemeChange={nextTheme}
    >
      <GameLayout hidePauseButton={true}>
        {amIHost ? (
          <button
            onClick={handlePauseToggle}
            disabled={gameState !== "playing"}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50"
            title="Duraklat"
          >
            <Pause size={24} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={
              isSpectator ? () => navigate("/online-lobby") : handleGuestQuit
            }
            className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors bg-black/20 p-2 rounded-lg"
          >
            <LogOut size={20} />{" "}
            <span className="text-xs font-bold">ÇIKIŞ</span>
          </button>
        )}

        <div className="absolute top-24 md:top-32 w-full px-4 md:px-20 flex justify-between text-gray-300 pointer-events-none">
          <PlayerTimer
            player={
              <div className="flex items-center gap-2">
                <User
                  size={16}
                  className={
                    currentPlayer === "p1" ? "text-green-400" : "text-gray-600"
                  }
                />
                <span
                  className={
                    playerNames.p1 === myName ? "text-yellow-400 font-bold" : ""
                  }
                >
                  {playerNames.p1}
                </span>
              </div>
            }
            minutes={Math.floor(playersTimeLeft.p1 / 60)}
            seconds={Math.floor(playersTimeLeft.p1 % 60)}
          />
          <PlayerTimer
            player={
              <div className="flex items-center gap-2">
                <User
                  size={16}
                  className={
                    currentPlayer === "p2" ? "text-green-400" : "text-gray-600"
                  }
                />
                <span
                  className={
                    playerNames.p2 === myName ? "text-yellow-400 font-bold" : ""
                  }
                >
                  {playerNames.p2}
                </span>
              </div>
            }
            minutes={Math.floor(playersTimeLeft.p2 / 60)}
            seconds={Math.floor(playersTimeLeft.p2 % 60)}
          />
        </div>

        <div className="mt-40 w-full max-w-lg flex flex-col items-center">
          {(gameState === "idle" || gameState === "waiting") && !isSpectator ? (
            <div className="text-center animate-pulse">
              <Loader2
                size={48}
                className="animate-spin mx-auto mb-4 text-blue-500"
              />
              <h2 className="text-xl font-bold">Oyun Başlatılıyor...</h2>
            </div>
          ) : (
            <>
              <TimerDisplay
                totalMs={gameTimeMs}
                targetOffset={targetOffset} // <-- Bu ayar "0ms" noktasını tam ortaya (500ms) sabitler
                showProgressBar={true}
                goldenThreshold={15}
                variant={
                  gameVariant as
                    | "classic"
                    | "ghost"
                    | "unstable"
                    | "random"
                    | "moving"
                }
              />
              <div
                className={`text-xl font-black mt-6 h-8 flex items-center gap-2 ${actionMessage.className} animate-popup`}
              >
                {actionMessage.icon && <actionMessage.icon size={24} />}
                {actionMessage.text}
              </div>

              <TurnInfo
                currentPlayer={playerNames[currentPlayer]}
                turnTimeLeft={Math.ceil(turnTimeLeft)} // <-- 10sn sayacı bağlandı
              />

              <div className="mt-12 w-full px-8 flex justify-center">
                {isSpectator ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="bg-neutral-800/80 text-white px-6 py-3 rounded-full font-bold text-sm border border-white/10 flex items-center gap-2 shadow-lg">
                      <Eye size={18} className="text-blue-400" />
                      İZLEYİCİ MODU
                    </div>
                  </div>
                ) : (
                  <ActionButton
                    onClick={handleAction}
                    disabled={
                      !isMyTurn || gameState !== "playing" || isGamePaused
                    }
                    customText={
                      isMyTurn
                        ? "VUR!"
                        : `${playerNames[currentPlayer]} BEKLENİYOR`
                    }
                    customColor={
                      isMyTurn
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-neutral-800 border border-white/10 text-gray-500"
                    }
                    className={
                      isMyTurn
                        ? "animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                        : "opacity-80"
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>

        {isGamePaused && amIHost && (
          <PauseMenu
            onResume={() => toggleGamePause(false)}
            onRestart={() => {
              if (confirm("Maçı sıfırlayıp lobiye dönmek istiyor musun?")) {
                handleHostRematch();
              }
            }}
            onQuit={handleHostQuit}
          />
        )}

        {isGamePaused && !amIHost && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl text-center shadow-2xl">
              <Loader2
                size={48}
                className="animate-spin text-yellow-500 mx-auto mb-4"
              />
              <h2 className="text-2xl font-black text-white">
                OYUN DURAKLATILDI
              </h2>
              <p className="text-gray-400 mt-2">Host bekleniyor...</p>

              <button
                onClick={handleGuestQuit}
                className="mt-8 px-6 py-3 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl font-bold text-sm transition-all border border-red-600/30"
              >
                ÇIKIŞ YAP
              </button>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <GameOverModal
            winner={scores.p1 > scores.p2 ? playerNames.p1 : playerNames.p2}
            finalScore={`${playerNames.p1} (${scores.p1}) - (${scores.p2}) ${playerNames.p2}`}
            onRestart={amIHost ? handleHostRematch : handleGuestRequestRematch}
            gameMode="multiplayer"
          />
        )}
      </GameLayout>
    </GameProvider>
  );
};

export default OnlineGameMode;
