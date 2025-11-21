import type { ShotOutcome, ShotResult } from "../types";
import { SHOT_ZONES } from "./constants";

// targetOffset: Hedefin (0 noktasının) ne kadar kaydığı. Varsayılan 0.
export function calculateShotResult(
  ms: number,
  targetOffset: number = 0
): ShotOutcome {
  // Vuruş zamanını hedefe göre normalize et (Mutlak farkı al)
  // Örn: Hedef 400ms, Vuruş 405ms -> Fark 5ms (GOL)
  const diff = Math.abs(ms - targetOffset);

  let result: ShotResult = "OFSAYT";
  let message = "";
  let isGoal = false;

  if (diff < SHOT_ZONES.GOAL) {
    result = "GOL";
    message = "MÜKEMMEL! Hedefi tam on ikiden vurdun!";
    isGoal = true;
  } else if (diff < SHOT_ZONES.PENALTY) {
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
  } else if (diff <= SHOT_ZONES.SHOT) {
    result = "ŞUT";
    if (Math.random() * 100 <= 30 && Math.random() * 100 <= 25) {
      message = "Ceza sahasından gol! ⚽";
      isGoal = true;
    } else {
      message = "Uzak mesafeden şut, kaleci kontrol etti.";
    }
  } else if (diff <= SHOT_ZONES.CROSS) {
    result = "ORTA";
    if (Math.random() * 100 <= 20) {
      message = "Başarılı orta ve GOOOL! ⚽";
      isGoal = true;
    } else {
      message = "Orta başarısız.";
    }
  } else if (diff <= SHOT_ZONES.FREEKICK) {
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
    message = "Çok uzak! ❌";
  }

  return { result, message, isGoal };
}
