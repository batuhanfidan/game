import { useState, useCallback, useEffect } from "react";
import { playSound } from "../utils/sound";

export type CurseType = "REVERSE" | "UNSTABLE";

export const useSurvivalSystem = () => {
  const [lives, setLives] = useState(3);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [survivalThreshold, setSurvivalThreshold] = useState(250);
  const [adrenaline, setAdrenaline] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [streak, setStreak] = useState(0);

  // Mekanikler
  const [cursedRemaining, setCursedRemaining] = useState(0);
  const [activeCurse, setActiveCurse] = useState<CurseType | null>(null);
  const [redTarget, setRedTarget] = useState<number | null>(null);

  const GOLDEN_THRESHOLD = 15;

  const generateRedTarget = useCallback((greenTarget: number) => {
    if (Math.random() > 0.2) return null;

    let red = 0;
    if (Math.random() < 0.5) {
      red = Math.floor(Math.random() * 100);
    } else {
      red = 900 + Math.floor(Math.random() * 100);
    }

    if (Math.abs(red - greenTarget) < 150) return null;
    return red;
  }, []);

  const resetSurvivalState = useCallback(() => {
    setLives(3);
    setSpeedMultiplier(1.0);
    setSurvivalThreshold(250);
    setAdrenaline(0);
    setIsFeverActive(false);
    setHasShield(false);
    setCursedRemaining(0);
    setActiveCurse(null);
    setRedTarget(null);
    setStreak(0);
  }, []);

  // --- FEVER TIMER ---
  useEffect(() => {
    if (isFeverActive) {
      const timer = setTimeout(() => {
        setIsFeverActive(false);
        setAdrenaline(0);
        setHasShield(true);
        playSound("whistle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFeverActive]);

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
    GOLDEN_THRESHOLD,
    generateRedTarget,
    resetSurvivalState,
  };
};
