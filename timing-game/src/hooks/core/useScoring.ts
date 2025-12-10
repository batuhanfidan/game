import { useState, useCallback, useEffect } from "react";
import {
  getUserStats, // <-- Bunu import ettiğinizden emin olun
  saveScoreToApi,
  type ScoreData,
} from "../../services/api";
import { secureStorage } from "../../shared/utils/secureStorage"; // <-- Bunu import ettiğinizden emin olun
import type { GameMode, GameVariant } from "../../shared/types";

export const useScoring = (gameMode: GameMode, gameVariant: GameVariant) => {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [highScore, setHighScore] = useState(0);
  const [leaderboard] = useState<ScoreData[]>([]);

  const apiKey =
    gameMode === "time_attack" || gameMode === "survival"
      ? gameMode
      : `${gameMode}_${gameVariant}`;


  const loadHighScore = useCallback(async () => {
    // Klasik ve Bot modlarında skor takibi yapılmıyorsa çık
    if (gameMode === "classic" || gameMode === "bot") return;

    // Kullanıcı adını al
    const username = secureStorage.getItem("timing_game_username");
    if (!username) return;

    console.log(`📡 [CLIENT] Kişisel rekor isteniyor... Mod: ${gameMode}`);
    try {
      // API'den sadece bu kullanıcının istatistiklerini al
      const stats = await getUserStats(username);

      if (stats) {
        let personalBest = 0;

        if (gameMode === "survival") {
          personalBest = stats.bestSurvival || 0;
        } else if (gameMode === "time_attack") {
          personalBest = stats.bestTimeAttack || 0;
        }
        console.log(`🏆 [CLIENT] Kişisel En İyi Skor: ${personalBest}`);
        setHighScore(personalBest);
      } else {
        setHighScore(0);
      }
    } catch (error) {
      console.error("🔴 [CLIENT] Skor çekme hatası:", error);
    }
  }, [gameMode]);

  // Sayfa açılışında çalıştır
  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  // 2. SKOR KAYDETME
  const updateHighScore = useCallback(
    async (score: number, playerName: string = "Oyuncu") => {
      console.log(`💾 [CLIENT] Skor kaydediliyor: ${score}`);

      // Optimistic Update (Anında göster ki gecikme olmasın)
      setHighScore((prev) => Math.max(prev, score));

      // Sunucuya gönder
      await saveScoreToApi(apiKey, playerName, score);

      // Listeyi güncellemek için bekle ve çek
      setTimeout(() => {
        console.log("🔄 [CLIENT] Kayıt sonrası veri güncelleniyor...");
        loadHighScore();
      }, 1000);
    },
    [apiKey, loadHighScore]
  );

  const resetScores = useCallback(() => {
    setScores({ p1: 0, p2: 0 });
    // resetlendiğinde de tekrar yükle
    loadHighScore();
  }, [loadHighScore]);

  return {
    scores,
    setScores,
    highScore,
    updateHighScore,
    resetScores,
    leaderboard,
  };
};