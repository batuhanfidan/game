import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import TwoPlayerMode from "./modes/multi/TwoPlayerMode";
import BotMode from "./modes/single/BotMode";
import PenaltyMode from "./modes/multi/PenaltyMode";
import SurvivalMode from "./modes/single/SurvivalMode";
import TimeAttackMode from "./modes/single/TimeAttackMode";
import ErrorBoundary from "./components/ErrorBoundary";
import { soundsReady } from "./utils/sound";

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
        <Route path="/game/time-attack" element={<TimeAttackMode />} />{" "}
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
