import { useState, useCallback, useEffect } from "react";

const INITIAL_TARGET_WIDTH = 150;
const MIN_TARGET_WIDTH = 30;
const SHRINK_RATE = 0.92;
const BOSS_CHANCE_BASE = 0.3; // %30 Şansla Boss Gelir
const FEVER_DURATION_MS = 5000;
const BOSS_WIDTH = 50;

export const useTimeAttackSystem = () => {
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [targetWidth, setTargetWidth] = useState(INITIAL_TARGET_WIDTH);
  const [bossActive, setBossActive] = useState(false);
  const [bossPosition, setBossPosition] = useState<number | null>(null);
  const [isFever, setIsFever] = useState(false);
  const [feverEndTime, setFeverEndTime] = useState<number | null>(null);

  const resetSystem = useCallback(() => {
    setCombo(0);
    setMultiplier(1);
    setTargetWidth(INITIAL_TARGET_WIDTH);
    setBossActive(false);
    setBossPosition(null);
    setIsFever(false);
    setFeverEndTime(null);
  }, []);

  // Fever Süre Sayacı
  useEffect(() => {
    if (isFever && feverEndTime) {
      const now = Date.now();
      const remaining = feverEndTime - now;
      if (remaining <= 0) {
        setIsFever(false);
        setFeverEndTime(null);
      } else {
        const timer = setTimeout(() => {
          setIsFever(false);
          setFeverEndTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [isFever, feverEndTime]);

  // Boss Spawn: Yeşilin hemen yanına koy
  const spawnBoss = useCallback(
    (nextTarget: number) => {
      const shouldSpawn = combo >= 5 && Math.random() < BOSS_CHANCE_BASE;

      if (shouldSpawn) {
        setBossActive(true);
        // Mesafe: (Yeşil Yarıçap) + (Kırmızı Yarıçap) + 10ms Güvenlik Payı
        const distance = targetWidth / 2 + BOSS_WIDTH / 2 + 10;

        let side = Math.random() < 0.5 ? 1 : -1;

        // Ekrandan taşmaması için yönü düzelt
        if (nextTarget - distance < 50) side = 1;
        if (nextTarget + distance > 950) side = -1;

        setBossPosition(nextTarget + side * distance);
      } else {
        setBossActive(false);
      }
    },
    [combo, targetWidth]
  );

  const processHit = useCallback(
    (currentMs: number, targetOffset: number) => {
      const diff = Math.abs(currentMs - targetOffset);
      const halfWidth = targetWidth / 2;

      let isBlocked = false;
      if (bossActive && bossPosition !== null) {
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

      // 1. KIRMIZIYA ÇARPMA (AĞIR CEZA)
      if (isBlocked) {
        result.message = "🟥 DİREK KIRMIZI! (-10sn)";
        result.timeBonus = -10; // 10 saniye silinir
        result.isGoal = false;

        setCombo(0);
        setMultiplier(1);
        setTargetWidth(INITIAL_TARGET_WIDTH);

        // Fever Koruması
        if (isFever) {
          result.message = "🛡️ FEVER KORUDU!";
          result.timeBonus = 0;
          setIsFever(false); // Fever biter ama süre gitmez
          setFeverEndTime(null);
        }

        setBossActive(false);
        return result;
      }

      // 2. ISKA (HAFİF CEZA)
      if (diff > halfWidth) {
        if (isFever) {
          result.message = "🛡️ FEVER KORUDU!";
          setIsFever(false);
          setFeverEndTime(null);
        } else {
          result.message = "❌ ISKA! (-2sn)";
          result.timeBonus = -2;
          setCombo(0);
          setMultiplier(1);
          setTargetWidth(INITIAL_TARGET_WIDTH);
        }
        setBossActive(false);
        return result;
      }

      // 3. GOL (BAŞARILI)
      result.isGoal = true;
      result.isGolden = diff <= 10;

      const newCombo = combo + 1;
      setCombo(newCombo);

      // Çarpan (Maksimum 5x)
      const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 5) * 0.5);
      setMultiplier(newMultiplier);

      // Puanlama: 1 veya 3 puan
      const baseScore = result.isGolden ? 3 : 1;
      result.scoreBonus = Math.floor(
        baseScore * (isFever ? newMultiplier * 2 : newMultiplier)
      );

      // Süre Kazanma
      if (result.isGolden) {
        result.timeBonus = 2;
        result.message = "🌟 MÜKEMMEL! (+2sn)";
      } else if (newCombo % 5 === 0) {
        result.timeBonus = 5;
        result.message = `🔥 KOMBO! (+5sn)`;
      } else {
        result.message = "GOL!";
      }

      // Hedefi Daralt
      setTargetWidth((prev) => Math.max(MIN_TARGET_WIDTH, prev * SHRINK_RATE));

      // Fever Başlat (Her 10 komboda)
      if (newCombo > 0 && newCombo % 10 === 0) {
        setIsFever(true);
        setFeverEndTime(Date.now() + FEVER_DURATION_MS);
        result.shouldTriggerFever = true;
        result.message = "❄️ ZAMAN DONDU!";
      }

      return result;
    },
    [combo, targetWidth, bossActive, bossPosition, isFever]
  );

  return {
    combo,
    multiplier,
    targetWidth,
    bossActive,
    bossPosition,
    isFever,
    processHit,
    resetSystem,
    spawnBoss,
  };
};
