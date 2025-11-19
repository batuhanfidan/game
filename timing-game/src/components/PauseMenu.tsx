import React from "react";

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onQuit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-100 flex items-center justify-center animate-fade-in">
      <div className="bg-neutral-900/90 border border-neutral-800 p-8 rounded-2xl text-center shadow-2xl w-80 sm:w-96 transform transition-all scale-100 ring-1 ring-white/5">
        <div className="mb-8">
          <div className="text-5xl mb-4 opacity-80">⏸</div>
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase opacity-90">
            Oyun Duraklatıldı
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="bg-gray-100 hover:bg-white text-black py-3.5 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
          >
            ▶ Oyuna Dön
          </button>

          <button
            onClick={onRestart}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 py-3.5 rounded-xl font-medium text-lg transition-all hover:scale-[1.02] border border-gray-700 active:scale-95"
          >
            🔄 Yeniden Başlat
          </button>

          <button
            onClick={onQuit}
            className="mt-2 py-2 text-red-500/80 hover:text-red-400 text-sm font-semibold tracking-wide hover:underline transition-colors"
          >
            ← Ana Menüye Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
