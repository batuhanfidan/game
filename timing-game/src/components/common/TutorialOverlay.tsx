import React from "react";
import { X, ArrowRight, Check, Zap, HelpCircle } from "lucide-react";
import { UI_CONSTANTS, TUTORIAL_STEPS } from "../../utils/constants";

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  step,
  onNext,
  onSkip,
  isVisible,
}) => {
  if (!isVisible || step >= TUTORIAL_STEPS.length) return null;

  const currentData = TUTORIAL_STEPS[step];
  const isLastStep = step === TUTORIAL_STEPS.length - 1;
  const isIntro = currentData.target === "intro";

  // Konumlandırma Mantığı (Target'a özel)
  let positionClass = "";
  let arrowClass = "";

  switch (currentData.position) {
    case "center":
      positionClass =
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md";
      break;

    // Timer Çubuğunun Altı
    case "layout-timer":
      positionClass = "top-[52%] left-1/2 -translate-x-1/2 w-80 md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2";
      break;

    // Tur Süresinin Altı
    case "layout-turn":
      positionClass = "top-[64%] left-1/2 -translate-x-1/2 w-80 md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2";
      break;

    // Sol Oyuncu Süresinin Altı
    case "layout-player":
      positionClass = "top-55 left-4 md:left-20 w-72 origin-top-left";
      arrowClass = "-top-2 left-8";
      break;

    // YENİ: Oyun Modu Bilgisi (Üst Skorun Altı)
    case "layout-mode":
      positionClass = "top-24 left-1/2 -translate-x-1/2 w-80 md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2";
      break;

    // Action Butonunun Altı (En alt)
    case "layout-action":
      positionClass = "bottom-1 left-1/2 -translate-x-1/2 w-80 md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 hidden";
      break;

    case "top-right":
      positionClass = "top-20 right-4 w-72 origin-top-right";
      arrowClass = "-top-2 right-6";
      break;

    default:
      positionClass = "bottom-32 left-1/2 -translate-x-1/2 w-80 md:w-96";
      arrowClass = "-bottom-2 left-1/2 -translate-x-1/2";
  }

  return (
    <>
      {/* Sadece Intro adımında arka planı karart */}
      {isIntro && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
          style={{ zIndex: UI_CONSTANTS.Z_INDEX.TUTORIAL - 1 }}
        />
      )}

      <div
        className={`fixed ${positionClass} animate-popup transition-all duration-300`}
        style={{ zIndex: UI_CONSTANTS.Z_INDEX.TUTORIAL }}
      >
        <div
          className={`
            ${
              isIntro
                ? "bg-neutral-900 border-yellow-500/30"
                : "bg-blue-600/95 border-white/20"
            }
            text-white p-6 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md border relative overflow-hidden
          `}
        >
          {/* Intro için Dekoratif Arka Plan */}
          {isIntro && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          )}

          <button
            onClick={onSkip}
            className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            aria-label="Eğitimi Kapat"
          >
            <X size={20} />
          </button>

          <div className="mb-4 relative z-10">
            {isIntro ? (
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} className="text-yellow-400 fill-current" />
              </div>
            ) : currentData.target === "help" ? (
              <div className="mb-2">
                <HelpCircle size={24} className="text-white" />
              </div>
            ) : (
              <span className="text-xs font-bold bg-black/30 px-2 py-1 rounded-full uppercase tracking-wider">
                ADIM {step}/{TUTORIAL_STEPS.length - 1}
              </span>
            )}

            {currentData.title && (
              <h3
                className={`font-black text-xl mb-2 ${
                  isIntro ? "text-yellow-400 text-2xl" : "text-white"
                }`}
              >
                {currentData.title}
              </h3>
            )}
          </div>

          <p
            className={`${
              isIntro
                ? "text-gray-300 text-base"
                : "text-white text-sm font-medium"
            } leading-relaxed mb-6 relative z-10`}
          >
            {currentData.text}
          </p>

          <div className="flex justify-between items-center relative z-10">
            {!isIntro && (
              <button
                onClick={onSkip}
                className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider"
              >
                Atla
              </button>
            )}

            <button
              onClick={onNext}
              className={`
                ${
                  isIntro
                    ? "w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 text-lg"
                    : "bg-white text-blue-600 px-5 py-2 ml-auto text-sm"
                }
                rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg
              `}
            >
              {isIntro
                ? "HAZIRIM! BAŞLAYALIM"
                : isLastStep
                ? "OYUNA BAŞLA"
                : "DEVAM"}
              {isLastStep || isIntro ? (
                <Check size={18} />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>

          {/* Tooltip Oku */}
          {!isIntro && (
            <div
              className={`absolute w-4 h-4 bg-blue-600 rotate-45 ${arrowClass}`}
            ></div>
          )}
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;
