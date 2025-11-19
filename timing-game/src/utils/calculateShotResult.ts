export type ShotResult =
  | "GOL"
  | "PENALTI"
  | "ŞUT"
  | "ORTA"
  | "FRİKİK"
  | "OFSAYT"
  | "KAÇTI"
  | "KURTARDI"
  | "DİREK";

export interface ShotOutcome {
  result: ShotResult;
  message: string;
  isGoal: boolean;
}

export function calculateShotResult(ms: number): ShotOutcome {
  let result: ShotResult = "OFSAYT";
  let message = "";
  let isGoal = false;

  // KURAL 1: 00 ms (0-9 ms arası) KESİN GOL
  if (ms < 10) {
    result = "GOL";
    message = "MÜKEMMEL! Sıfırı tutturdun, gol!";
    isGoal = true;
  }
  // KURAL 2: 01-10 ms (10-109 ms arası) PENALTI
  else if (ms < 110) {
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
  }
  // 11-30 ms (110-309 ms) -> ŞUT
  else if (ms <= 310) {
    result = "ŞUT";
    const zone = Math.random() * 100;
    if (zone <= 30) {
      const chance = Math.random() * 100;
      if (chance <= 25) {
        message = "Ceza sahasından gol! ⚽";
        isGoal = true;
      } else {
        message = "Ceza sahasından şut auta gitti.";
      }
    } else {
      message = "Uzak mesafeden şut, kaleci kontrol etti.";
    }
  }
  // 31-50 ms (310-509 ms) -> ORTA
  else if (ms <= 510) {
    result = "ORTA";
    const zone = Math.floor(Math.random() * 6) + 1;
    const success = Math.random() * 100;
    if (success <= 40) {
      const finish = Math.random() * 100;
      if (finish <= 50) {
        message = `Bölge ${zone}'den başarılı orta! Vuruş ve GOOOL! ⚽`;
        isGoal = true;
      } else {
        message = `Bölge ${zone}'den başarılı orta ama vuruş auta!`;
      }
    } else {
      message = `Bölge ${zone}'den orta başarısız.`;
    }
  }
  // 51-70 ms (510-709 ms) -> FRİKİK
  else if (ms <= 710) {
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
