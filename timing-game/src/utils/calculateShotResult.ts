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

  if (ms < 10) {
    result = "GOL";
    message = "MÜKEMMEL! Sıfırı tutturdun, gol!";
    isGoal = true;
  } else if (ms < 110) {
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
  } else if (ms <= 300) {
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
  } else if (ms <= 500) {
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
  } else if (ms <= 700) {
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
