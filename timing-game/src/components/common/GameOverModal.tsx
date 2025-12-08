import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home, Share2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GameMode } from "../../shared/types";

interface GameOverModalProps {
  winner: string;
  finalScore: string;
  onRestart: () => void;
  gameMode?: GameMode;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  finalScore,
  onRestart,
  gameMode,
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { t } = useTranslation();

  const showShareButton = gameMode === "time_attack" || gameMode === "survival";

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleShare = async () => {
    const url = window.location.origin;

    const fullMessage = `🔥 Time iT!'deki skorum!\n\n${finalScore}\n\nSen de dene, reflekslerini test et! 👇\n${url}`;

    // 1. Önce her halükarda panoya kopyala
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 4000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
    }

    // 2. Mobilse paylaşım menüsünü de açmayı dene
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Time iT!",
          text: fullMessage,
        });
      } catch {
        // Paylaşım iptal edilirse sorun yok
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-center shadow-2xl transition-all duration-500 ease-out ${
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-10"
        }`}
      >
        {/* --- KOPYALANDI BİLDİRİMİ --- */}
        <div
          className={`absolute top-0 left-0 w-full bg-green-500 text-black font-bold text-xs py-2 transition-transform duration-300 flex items-center justify-center gap-2 z-50 ${
            copyFeedback ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <Check size={14} /> {t("components.game_over.copy")}
        </div>

        {/* Dekoratif Işık */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-transparent via-yellow-500 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse"></div>

        <div className="px-8 py-10">
          {/* Kupa İkonu */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-b from-neutral-800 to-neutral-900 border border-neutral-700 shadow-lg animate-bounce">
            <Trophy size={48} className="text-yellow-500 drop-shadow-md" />
          </div>

          <h2 className="mb-3 text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight animate-pulse">
            {winner}
          </h2>

          <div className="mb-8 inline-block rounded-lg bg-neutral-800/50 px-4 py-2 border border-white/5">
            <p className="text-sm md:text-base font-mono font-bold text-yellow-500/90 tracking-wider">
              {finalScore}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* PAYLAŞ BUTONU (Sadece belirli modlarda) */}
            {showShareButton && (
              <button
                onClick={handleShare}
                className="group relative w-full overflow-hidden rounded-xl bg-amber-600 hover:bg-amber-500 text-white py-3.5 font-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer mb-2 border border-amber-400/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {copyFeedback ? <Check size={18} /> : <Share2 size={18} />}
                  {copyFeedback
                    ? t("components.game_over.copied")
                    : t("components.game_over.share")}
                </span>
                {/* Shine Efekti */}
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
              </button>
            )}

            <button
              onClick={onRestart}
              className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-black font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("components.game_over.play_again")} <RotateCcw size={20} />
              </span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-gray-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm border border-transparent hover:border-white/10"
            >
              <Home size={18} /> {t("components.game_over.menu")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
