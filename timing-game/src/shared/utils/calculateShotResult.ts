import type { ShotOutcome, ShotResult } from "../types";
import { SHOT_ZONES } from "../constants/game";

export function calculateShotResult(ms: number): ShotOutcome {
  let result: ShotResult = "OFSAYT";
  let messageKey = "";
  let isGoal = false;

  if (ms < SHOT_ZONES.GOAL) {
    result = "GOL";
    messageKey = "game.result.perfect";
    isGoal = true;
  } else if (ms < SHOT_ZONES.PENALTY) {
    result = "PENALTI";
    const random = Math.random() * 100;
    if (random <= 75) {
      messageKey = "game.result.penalty_goal";
      isGoal = true;
    } else if (random <= 90) {
      messageKey = "game.result.penalty_miss";
      result = "KAÇTI";
    } else {
      messageKey = "game.result.penalty_save";
      result = "KURTARDI";
    }
  } else if (ms <= SHOT_ZONES.SHOT) {
    result = "ŞUT";
    const shotChance = Math.random() * 100;
    if (shotChance <= 30) {
      messageKey = "game.result.shot_goal";
      isGoal = true;
    } else {
      messageKey = "game.result.shot_save";
    }
  } else if (ms <= SHOT_ZONES.CROSS) {
    result = "ORTA";
    if (Math.random() * 100 <= 20) {
      messageKey = "game.result.cross_goal";
      isGoal = true;
    } else {
      messageKey = "game.result.cross_miss";
    }
  } else if (ms <= SHOT_ZONES.FREEKICK) {
    result = "FRİKİK";
    const chance = Math.random() * 100;
    if (chance <= 20) {
      messageKey = "game.result.freekick_goal";
      isGoal = true;
    } else if (chance <= 80) {
      messageKey = "game.result.freekick_post";
      result = "DİREK";
    } else {
      messageKey = "game.result.freekick_miss";
    }
  } else {
    result = "OFSAYT";
    messageKey = "game.result.offside";
  }

  return { result, message: messageKey, isGoal };
}
