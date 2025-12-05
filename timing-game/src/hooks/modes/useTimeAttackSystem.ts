import { useState, useCallback, useEffect } from "react";
import type {
  VisualEffectData,
  Player,
  TimeChangePopup,
  SoundType,
  ActionMessage,
} from "../../shared/types";
import { Flame, ShieldAlert, Snowflake, Star, X, Shield } from "lucide-react";

const INITIAL_TARGET_WIDTH = 150;
const MIN_TARGET_WIDTH = 30;
const SHRINK_RATE = 0.92;
const BOSS_CHANCE_BASE = 0.4;
const FEVER_DURATION_MS = 5000;
const BOSS_WIDTH = 50;

interface TimeAttackHandlers {
  setActionMessage: (msg: ActionMessage) => void;
  setScores: (
    callback: (prev: { p1: number; p2: number }) => { p1: number; p2: number }
  ) => void;
  setPlayerTimes: (
    callback: (prev: { p1: number; p2: number }) => { p1: number; p2: number }
  ) => void;
  setTimeChangePopup: (popup: TimeChangePopup) => void;
  setVisualEffect: (effect: VisualEffectData | null) => void;
  playSound: (sound: SoundType) => void;

  handleTurnSwitch: () => void;
  currentPlayer: Player;
}

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
        message: { text: "", icon: undefined } as unknown as ActionMessage,
        shouldTriggerFever: false,
      };

      if (isFever) {
        if (isBlocked) {
          result.message = {
            text: "FEVER KALKANI KIRILDI!",
            icon: Shield,
            className: "text-blue-400",
          };
          setIsFever(false);
          setFeverEndTime(null);
          setIsBossActive(false);
          return result;
        }
      }
      if (isBlocked && !isFever) {
        result.message = {
          text: "DİREK KIRMIZI! (-10sn)",
          icon: ShieldAlert,
          className: "text-red-500 font-bold",
        };
        result.timeBonus = -10;
        setCombo(0);
        setMultiplier(1);
        setTargetWidth(INITIAL_TARGET_WIDTH);
        setIsBossActive(false);
        return result;
      }
      if (diff > halfWidth) {
        if (isFever) {
          result.message = {
            text: "ISKA (Fever Aktif)",
            icon: Snowflake,
            className: "text-cyan-300",
          };
        } else {
          result.message = {
            text: "ISKA! (-2sn)",
            icon: X,
            className: "text-gray-400",
          };
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
        result.message = {
          text: "MÜKEMMEL! (+2sn)",
          icon: Star,
          className: "text-yellow-300",
        };
      } else if (newCombo % 5 === 0) {
        result.timeBonus = 2;
        result.message = {
          text: `KOMBO! (+2sn)`,
          icon: Flame,
          className: "text-orange-400",
        };
      } else {
        result.message = { text: "GOL!", className: "text-green-400" };
      }

      setTargetWidth((prev) => Math.max(MIN_TARGET_WIDTH, prev * SHRINK_RATE));

      if (newCombo > 0 && newCombo % 10 === 0) {
        setIsFever(true);
        setFeverEndTime(Date.now() + FEVER_DURATION_MS);
        result.shouldTriggerFever = true;
        result.message = {
          text: "ZAMAN DONDU!",
          icon: Snowflake,
          className: "text-cyan-300 font-bold",
        };
      }
      return result;
    },
    [combo, targetWidth, isBossActive, bossPosition, isFever]
  );

  const handleTimeAttackShot = useCallback(
    (currentMs: number, targetOffset: number, handlers: TimeAttackHandlers) => {
      const result = checkHitAccuracy(currentMs, targetOffset);

      handlers.setActionMessage(result.message);
      handlers.setScores((s) => ({ ...s, p1: s.p1 + result.scoreBonus }));

      if (result.timeBonus !== 0) {
        handlers.setPlayerTimes((prev) => ({
          ...prev,
          p1: Math.max(0, prev.p1 + result.timeBonus),
        }));
        handlers.setTimeChangePopup({
          id: Date.now(),
          value: result.timeBonus,
          type: result.timeBonus > 0 ? "positive" : "negative",
        });
      }

      if (result.isGoal) {
        handlers.playSound("goal");
        handlers.setVisualEffect({
          type: "goal",
          player: handlers.currentPlayer,
        });
      } else {
        handlers.playSound("miss");
        const effectType = result.message?.text?.includes("KIRMIZI")
          ? "save"
          : "miss";
        handlers.setVisualEffect({
          type: effectType,
          player: handlers.currentPlayer,
        });
      }

      if (result.shouldTriggerFever) handlers.playSound("whistle");
      handlers.handleTurnSwitch();
    },
    [checkHitAccuracy]
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
    handleTimeAttackShot,
  };
};
