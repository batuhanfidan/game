import { useState, useCallback } from "react";
import { THEMES } from "../../shared/constants/ui";

export const useTheme = (initialTheme = 0) => {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  const nextTheme = useCallback(
    () => setCurrentTheme((prev) => (prev + 1) % THEMES.length),
    []
  );

  const theme = THEMES[currentTheme];

  return { currentTheme, theme, nextTheme };
};
