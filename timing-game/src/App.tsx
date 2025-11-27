import { Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import TwoPlayerMode from "./modes/TwoPlayerMode";
import BotMode from "./modes/BotMode";
import PenaltyMode from "./modes/PenaltyMode";
import SurvivalMode from "./modes/SurvivalMode";
import TimeAttackMode from "./modes/TimeAttackMode";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/game/2p" element={<TwoPlayerMode />} />
      <Route path="/game/bot" element={<BotMode />} />
      <Route path="/game/penalty" element={<PenaltyMode />} />
      <Route path="/game/survival" element={<SurvivalMode />} />
      <Route path="/game/time-attack" element={<TimeAttackMode />} />{" "}
      <Route path="*" element={<MainMenu />} />
    </Routes>
  );
}

export default App;
