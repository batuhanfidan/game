import { useState } from "react";
import { useNavigate } from "react-router-dom";

type MenuState = "main" | "single" | "multi";

const MainMenu = () => {
  const navigate = useNavigate();
  const [menuView, setMenuView] = useState<MenuState>("main");

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black text-white font-mono overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black pointer-events-none"></div>

      <div className="z-10 text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse tracking-tighter">
          TIMING GAME
        </h1>
        <p className="text-gray-500 text-xs md:text-sm mt-3 tracking-[0.5em] uppercase opacity-80">
          Reflekslerini Test Et
        </p>
      </div>

      {menuView === "main" && (
        <div className="flex flex-col gap-6 w-72 z-10 animate-fade-in">
          <button
            onClick={() => setMenuView("single")}
            className="group relative bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 border border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-lg md:text-xl">
              👤 <span className="tracking-wide">TEK OYUNCU</span>
            </span>
          </button>
          <button
            onClick={() => setMenuView("multi")}
            className="group relative bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 border border-gray-700 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-lg md:text-xl">
              👥 <span className="tracking-wide">ÇOK OYUNCU</span>
            </span>
          </button>
        </div>
      )}

      {menuView === "single" && (
        <div className="flex flex-col gap-4 w-80 z-10 animate-fade-in">
          <div className="text-center text-blue-400 font-bold mb-2 text-xs uppercase tracking-widest">
            Tek Kişilik Modlar
          </div>

          <button
            onClick={() => navigate("/game/bot")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all"
          >
            <span>🤖 Bota Karşı</span>{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>

          {/* ARTIK AKTİF */}
          <button
            onClick={() => navigate("/game/survival")}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all"
          >
            <span>💀 Hayatta Kalma</span>{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>

          {/* ARTIK AKTİF */}
          <button
            onClick={() => navigate("/game/time-attack")}
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all"
          >
            <span>⏱️ Zamana Karşı</span>{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>

          <button
            onClick={() => setMenuView("main")}
            className="mt-4 text-gray-400 hover:text-white text-sm underline transition-all"
          >
            ← Geri Dön
          </button>
        </div>
      )}

      {menuView === "multi" && (
        <div className="flex flex-col gap-4 w-80 z-10 animate-fade-in">
          <div className="text-center text-green-400 font-bold mb-2 text-xs uppercase tracking-widest">
            Çoklu Oyuncu Modları
          </div>

          <button
            onClick={() => navigate("/game/2p")}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all"
          >
            <span>⚽ Klasik Maç</span>{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>

          <button
            onClick={() => navigate("/game/penalty")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all"
          >
            <span>🥅 Penaltı Atışları</span>{" "}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </button>

          <button
            onClick={() => setMenuView("main")}
            className="mt-4 text-gray-400 hover:text-white text-sm underline transition-all"
          >
            ← Geri Dön
          </button>
        </div>
      )}

      <div className="absolute bottom-6 text-gray-600 text-xs font-mono">
        v2.5 • Ultimate Edition
      </div>
    </div>
  );
};

export default MainMenu;
