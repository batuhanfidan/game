import React from "react";

interface GameOverModalProps {
  winner: string;
  finalScore: string;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  finalScore,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-center shadow-2xl transition-all">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.6)]"></div>

        <div className="px-8 py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-b from-neutral-800 to-neutral-900 border border-neutral-700 shadow-lg animate-popup">
            <span className="text-5xl drop-shadow-md">🏆</span>
          </div>

          <h2 className="mb-3 text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            {winner}
          </h2>

          <div className="mb-10 inline-block rounded-lg bg-neutral-800/50 px-4 py-2 border border-white/5">
            <p className="text-sm md:text-base font-mono font-bold text-yellow-500/90 tracking-wider">
              {finalScore}
            </p>
          </div>

          <button
            onClick={onRestart}
            className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-black font-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              TEKRAR OYNA <span className="text-lg">↺</span>
            </span>

            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-gray-300 to-transparent transition-transform duration-500 group-hover:translate-x-full opacity-50"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
