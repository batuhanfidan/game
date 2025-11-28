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

  // Boss Spawn
  const spawnBoss = useCallback(
    (nextTarget: number) => {
      const shouldSpawn = combo >= 3 && Math.random() < BOSS_CHANCE_BASE;

      if (shouldSpawn) {
        setBossActive(true);

        const distance = targetWidth / 2 + BOSS_WIDTH / 2 + 2;

        let side = Math.random() < 0.5 ? 1 : -1;

        // Ekrandan taşmaması için yönü düzelt (0-1000 arası)
        if (nextTarget - distance < 50) side = 1; // Soldan taşıyorsa sağa koy
        if (nextTarget + distance > 950) side = -1; // Sağdan taşıyorsa sola koy

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

      // 1. FEVER KORUMASI VE KIRMIZIYA ÇARPMA
      if (isFever) {
        if (isBlocked) {
          result.message = "🛡️ FEVER KALKANI KIRILDI!";
          result.timeBonus = 0; // Ceza yok
          setIsFever(false); // Fever biter
          setFeverEndTime(null);
          setBossActive(false);

          return result;
        }
      }

      // 2. KIRMIZIYA ÇARPMA (AĞIR CEZA - Normal Mod)
      if (isBlocked && !isFever) {
        result.message = "🟥 DİREK KIRMIZI! (-10sn)";
        result.timeBonus = -10; // 10 saniye silinir
        result.isGoal = false;

        setCombo(0);
        setMultiplier(1);
        setTargetWidth(INITIAL_TARGET_WIDTH);
        setBossActive(false);
        return result;
      }

      // 3. ISKA (HAFİF CEZA)
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
        setBossActive(false);
        return result;
      }

      // 4. GOL (BAŞARILI)
      result.isGoal = true;
      result.isGolden = diff <= 10;

      const newCombo = combo + 1;
      setCombo(newCombo);

      // Çarpan (Maksimum 5x)
      const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 5) * 0.5);
      setMultiplier(newMultiplier);

      // Puanlama: Normal +1, Altın +3
      const baseScore = result.isGolden ? 3 : 1;

      result.scoreBonus = Math.floor(baseScore * newMultiplier);

      // Süre Kazanma
      if (result.isGolden) {
        result.timeBonus = 2; // Altın vuruş +2sn
        result.message = "🌟 MÜKEMMEL! (+2sn)";
      } else if (newCombo % 5 === 0) {
        result.timeBonus = 2; // Her 5 komboda +2sn
        result.message = `🔥 KOMBO! (+2sn)`;
      } else {
        result.message = "GOL!";
        result.timeBonus = 0; // Normal gol süre vermez, sadece puan
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
