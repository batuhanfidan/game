import { useState, useCallback, useEffect } from "react";
import {
  getLeaderboard,
  saveScoreToApi,
  type ScoreData,
} from "../../../../server/src/services/api";
import type { GameMode, GameVariant } from "../../shared/types";

export const useScoring = (gameMode: GameMode, gameVariant: GameVariant) => {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreData[]>([]);

  const apiKey =
    gameMode === "time_attack" || gameMode === "survival"
      ? gameMode
      : `${gameMode}_${gameVariant}`;

  // 1. SKORLARI ÇEKME (Debug Loglu)
  const loadHighScore = useCallback(async () => {
    if (gameMode === "classic" || gameMode === "bot") return;

    console.log(`📡 [CLIENT] Sunucudan skor isteniyor... Mod: ${apiKey}`);

    try {
      // API'yi çağır
      const data = (await getLeaderboard(apiKey)) as ScoreData[];

      console.log("📦 [CLIENT] Sunucudan gelen ham veri:", data);

      if (data && Array.isArray(data) && data.length > 0) {
        setLeaderboard(data);
        // Skorları sayıya çevirip en yükseği bul (Garanti olsun)
        const scoresList = data.map((d) => Number(d.score));
        const topScore = Math.max(...scoresList);

        console.log(`🏆 [CLIENT] Hesaplanan En Yüksek Skor: ${topScore}`);
        setHighScore(topScore);
      } else {
        console.warn("⚠️ [CLIENT] Veri boş veya hatalı formatta geldi.");
        setHighScore(0);
      }
    } catch (error) {
      console.error("🔴 [CLIENT] Skor çekme hatası:", error);
    }
  }, [apiKey, gameMode]);

  // Sayfa açılışında çalıştır
  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  // 2. SKOR KAYDETME
  const updateHighScore = useCallback(
    async (score: number, playerName: string = "Oyuncu") => {
      console.log(`💾 [CLIENT] Skor kaydediliyor: ${score}`);

      // Optimistic Update (Anında göster)
      setHighScore((prev) => Math.max(prev, score));

      // Sunucuya gönder
      await saveScoreToApi(apiKey, playerName, score);

      // Listeyi güncellemek için bekle ve çek
      setTimeout(() => {
        console.log("🔄 [CLIENT] Kayıt sonrası liste güncelleniyor...");
        loadHighScore();
      }, 1000);
    },
    [apiKey, loadHighScore]
  );

  const resetScores = useCallback(() => {
    setScores({ p1: 0, p2: 0 });
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
