import { useState, useCallback } from "react";

// Time Modu Sabitleri
const INITIAL_TARGET_WIDTH = 150;
const MIN_TARGET_WIDTH = 30;
const SHRINK_RATE = 0.95;
const GOLDEN_ZONE_WIDTH = 10;
const BOSS_INTERVAL = 5;
const FEVER_THRESHOLD = 5;
const TIME_REWARD_INTERVAL = 5; // Her 5 golde bir süre ver

export const useTimeAttackSystem = () => {
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [targetWidth, setTargetWidth] = useState(INITIAL_TARGET_WIDTH);
  const [totalScore, setTotalScore] = useState(0);

  const [bossActive, setBossActive] = useState(false);
  const [bossPosition, setBossPosition] = useState<number | null>(null);
  const [isFeverActive, setIsFeverActive] = useState(false);

  const resetSystem = useCallback(() => {
    setCombo(0);
    setMultiplier(1);
    setTargetWidth(INITIAL_TARGET_WIDTH);
    setTotalScore(0);
    setBossActive(false);
    setBossPosition(null);
    setIsFeverActive(false);
  }, []);

  // --- YENİ VURUŞ MANTIĞI ---
  const processHit = useCallback(
    (currentMs: number, targetOffset: number) => {
      const diff = Math.abs(currentMs - targetOffset);
      const halfWidth = targetWidth / 2;

      // 1. Boss Kontrolü
      let isBlocked = false;
      if (bossActive && bossPosition !== null) {
        const distToBoss = Math.abs(currentMs - bossPosition);
        if (distToBoss < 40) isBlocked = true;
      }

      let isGoal = false;
      let isGoldenHit = false;
      let timeBonus = 0;
      let scoreBonus = 0;
      let message = "";

      // 2. Sonuç Hesaplama
      if (isBlocked) {
        isGoal = false;
        timeBonus = isFeverActive ? 0 : -3;
        message = isFeverActive ? "🛡️ FEVER KORUMASI!" : "🛡️ ENGEL! (-3sn)";
      } else if (diff <= halfWidth) {
        isGoal = true;
        if (diff <= GOLDEN_ZONE_WIDTH) {
          isGoldenHit = true;
          message = "🌟 MÜKEMMEL!";
        } else {
          message = "GOL!";
        }
      } else {
        isGoal = false;
        const isCriticalMiss = diff > 200;

        if (isFeverActive) {
          timeBonus = 0;
          message = "🔥 FEVER KORUMASI!";
        } else if (isCriticalMiss) {
          timeBonus = -4;
          message = "💀 KRİTİK HATA! (-4sn)";
        } else {
          timeBonus = -2;
          message = "❌ ISKA! (-2sn)";
        }
      }

      // 3. State ve Ödül Güncellemeleri
      if (isGoal) {
        const newCombo = combo + 1;
        const newTotalScore = totalScore + 1;
        setCombo(newCombo);
        setTotalScore(newTotalScore);

        // Fever ve Çarpan
        const feverActive = newCombo >= FEVER_THRESHOLD;
        setIsFeverActive(feverActive);

        const currentMult = feverActive
          ? 2
          : 1 + Math.floor(newCombo / 5) * 0.5;
        setMultiplier(currentMult);

        // Puan (Base Score: 1, Golden: 5)
        const baseScore = isGoldenHit ? 5 : 1;
        scoreBonus = Math.ceil(baseScore * currentMult);

        // --- YENİ SÜRE KAZANMA MANTIĞI ---
        // Kural 1: Altın vuruş her zaman süre verir (+3sn)
        if (isGoldenHit) {
          timeBonus += 3;
          message += ` (+3sn)`;
        }
        // Kural 2: Normal goller SADECE her 5. komboda toplu süre verir (+5sn)
        else if (newCombo % TIME_REWARD_INTERVAL === 0) {
          const milestoneBonus = 5;
          timeBonus += milestoneBonus;
          message += ` (+${milestoneBonus}sn KOMBO!)`;
        }
        // Diğer durumlarda timeBonus 0 kalır (Süre eklenmez)

        // Hedefi Küçült
        setTargetWidth((prev) =>
          Math.max(MIN_TARGET_WIDTH, prev * SHRINK_RATE)
        );

        // Boss Mantığı
        if (newCombo > 0 && newCombo % BOSS_INTERVAL === 0) {
          setBossActive(true);
          const offset = Math.random() < 0.5 ? -60 : 60;
          setBossPosition(targetOffset + offset);
        } else {
          setBossActive(false);
          setBossPosition(null);
        }
      } else {
        // Hata Durumu
        setCombo(0);
        setMultiplier(1);
        setIsFeverActive(false);
        setTargetWidth((prev) => Math.min(INITIAL_TARGET_WIDTH, prev * 1.1));
        setBossActive(false);
        setBossPosition(null);
      }

      return {
        isGoal,
        isGoldenHit,
        timeBonus,
        scoreBonus,
        message,
        isBlocked,
        isFeverActive,
      };
    },
    [combo, targetWidth, bossActive, bossPosition, isFeverActive, totalScore]
  );

  return {
    combo,
    multiplier,
    targetWidth,
    bossActive,
    bossPosition,
    isFeverActive,
    processHit,
    resetSystem,
  };
};
