import { useState, useEffect } from "react";
import TwoPlayerMode from "./modes/TwoPlayerMode";
import BotMode from "./modes/BotMode";

function App() {
  const [mode, setMode] = useState<null | "2p" | "bot">(null);

  useEffect(() => {
    const handler = () => setMode(null);
    window.addEventListener("back-to-menu", handler as EventListener);
    return () =>
      window.removeEventListener("back-to-menu", handler as EventListener);
  }, []);

  if (mode === "2p") return <TwoPlayerMode />;
  if (mode === "bot") return <BotMode />;

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
    </div>
  );
}

export default App;
