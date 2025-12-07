import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MainMenu from "./features/menu/MainMenu";
import TwoPlayerMode from "./features/modes/multi/TwoPlayerMode";
import BotMode from "./features/modes/single/BotMode";
import PenaltyMode from "./features/modes/multi/PenaltyMode";
import SurvivalMode from "./features/modes/single/SurvivalMode";
import TimeAttackMode from "./features/modes/single/TimeAttackMode";
import TutorialMode from "./features/modes/single/TutorialMode";
import ErrorBoundary from "./components/ErrorBoundary";
import { soundsReady } from "./shared/utils/sound";
import { GameProvider } from "./context/GameContext";
import { useGameLogic } from "./hooks/useGameLogic";
import { useTheme } from "./hooks/core/useTheme";
import Leaderboard from "./features/menu/Leaderboard";
import UsernameModal from "./components/auth/UsernameModal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    soundsReady.then(() => {
      console.log("All sounds loaded successfully");
    });

    const savedUser = localStorage.getItem("timing_game_username");
    if (savedUser) {
      setIsAuthenticated(true);
    }
  }, []);

  const { theme, currentTheme } = useTheme();

  const gameLogic = useGameLogic({
    initialTime: 60,
    gameMode: "classic",
    gameVariant: "classic",
  });

  return (
    <ErrorBoundary>
      <GameProvider
        gameState={gameLogic.gameState}
        isPaused={gameLogic.isPaused}
        togglePause={gameLogic.togglePause}
        restartGame={gameLogic.restartGame}
        currentTheme={currentTheme}
        visualEffect={gameLogic.visualEffect}
        isTwoPlayerMode={false}
      >
        <div className={theme.class}>
          {!isAuthenticated ? (
            <UsernameModal onLoginSuccess={() => setIsAuthenticated(true)} />
          ) : (
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/game/2p" element={<TwoPlayerMode />} />
              <Route path="/game/bot" element={<BotMode />} />
              <Route path="/game/penalty" element={<PenaltyMode />} />
              <Route path="/game/survival" element={<SurvivalMode />} />
              <Route path="/game/time-attack" element={<TimeAttackMode />} />
              <Route path="/game/tutorial" element={<TutorialMode />} />
              <Route path="*" element={<MainMenu />} />
            </Routes>
          )}
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
