import { useState, useCallback, useEffect, useRef } from "react";
import {
  SURVIVAL_CONSTANTS,
  GAME_DELAYS,
  GAMEPLAY_CONSTANTS,
} from "../../shared/constants/game";
import type {
  CurseType,
  VisualEffectData,
  Player,
  SoundType,
  ActionMessage,
} from "../../shared/types";
import {
  Apple,
  ShieldAlert,
  Shield,
  Skull,
  Flame,
  Zap,
  Ghost,
  Activity,
  AlertTriangle,
  Heart,
} from "lucide-react";

interface SurvivalActionHandlers {
  playSound: (sound: SoundType) => void;
  setVisualEffect: (effect: VisualEffectData | null) => void;
  setActionMessage: (msg: ActionMessage) => void;
  finishGame: () => void;
  setTurnTimeLeft: (time: number) => void;
  setTargetOffset: (offset: number) => void;
  currentPlayer: Player;
}

const useSurvivalState = () => {
  const [lives, setLives] = useState(SURVIVAL_CONSTANTS.INITIAL_LIVES);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [survivalThreshold, setSurvivalThreshold] = useState(250);
  const [adrenaline, setAdrenaline] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [streak, setStreak] = useState(0);

  const [cursedRemaining, setCursedRemaining] = useState(0);
  const [activeCurse, setActiveCurse] = useState<CurseType | null>(null);
  const [redTarget, setRedTarget] = useState<number | null>(null);

  return {
    lives,
    setLives,
    speedMultiplier,
    setSpeedMultiplier,
    survivalThreshold,
    setSurvivalThreshold,
    adrenaline,
    setAdrenaline,
    isFeverActive,
    setIsFeverActive,
    hasShield,
    setHasShield,
    streak,
    setStreak,
    cursedRemaining,
    setCursedRemaining,
    activeCurse,
    setActiveCurse,
    redTarget,
    setRedTarget,
  };
};

