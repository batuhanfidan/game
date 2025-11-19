import { useState } from "react";
import TwoPlayerMode from "./modes/TwoPlayerMode";
import BotMode from "./modes/BotMode";

function App() {
  const [mode, setMode] = useState<null | "2p" | "bot">(null);

  const handleBackToMenu = () => setMode(null);

  if (mode === "2p") return <TwoPlayerMode onBack={handleBackToMenu} />;
  if (mode === "bot") return <BotMode onBack={handleBackToMenu} />;

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black text-white font-mono">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 drop-shadow-lg">
        TIMING GAME
      </h1>

      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => setMode("2p")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:scale-105 active:scale-95"
        >
          👥 2 Kişilik Oyun
        </button>

        <button
          onClick={() => setMode("bot")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-900/20 transition transform hover:scale-105 active:scale-95"
        >
          🤖 Bota Karşı Oyna
        </button>
      </div>

      <div className="mt-8 text-gray-500 text-sm">v0.1 </div>
    </div>
  );
}

export default App;
