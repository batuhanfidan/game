import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  Bot,
  Skull,
  Timer,
  Trophy,
  ArrowRight,
  Lock,
  Gamepad2,
  ArrowLeft,
  Zap,
} from "lucide-react";

type MenuState = "main" | "single" | "multi";

const MainMenu = () => {
  const navigate = useNavigate();
  const [menuView, setMenuView] = useState<MenuState>("main");

  // Tutorial'a gider
  const handleQuickPlay = () => {
    navigate("/game/tutorial");
  };

  return (
    <div className="h-screen-safe w-screen flex flex-col justify-center items-center bg-linear-to-br from-gray-900 to-black text-white font-mono overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-800/20 via-black to-black pointer-events-none"></div>

      {/* HIZLI BAŞLA BUTONU */}
      <button
        onClick={handleQuickPlay}
        className="absolute top-6 right-6 z-50 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black py-3 px-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 animate-fade-in focus-visible:ring-4 focus-visible:ring-blue-500"
      >
        <Zap size={20} className="fill-black" /> EĞİTİCİ MOD
      </button>

      <div className="z-10 text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-green-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse tracking-tighter">
          TIMING GAME
        </h1>
        <p className="text-gray-300 text-xs md:text-sm mt-3 tracking-[0.5em] uppercase opacity-80">
          Reflekslerini Test Et
        </p>
      </div>

      {menuView === "main" && (
        <div className="flex flex-col gap-6 w-72 z-10 animate-fade-in">
          <button
            onClick={() => setMenuView("single")}
            className="group relative bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 border border-gray-700 overflow-hidden focus-visible:ring-4 focus-visible:ring-blue-500/50 outline-none"
          >
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-lg md:text-xl">
              <User size={28} />{" "}
              <span className="tracking-wide">TEK OYUNCU</span>
            </span>
          </button>
          <button
            onClick={() => setMenuView("multi")}
            className="group relative bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 px-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 border border-gray-700 overflow-hidden focus-visible:ring-4 focus-visible:ring-blue-500/50 outline-none"
          >
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-green-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3 text-lg md:text-xl">
              <Users size={28} />{" "}
              <span className="tracking-wide">ÇOK OYUNCU</span>
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
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all focus-visible:ring-4 focus-visible:ring-blue-300 outline-none"
          >
            <span className="flex items-center gap-2">
              <Bot size={20} /> Bota Karşı
            </span>
            <ArrowRight
              size={20}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            onClick={() => navigate("/game/survival")}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all focus-visible:ring-4 focus-visible:ring-red-300 outline-none"
          >
            <span className="flex items-center gap-2">
              <Skull size={20} /> Hayatta Kalma
            </span>
            <ArrowRight
              size={20}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            onClick={() => navigate("/game/time-attack")}
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all focus-visible:ring-4 focus-visible:ring-cyan-300 outline-none"
          >
            <span className="flex items-center gap-2">
              <Timer size={20} /> Zamana Karşı
            </span>
            <ArrowRight
              size={20}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            onClick={() => setMenuView("main")}
            className="mt-4 text-gray-300 hover:text-white text-sm underline transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <ArrowLeft size={16} /> Geri Dön
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
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-105 flex items-center justify-between group transition-all focus-visible:ring-4 focus-visible:ring-green-300 outline-none"
          >
            <span className="flex items-center gap-2">
              <Gamepad2 size={20} /> Klasik Maç
            </span>
            <ArrowRight
              size={20}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            disabled
            className="bg-gray-700 text-gray-500 font-bold py-4 px-6 rounded-xl shadow-none flex items-center justify-between cursor-not-allowed opacity-70"
          >
            <span className="flex items-center gap-2">
              <Trophy size={20} /> Penaltı Atışları
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-600 flex items-center gap-1">
              <Lock size={12} /> YAKINDA
            </span>
          </button>

          <button
            onClick={() => setMenuView("main")}
            className="mt-4 text-gray-300 hover:text-white text-sm underline transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
        </div>
      )}

      <div className="absolute bottom-6 text-gray-600 text-xs font-mono">
        v0.5
      </div>
    </div>
  );
};

export default MainMenu;