const useSurvivalEffects = (isFeverActive: boolean, onFeverEnd: () => void) => {
  const savedCallback = useRef(onFeverEnd);

  useEffect(() => {
    savedCallback.current = onFeverEnd;
  }, [onFeverEnd]);

  useEffect(() => {
    if (isFeverActive) {
      const timer = setTimeout(() => {
        if (savedCallback.current) savedCallback.current();
      }, GAME_DELAYS.FEVER_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isFeverActive]);
};

export const useSurvivalSystem = (onFeverEndCallback?: () => void) => {
  const state = useSurvivalState();
  const {
    lives,
    setLives,
    speedMultiplier,
    setSpeedMultiplier,
    survivalThreshold,
    setSurvivalThreshold,

    setAdrenaline,
    isFeverActive,
    setIsFeverActive,
    hasShield,
    setHasShield,

    setStreak,
    cursedRemaining,
    setCursedRemaining,
    activeCurse,
    setActiveCurse,
    redTarget,
    setRedTarget,
  } = state;

  const GOLDEN_THRESHOLD = 15;

  const generateRedTarget = useCallback((greenTarget: number) => {
    if (Math.random() > SURVIVAL_CONSTANTS.RED_TARGET_SPAWN_CHANCE) return null;
    const red =
      Math.random() < 0.5
        ? Math.floor(Math.random() * 100)
        : 900 + Math.floor(Math.random() * 100);
    if (Math.abs(red - greenTarget) < 150) return null;
    return red;
  }, []);

  const resetSurvivalState = useCallback(() => {
    setLives(SURVIVAL_CONSTANTS.INITIAL_LIVES);
    setSpeedMultiplier(1.0);
    setSurvivalThreshold(250);
    setAdrenaline(0);
    setIsFeverActive(false);
    setHasShield(false);
    setCursedRemaining(0);
    setActiveCurse(null);
    setRedTarget(null);
    setStreak(0);
  }, [
    setLives,
    setSpeedMultiplier,
    setSurvivalThreshold,
    setAdrenaline,
    setIsFeverActive,
    setHasShield,
    setCursedRemaining,
    setActiveCurse,
    setRedTarget,
    setStreak,
  ]);

  const handleSurvivalShot = useCallback(
    (
      currentMs: number,
      targetOffset: number,
      handlers: SurvivalActionHandlers
    ) => {
      const {
        playSound,
        setVisualEffect,
        setActionMessage,
        finishGame,
        setTurnTimeLeft,
        setTargetOffset,
        currentPlayer,
      } = handlers;

      const isReverseCurse = activeCurse === "REVERSE";
      let effectiveTarget = targetOffset;

      if (activeCurse === "MOVING_TARGET") {
        const now = Date.now();
        effectiveTarget = 500 + 350 * Math.sin(now / 500);
      } else if (isReverseCurse) {
        effectiveTarget = 1000 - targetOffset;
      }

      const distance = Math.abs(currentMs - effectiveTarget);
      const redDistance =
        redTarget !== null
          ? isReverseCurse
            ? Math.abs(currentMs - (1000 - redTarget))
            : Math.abs(currentMs - redTarget)
          : Infinity;

      const isRedHit = redDistance <= survivalThreshold / 2;
      const isGreenHit = distance <= survivalThreshold;
      const isCritical = distance <= GOLDEN_THRESHOLD;

      let successMessage: ActionMessage | null = null;

      if (isRedHit) {
        playSound("goal");
        setVisualEffect({ type: "goal", player: currentPlayer });
        successMessage = {
          text: "ELMA VURULDU! (+10 SERİ)",
          icon: Apple,
          className: "text-green-400",
        };
        setStreak((prev) => prev + 9);
      } else if (!isGreenHit) {
        if (isFeverActive) {
          playSound("miss");
          setActionMessage({
            text: "FEVER KORUMASI!",
            icon: Flame,
            className: "text-yellow-400",
          });
          return;
        }
        if (hasShield) {
          setHasShield(false);
          setVisualEffect({ type: "save", player: currentPlayer });
          setActionMessage({
            text: "KALKAN KIRILDI! (Hayattasın)",
            icon: ShieldAlert,
            className: "text-blue-400",
          });
          return;
        }

        setAdrenaline((prev) => Math.floor(prev / 2));

        if (lives > 1) {
          setLives((l) => l - 1);
          playSound("miss");
          setVisualEffect({ type: "post", player: currentPlayer });
          setActionMessage({
            text: `DİKKAT! (${lives - 1} Can Kaldı)`,
            icon: AlertTriangle,
            className: "text-red-500 font-bold",
          });
        } else {
          playSound("miss");
          setVisualEffect({ type: "miss", player: currentPlayer });
          setActionMessage({
            text: "ÖLDÜN!",
            icon: Skull,
            className: "text-red-600 font-black",
          });
          finishGame();
        }
        return;
      } else {
        if (isCritical && !isFeverActive) {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
          setAdrenaline((prev) => {
            const newValue = Math.min(prev + 35, 100);
            if (newValue >= 100) {
              setIsFeverActive(true);
              playSound("whistle");
            }
            return newValue;
          });
        } else {
          playSound("goal");
          setVisualEffect({ type: "goal", player: currentPlayer });
        }
      }

      setStreak((prevStreak) => {
        const bonus = isFeverActive && isCritical ? 3 : 1;
        const newStreak = prevStreak + bonus;

        if (newStreak % SURVIVAL_CONSTANTS.SPEED_INCREASE_INTERVAL === 0) {
          setSpeedMultiplier((s) => Math.min(s + 0.05, 2.5));
          setSurvivalThreshold((t) => Math.max(30, t * 0.95));
        }

        if (
          newStreak > 0 &&
          newStreak % SURVIVAL_CONSTANTS.CURSE_INTERVAL === 0
        ) {
          setCursedRemaining(3);
          const rand = Math.random();
          let nextCurse: CurseType = "REVERSE";
          if (rand < 0.33) nextCurse = "REVERSE";
          else if (rand < 0.66) nextCurse = "UNSTABLE";
          else nextCurse = "MOVING_TARGET";

          setActiveCurse(nextCurse);
          const curseNames = {
            REVERSE: "TERS AKINTI",
            UNSTABLE: "DENGESİZ HIZ",
            MOVING_TARGET: "GEZİCİ HEDEF",
          };

          const curseIcon =
            nextCurse === "REVERSE"
              ? Ghost
              : nextCurse === "UNSTABLE"
              ? Activity
              : Zap;
          setActionMessage({
            text: `LANET BAŞLIYOR: ${curseNames[nextCurse]}!`,
            icon: curseIcon,
            className: "text-purple-400 font-bold",
          });
        } else if (cursedRemaining > 0) {
          const nextRemaining = Math.max(0, cursedRemaining - 1);
          setCursedRemaining(nextRemaining);
          if (nextRemaining === 0) {
            setActiveCurse(null);
            setActionMessage({
              text: "Lanet Kalktı!",
              icon: Shield,
              className: "text-green-300",
            });
          }
        }

        if (activeCurse !== "MOVING_TARGET") {
          const nextGreenTarget =
            newStreak > 5 ? Math.floor(Math.random() * 800) + 100 : 0;
          setTargetOffset(nextGreenTarget);
          const newRed = generateRedTarget(nextGreenTarget);
          setRedTarget(newRed);
        }

        if (successMessage) {
          setActionMessage(successMessage);
        } else if (newStreak % SURVIVAL_CONSTANTS.LIFE_BONUS_INTERVAL === 0) {
          setLives((l) => Math.min(l + 1, SURVIVAL_CONSTANTS.MAX_LIVES));
          setActionMessage({
            text: `+1 CAN! | Hız: ${speedMultiplier.toFixed(1)}x`,
            icon: Heart,
            className: "text-pink-500",
          });
        } else if (isFeverActive) {
          setActionMessage({
            text: "FEVER MODU!",
            icon: Flame,
            className: "text-yellow-400",
          });
        } else if (isCritical) {
          setActionMessage({
            text: "KRİTİK! (+%35 Adrenalin)",
            icon: Zap,
            className: "text-yellow-300",
          });
        } else {
          setActionMessage({
            text: `GÜZEL! (Seri: ${newStreak})`,
            className: "text-white",
          });
        }
        return newStreak;
      });

      setTurnTimeLeft(GAMEPLAY_CONSTANTS.TURN_TIME_LIMIT);
    },
    [
      activeCurse,
      redTarget,
      survivalThreshold,
      setStreak,
      isFeverActive,
      hasShield,
      setAdrenaline,
      lives,
      setHasShield,
      setLives,
      setIsFeverActive,
      cursedRemaining,
      setSpeedMultiplier,
      setSurvivalThreshold,
      setCursedRemaining,
      setActiveCurse,
      generateRedTarget,
      setRedTarget,
      speedMultiplier,
    ]
  );

  useSurvivalEffects(
    isFeverActive,
    useCallback(() => {
      setIsFeverActive(false);
      setAdrenaline(0);
      setHasShield(true);
      if (onFeverEndCallback) onFeverEndCallback();
    }, [onFeverEndCallback, setAdrenaline, setHasShield, setIsFeverActive])
  );

  return {
    ...state,
    generateRedTarget,
    resetSurvivalState,
    handleSurvivalShot,
    GOLDEN_THRESHOLD,
  };
};
