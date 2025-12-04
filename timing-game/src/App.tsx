import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainMenu from "./features/menu/MainMenu";
import TwoPlayerMode from "./modes/multi/TwoPlayerMode";
import BotMode from "./features/modes/single/BotMode";
import SurvivalMode from "./features/modes/single/SurvivalMode";
import TimeAttackMode from "./features/modes/single/TimeAttackMode";
import TutorialMode from "./features/modes/single/TutorialMode";
import ErrorBoundary from "./components/ErrorBoundary";
import { soundsReady } from "./shared/utils/sound";
import PenaltyMode from "./features/modes/multi/PenaltyMode";

function App() {
  useEffect(() => {
    soundsReady.then(() => {
      console.log("All sounds loaded successfully");
    });
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game/2p" element={<TwoPlayerMode />} />
        <Route path="/game/bot" element={<BotMode />} />
        <Route path="/game/penalty" element={<PenaltyMode />} />
        <Route path="/game/survival" element={<SurvivalMode />} />
        <Route path="/game/time-attack" element={<TimeAttackMode />} />
        <Route path="/game/tutorial" element={<TutorialMode />} />{" "}
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
