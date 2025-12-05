import type { ShotOutcome, ShotResult } from "../types";
import { SHOT_ZONES } from "../constants/game";

export function calculateShotResult(ms: number): ShotOutcome {
  let result: ShotResult = "OFSAYT";
  let message = "";
  let isGoal = false;

  if (ms < SHOT_ZONES.GOAL) {
    result = "GOL";
    message = "MÜKEMMEL! Sıfırı tutturdun, gol!";
    isGoal = true;
  } else if (ms < SHOT_ZONES.PENALTY) {
    result = "PENALTI";
    const random = Math.random() * 100;
    if (random <= 75) {
      message = "Penaltıdan gol! ⚽";
      isGoal = true;
    } else if (random <= 90) {
      message = "Penaltı auta gitti! 😬";
      result = "KAÇTI";
    } else {
      message = "Kaleci kurtardı! 🧤";
      result = "KURTARDI";
    }
  } else if (ms <= SHOT_ZONES.SHOT) {
    result = "ŞUT";
    const shotChance = Math.random() * 100;
    if (shotChance <= 30) {
      message = "Ceza sahasından gol! ⚽";
      isGoal = true;
    } else {
      message = "Uzak mesafeden şut, kaleci kontrol etti.";
    }
  } else if (ms <= SHOT_ZONES.CROSS) {
    result = "ORTA";
    if (Math.random() * 100 <= 20) {
      message = "Başarılı orta ve GOOOL! ⚽";
      isGoal = true;
    } else {
      message = "Orta başarısız.";
    }
  } else if (ms <= SHOT_ZONES.FREEKICK) {
    result = "FRİKİK";
    const chance = Math.random() * 100;
    if (chance <= 20) {
      message = "Frikikten harika gol! 🎯";
      isGoal = true;
    } else if (chance <= 80) {
      message = "Frikik direğe çarptı!";
      result = "DİREK";
    } else {
      message = "Frikik auta gitti.";
    }
  } else {
    result = "OFSAYT";
    message = "Ofsayt bayrağı kalktı. ❌";
  }

  return { result, message, isGoal };
}
