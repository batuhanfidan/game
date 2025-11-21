import { useState, useCallback } from "react";
import type { Player } from "../../types";

export const useScoreSystem = (initialScores = { p1: 0, p2: 0 }) => {
  const [scores, setScores] = useState(initialScores);
  const [streak, setStreak] = useState(0);

  const incrementScore = useCallback((player: Player) => {
    setScores((prev) => ({ ...prev, [player]: prev[player] + 1 }));
  }, []);

  const incrementStreak = useCallback(() => setStreak((s) => s + 1), []);
  const resetStreak = useCallback(() => setStreak(0), []);
  const resetScores = useCallback(() => setScores({ p1: 0, p2: 0 }), []);

  return {
    scores,
    streak,
    incrementScore,
    incrementStreak,
    resetStreak,
    resetScores,
  };
};
