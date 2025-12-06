import React from "react";
import { X, ArrowRight, Check, Zap, HelpCircle } from "lucide-react";
import { UI_CONSTANTS, TUTORIAL_STEPS } from "../../shared//constants/ui";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  if (!isVisible || step >= TUTORIAL_STEPS.length) return null;

  const currentData = TUTORIAL_STEPS[step];
  const isLastStep = step === TUTORIAL_STEPS.length - 1;
  const isIntro = currentData.target === "intro";

  let positionClass = "";
  let arrowClass = "hidden"; // Varsayılan gizli

  switch (currentData.position) {
    case "center":
      positionClass =
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md";
      break;

    case "layout-timer":
      // Timer  ekranın ortasında
      positionClass =
        "top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-96";
      arrowClass = "-bottom-2 left-1/2 -translate-x-1/2 rotate-45";
      break;

    case "layout-turn":
      // Tur bilgisi timer'ın altında
      positionClass =
        "top-[66%] left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 -rotate-135";
      break;

    case "layout-player":
      // Sol üstteki oyuncu
      positionClass = "top-55 left-5 w-72 origin-top-left";
      arrowClass = "-top-2 left-25 -rotate-135";
      break;

    case "layout-mode":
      // Üst orta kısım
      positionClass =
        "top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 -rotate-135";
      break;

    case "layout-action":
      // En alt buton
      positionClass =
        "bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:w-96";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 rotate-45";
      break;

    case "top-right":
      positionClass = "top-20 right-4 w-72 origin-top-right";
      arrowClass = "-top-2 right-6 -rotate-135";
      break;

    default:
      positionClass = "bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md";
  }

  return (
    <>
      {isIntro && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
          style={{ zIndex: UI_CONSTANTS.Z_INDEX.TUTORIAL - 1 }}
        />
      )}

      <div
        className={`fixed ${positionClass} animate-popup transition-all duration-300 shadow-2xl`}
        style={{ zIndex: UI_CONSTANTS.Z_INDEX.TUTORIAL }}
      >
        <div
          className={`
            ${
              isIntro
                ? "bg-neutral-900 border-yellow-500/30"
                : "bg-blue-600 border-white/20"
            }
            text-white p-6 rounded-2xl border relative overflow-visible
          `}
        >
          {/* Tooltip Oku */}
          {!isIntro && (
            <div
              className={`absolute w-4 h-4 bg-blue-600 border-l border-t border-white/20 ${arrowClass}`}
            ></div>
          )}

          <button
            onClick={onSkip}
            className="absolute top-2 right-2 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Eğitimi Kapat"
          >
            <X size={18} />
          </button>

          <div className="mb-3 flex items-center gap-3">
            {isIntro ? (
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                <Zap size={20} className="text-yellow-400 fill-current" />
              </div>
            ) : currentData.target === "help" ? (
              <HelpCircle size={24} className="text-white shrink-0" />
            ) : (
              <span className="text-[10px] font-black bg-black/20 px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
                {step}/{TUTORIAL_STEPS.length - 1}
              </span>
            )}

            {currentData.titleKey && (
              <h3
                className={`font-bold text-lg leading-tight ${
                  isIntro ? "text-yellow-400" : "text-white"
                }`}
              >
                {t(currentData.titleKey)}
              </h3>
            )}
          </div>

          <p
            className={`text-sm leading-relaxed mb-5 ${
              isIntro ? "text-gray-300" : "text-blue-50"
            }`}
          >
            {t(currentData.textKey)}
          </p>

          <div className="flex justify-end gap-3">
            {!isIntro && (
              <button
                onClick={onSkip}
                className="px-3 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
              >
                {t("tutorial.buttons.skip")}
              </button>
            )}

            <button
              onClick={onNext}
              className={`
                ${
                  isIntro
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black w-full justify-center"
                    : "bg-white text-blue-600"
                }
                px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg
              `}
            >
              {isIntro
                ? t("tutorial.buttons.ready")
                : isLastStep
                ? t("tutorial.buttons.start")
                : t("tutorial.buttons.next")}
              {isLastStep || isIntro ? (
                <Check size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;
