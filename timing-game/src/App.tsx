import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainMenu from "./features/menu/MainMenu";
import TwoPlayerMode from "./features/modes/multi/TwoPlayerMode";
import BotMode from "./features/modes/single/BotMode";
import PenaltyMode from "./features/modes/multi/PenaltyMode";
import SurvivalMode from "./features/modes/single/SurvivalMode";
import TimeAttackMode from "./features/modes/single/TimeAttackMode";
import TutorialMode from "./features/modes/single/TutorialMode";
import Leaderboard from "./features/menu/Leaderboard";
import ErrorBoundary from "./components/ErrorBoundary";
import { soundsReady } from "./shared/utils/sound";
import { GameProvider } from "./context/GameContext";
import { useGameLogic } from "./hooks/useGameLogic";
import { useTheme } from "./hooks/core/useTheme";
import UsernameModal from "./components/auth/UsernameModal";
import { getUserByUid, syncUserScores } from "./services/api"; // getUserStats artık gerekmiyor
import { Loader2 } from "lucide-react";
import AdminPanel from "./features/AdminPanel";
import { secureStorage } from "./shared/utils/secureStorage"; // Import yolunu düzelttim

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    soundsReady.then(() => {
      console.log("All sounds loaded successfully");
    });

    const verifyUser = async () => {
      // SADECE GÜVENLİ VERİLERİ OKU
      const savedUid = secureStorage.getItem("timing_game_uid");
      const savedName = secureStorage.getItem("timing_game_username");

      if (savedUid) {
        try {
          // 1. ID KONTROLÜ (Taklit Edilemez)
          const userData = await getUserByUid(savedUid);

          if (userData) {
            // Kullanıcı veritabanında bulundu!

            // Ban Kontrolü

            if (userData.isBanned) {
              alert("HESABINIZ YASAKLANDI! 🚫");
              secureStorage.removeItem("timing_game_uid");
              secureStorage.removeItem("timing_game_username");
              setIsAuthenticated(false);
              setIsCheckingAuth(false);
              return;
            }

            // İsim Senkronizasyonu (Veritabanındaki isim farklıysa yereli güncelle)
            if (savedName && userData.username !== savedName) {
              console.log("İsim senkronize edildi:", userData.username);
              secureStorage.setItem("timing_game_username", userData.username);
              syncUserScores(savedUid, savedName, userData.username);
            }

            setIsAuthenticated(true);
          } else {
            // ID var ama veritabanında yok (Silinmiş)
            console.warn("Geçersiz kimlik, oturum kapatılıyor.");
            secureStorage.removeItem("timing_game_uid");
            secureStorage.removeItem("timing_game_username");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Doğrulama hatası:", error);
          setIsAuthenticated(false);
        }
      } else {
        // --- GÜVENLİK DUVARI ---
        // UID yoksa, isim olsa bile içeri alma!
        // Hacker sadece isim yazarsa buraya düşer ve reddedilir.
        if (savedName) {
          console.warn(
            "Eksik kimlik bilgisi. Güvenlik için tekrar giriş yapmalısınız."
          );
          // İstersen burada temizlik yapabilirsin ama yapmamak daha iyi (belki glitch olmuştur)
          // secureStorage.removeItem("timing_game_username");
        }
        setIsAuthenticated(false);
      }

      setIsCheckingAuth(false);
    };

    verifyUser();
  }, []);

  const { theme, currentTheme } = useTheme();

  const gameLogic = useGameLogic({
    initialTime: 60,
    gameMode: "classic",
    gameVariant: "classic",
  });

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-[#0f0f11] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GameProvider
        gameState={gameLogic.gameState}
        isPaused={gameLogic.isPaused}
        togglePause={gameLogic.togglePause}
        restartGame={gameLogic.restartGame}
        currentTheme={currentTheme}
        visualEffect={gameLogic.visualEffect}
        isTwoPlayerMode={false}
      >
        <div className={theme.class}>
          {!isAuthenticated ? (
            <UsernameModal onLoginSuccess={() => setIsAuthenticated(true)} />
          ) : (
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/game/2p" element={<TwoPlayerMode />} />
              <Route path="/game/bot" element={<BotMode />} />
              <Route path="/game/penalty" element={<PenaltyMode />} />
              <Route path="/game/survival" element={<SurvivalMode />} />
              <Route path="/game/time-attack" element={<TimeAttackMode />} />
              <Route path="/game/tutorial" element={<TutorialMode />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<MainMenu />} />
            </Routes>
          )}
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
