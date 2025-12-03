import { useState, useCallback, useEffect } from "react";

const INITIAL_TARGET_WIDTH = 150;
const MIN_TARGET_WIDTH = 30;
const SHRINK_RATE = 0.92;
const BOSS_CHANCE_BASE = 0.4;
const FEVER_DURATION_MS = 5000;
const BOSS_WIDTH = 50;

export const useTimeAttackSystem = () => {
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [targetWidth, setTargetWidth] = useState(INITIAL_TARGET_WIDTH);

  const [isBossActive, setIsBossActive] = useState(false);
  const [bossPosition, setBossPosition] = useState<number | null>(null);
  const [isFever, setIsFever] = useState(false);
  const [feverEndTime, setFeverEndTime] = useState<number | null>(null);

  const resetSystem = useCallback(() => {
    setCombo(0);
    setMultiplier(1);
    setTargetWidth(INITIAL_TARGET_WIDTH);
    setIsBossActive(false);
    setBossPosition(null);
    setIsFever(false);
    setFeverEndTime(null);
  }, []);

  useEffect(() => {
    if (!isFever || !feverEndTime) return;

    const now = Date.now();
    const remaining = feverEndTime - now;

    if (remaining <= 0) {
      setIsFever(false);
      setFeverEndTime(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsFever(false);
      setFeverEndTime(null);
    }, remaining);

    return () => clearTimeout(timer);
  }, [isFever, feverEndTime]);

  const spawnBoss = useCallback(
    (nextTarget: number) => {
      const shouldSpawn = combo >= 3 && Math.random() < BOSS_CHANCE_BASE;

      if (shouldSpawn) {
        setIsBossActive(true);
        const distance = targetWidth / 2 + BOSS_WIDTH / 2 + 2;
        let side = Math.random() < 0.5 ? 1 : -1;

        if (nextTarget - distance < 50) side = 1;
        if (nextTarget + distance > 950) side = -1;

        setBossPosition(nextTarget + side * distance);
      } else {
        setIsBossActive(false);
      }
    },
    [combo, targetWidth]
  );

  // RENAMED: More descriptive name
  const checkHitAccuracy = useCallback(
    (currentMs: number, targetOffset: number) => {
      const diff = Math.abs(currentMs - targetOffset);
      const halfWidth = targetWidth / 2;
      let isBlocked = false;

      if (isBossActive && bossPosition !== null) {
        const distToBoss = Math.abs(currentMs - bossPosition);
        if (distToBoss < BOSS_WIDTH / 2) isBlocked = true;
      }

      const result = {
        isGoal: false,
        isGolden: false,
        timeBonus: 0,
        scoreBonus: 0,
        message: "",
        shouldTriggerFever: false,
      };

      if (isFever) {
        if (isBlocked) {
          result.message = "🛡️ FEVER KALKANI KIRILDI!";
          setIsFever(false);
          setFeverEndTime(null);
          setIsBossActive(false);
          return result;
        }
      }
      if (isBlocked && !isFever) {
        result.message = "🟥 DİREK KIRMIZI! (-10sn)";
        result.timeBonus = -10;
        setCombo(0);
        setMultiplier(1);
        setTargetWidth(INITIAL_TARGET_WIDTH);
        setIsBossActive(false);
        return result;
      }
      if (diff > halfWidth) {
        if (isFever) {
          result.message = "❄️ ISKA (Fever Aktif)";
        } else {
          result.message = "❌ ISKA! (-2sn)";
          result.timeBonus = -2;
          setCombo(0);
          setMultiplier(1);
          setTargetWidth(INITIAL_TARGET_WIDTH);
        }
        setIsBossActive(false);
        return result;
      }

      result.isGoal = true;
      result.isGolden = diff <= 10;
      const newCombo = combo + 1;
      setCombo(newCombo);
      const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 5) * 0.5);
      setMultiplier(newMultiplier);
      const baseScore = result.isGolden ? 3 : 1;
      result.scoreBonus = Math.floor(baseScore * newMultiplier);

      if (result.isGolden) {
        result.timeBonus = 2;
        result.message = "🌟 MÜKEMMEL! (+2sn)";
      } else if (newCombo % 5 === 0) {
        result.timeBonus = 2;
        result.message = `🔥 KOMBO! (+2sn)`;
      } else {
        result.message = "GOL!";
      }

      setTargetWidth((prev) => Math.max(MIN_TARGET_WIDTH, prev * SHRINK_RATE));

      if (newCombo > 0 && newCombo % 10 === 0) {
        setIsFever(true);
        setFeverEndTime(Date.now() + FEVER_DURATION_MS);
        result.shouldTriggerFever = true;
        result.message = "❄️ ZAMAN DONDU!";
      }
      return result;
    },
    [combo, targetWidth, isBossActive, bossPosition, isFever]
  );

  return {
    combo,
    multiplier,
    targetWidth,
    isBossActive,
    bossPosition,
    isFever,
    checkHitAccuracy,
    resetSystem,
    spawnBoss,
  };
};
