import React from "react";
import type { GameVariant } from "../../types";
import { GAME_VARIANTS } from "../../utils/constants";

interface SetupScreenProps {
  p1Name: string;
  p2Name: string;
  setP1Name: (name: string) => void;
  setP2Name: (name: string) => void;
  selectedVariant: GameVariant;
  setVariant: (v: GameVariant) => void;
  onStart: () => void;
  onBack: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  p1Name,
  p2Name,
  setP1Name,
  setP2Name,
  selectedVariant,
  setVariant,
  onStart,
  onBack,
}) => {
  return (
    <div className="flex flex-col items-center gap-6 z-10 bg-gray-900/90 p-6 md:p-10 rounded-2xl border border-gray-700 backdrop-blur-md w-full max-w-4xl mx-4 h-[80vh] overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Maç Ayarları
      </h2>

      {/* İsim Girişleri */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <div className="flex-1">
          <label className="text-gray-400 text-sm mb-1 block">Oyuncu 1</label>
          <input
            type="text"
            value={p1Name}
            onChange={(e) => setP1Name(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-gray-400 text-sm mb-1 block">Oyuncu 2</label>
          <input
            type="text"
            value={p2Name}
            onChange={(e) => setP2Name(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white w-full focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      {/* Varyasyon Seçimi */}
      <div className="w-full">
        <h3 className="text-gray-300 font-bold mb-4 text-center">
          Oyun Mekaniği Seç
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                selectedVariant === v.id
                  ? "border-green-500 bg-green-900/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  : "border-gray-700 bg-gray-800 hover:bg-gray-750"
              }`}
            >
              <div className="text-3xl mb-2">{v.icon}</div>
              <div className="font-bold text-white">{v.title}</div>
              <div className="text-xs text-gray-400 mt-1">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Aksiyonlar */}
      <div className="flex gap-4 mt-6 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition font-bold"
        >
          Geri
        </button>
        <button
          onClick={onStart}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-green-500/30 hover:scale-105 transition"
        >
          BAŞLA
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
