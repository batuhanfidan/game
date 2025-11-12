import { useState,useEffect } from "react";
import TwoPlayerMode from "./modes/TwoPlayerMode";
import BotMode from "./modes/BotMode";

function App() {
  const [mode, setMode] = useState<null | "2p" | "bot">(null);
  // const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const handler = () => setMode(null);
    window.addEventListener("back-to-menu", handler as EventListener);
    return () => window.removeEventListener("back-to-menu", handler as EventListener);
  }, []);

  useEffect(() => {
  const handler = () => setMode(null);
  window.addEventListener("back-to-menu", handler as EventListener);
  return () => window.removeEventListener("back-to-menu", handler as EventListener);
  }, []);

  if (mode === "2p") return <TwoPlayerMode  />;
  if (mode === "bot") return <BotMode/>;

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-black text-white font-mono">
      <h1 className="text-3xl font-bold mb-6">🎮 Oyun Modu Seç</h1>

      <button
        onClick={() => setMode("2p")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl mb-4"
      >
        👥 2 Kişilik Oyun
      </button>

      <button
        onClick={() => setMode("bot")}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl"
      >
        🤖 Bota Karşı Oyna
      </button>

      <button
        onClick={() => setShowRules(true)}
        className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl"
      >
        📜 Oyun Kuralları
      </button>

      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white text-black rounded-2xl p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">🎮 Oyun Kuralları</h2>
            <p className="mb-2">• 00 ms yakalarsan doğrudan gol olur ⚽</p>
            <p className="mb-2">• 01–10 ms arası penaltıdır (%75 gol şansı)</p>
            <p className="mb-2">• 11–30 ms şut, 31–50 ms orta, 51–70 ms frikik olur.</p>
            <p className="mb-4">• 70 ms üzeri ofsayttır ❌</p>
            <button
              onClick={() => setShowRules(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-2 hover:bg-blue-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
