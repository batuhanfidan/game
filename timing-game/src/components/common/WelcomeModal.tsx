import { useState } from "react";
import { Zap, BookOpen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const WelcomeModal = () => {
  // DEV MODU: Her zaman true olarak başla
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleStart = () => {
    setIsOpen(false);
  };

  const handleTutorial = () => {
    setIsOpen(false);
    navigate("/game/tutorial");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-yellow-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Zap size={32} className="text-yellow-400 fill-current" />
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            TIME iT'e Hoşgeldin!
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed">
            Bu bir refleks ve ritim oyunudur. Amacın süreyi tam
            <span className="text-green-400 font-bold mx-1">00ms</span>
            veya
            <span className="text-green-400 font-bold mx-1">Yeşil Bölge</span>
            içinde yakalamaktır.
          </p>

          <div className="grid grid-cols-1 gap-3 mt-8">
            <button
              onClick={handleTutorial}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:scale-[1.02]"
            >
              <BookOpen size={20} />
              Önce Eğitimi Tamamla
              <span className="text-blue-200 text-xs font-normal">
                (Önerilen)
              </span>
            </button>

            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-medium transition-colors"
            >
              <Play size={18} />
              Biliyorum, Hemen Başla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
