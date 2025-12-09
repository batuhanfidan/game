import type { GameMode, GameVariant } from "../types";
import { secureStorage } from "./secureStorage";

export const storage = {
  getHighScore: (mode: GameMode, variant: GameVariant): number => {
    try {
      const key = `timing-game-highscore-${mode}-${variant}`;
      const value = secureStorage.getItem(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.warn("High score okunamadı:", error);
      return 0;
    }
  },

  setHighScore: (mode: GameMode, variant: GameVariant, score: number) => {
    try {
      const key = `timing-game-highscore-${mode}-${variant}`;
      secureStorage.setItem(key, score.toString());
    } catch (error) {
      console.warn("High score kaydedilemedi:", error);
    }
  },

  // Achievement sistemi için altyapı
  getAchievements: (): string[] => {
    try {
      return JSON.parse(secureStorage.getItem("achievements") || "[]");
    } catch {
      return [];
    }
  },

  unlockAchievement: (id: string) => {
    try {
      const unlocked = JSON.parse(
        secureStorage.getItem("achievements") || "[]"
      );
      if (!unlocked.includes(id)) {
        unlocked.push(id);
        secureStorage.setItem("achievements", JSON.stringify(unlocked));
        return true;
      }
    } catch {
      // Hata yutulur
    }
    return false;
  },

  getTutorialStatus: (mode: string): boolean => {
    try {
      return secureStorage.getItem(`tutorial_seen_${mode}`) === "true";
    } catch {
      return false;
    }
  },

  setTutorialSeen: (mode: string) => {
    try {
      secureStorage.setItem(`tutorial_seen_${mode}`, "true");
    } catch (e) {
      console.warn("Storage error:", e);
    }
  },
};
