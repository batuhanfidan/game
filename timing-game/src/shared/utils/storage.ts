import type { GameMode, GameVariant } from "../types";

export const storage = {
  getHighScore: (mode: GameMode, variant: GameVariant): number => {
    try {
      const key = `timing-game-highscore-${mode}-${variant}`;
      const value = localStorage.getItem(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.warn("High score okunamadı:", error);
      return 0;
    }
  },

  setHighScore: (mode: GameMode, variant: GameVariant, score: number) => {
    try {
      const key = `timing-game-highscore-${mode}-${variant}`;
      localStorage.setItem(key, score.toString());
    } catch (error) {
      console.warn("High score kaydedilemedi:", error);
    }
  },

  // Achievement sistemi için altyapı
  getAchievements: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("achievements") || "[]");
    } catch {
      return [];
    }
  },

  unlockAchievement: (id: string) => {
    try {
      const unlocked = JSON.parse(localStorage.getItem("achievements") || "[]");
      if (!unlocked.includes(id)) {
        unlocked.push(id);
        localStorage.setItem("achievements", JSON.stringify(unlocked));
        return true;
      }
    } catch {
      // Hata yutulur
    }
    return false;
  },
};
