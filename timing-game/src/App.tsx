import { Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import TwoPlayerMode from "./modes/TwoPlayerMode";
import BotMode from "./modes/BotMode";
import PenaltyMode from "./modes/PenaltyMode"; // YENİ İMPORT

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/game/2p" element={<TwoPlayerMode />} />
      <Route path="/game/bot" element={<BotMode />} />
      <Route path="/game/penalty" element={<PenaltyMode />} /> {/* YENİ ROTA */}
      <Route path="*" element={<MainMenu />} />
    </Routes>
  );
}

export default App;
