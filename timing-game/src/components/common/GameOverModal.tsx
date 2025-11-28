import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home } from "lucide-react";

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
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-center shadow-2xl transition-all duration-500 ease-out ${
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-10"
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse"></div>

        <div className="px-8 py-12">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-b from-neutral-800 to-neutral-900 border border-neutral-700 shadow-lg animate-bounce">
            <Trophy size={48} className="text-yellow-500 drop-shadow-md" />
          </div>

          <h2 className="mb-3 text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight animate-pulse">
            {winner}
          </h2>

          <div className="mb-10 inline-block rounded-lg bg-neutral-800/50 px-4 py-2 border border-white/5">
            <p className="text-sm md:text-base font-mono font-bold text-yellow-500/90 tracking-wider">
              {finalScore}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-black font-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                TEKRAR OYNA <RotateCcw size={20} />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-gray-300 to-transparent transition-transform duration-500 group-hover:translate-x-full opacity-50"></div>
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-gray-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm border border-transparent hover:border-white/10 active:scale-95 cursor-pointer"
            >
              <Home size={18} /> Ana Menüye Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
