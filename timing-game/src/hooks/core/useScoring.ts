import { useState, useCallback, useEffect } from "react";
import { storage } from "../../shared/utils/storage";
import type { GameMode, GameVariant } from "../../shared/types";

export const useScoring = (gameMode: GameMode, gameVariant: GameVariant) => {
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [highScore, setHighScore] = useState(0);

  const loadHighScore = useCallback(() => {
    if (gameMode === "classic" && gameVariant === "classic") return;

    setHighScore(storage.getHighScore(gameMode, gameVariant));
  }, [gameMode, gameVariant]);

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  const updateHighScore = useCallback(
    (score: number) => {
      setHighScore((prev) => {
        if (score > prev) {
          storage.setHighScore(gameMode, gameVariant, score);
          return score;
        }
        return prev;
      });
    },
    [gameMode, gameVariant]
  );

  const resetScores = useCallback(() => {
    setScores({ p1: 0, p2: 0 });

    loadHighScore();
  }, [loadHighScore]);

  return { scores, setScores, highScore, updateHighScore, resetScores };
};
