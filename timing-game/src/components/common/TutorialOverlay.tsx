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
  let arrowClass = "hidden";

  switch (currentData.position) {
    case "center":
      positionClass =
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md";
      break;

    case "layout-timer":
      positionClass =
        "top-3 sm:top-28 md:top-32 lg:top-[5%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] md:w-96 max-w-sm";
      arrowClass = "-bottom-2  left-1/2 -translate-x-1/2 rotate-45";
      break;

    case "layout-turn":
      positionClass =
        "top-[85%] sm:top-[55%] md:top-[60%] lg:top-[66%] left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 w-[90%] sm:w-[85%] md:w-96 max-w-sm";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 -rotate-135";
      break;

    case "layout-player":
      positionClass =
        "top-56 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2 md:left-5 md:translate-x-0 w-[90%] sm:w-80 md:w-72 max-w-sm origin-top";
      arrowClass =
        "-top-2 left-7 md:left-24 -translate-x-1/2 md:translate-x-0 -rotate-135";
      break;

    case "layout-mode":
      positionClass =
        "top-20 sm:top-24 md:top-28 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] md:w-96 max-w-sm";
      arrowClass = "-top-2 left-1/2 -translate-x-1/2 -rotate-135";
      break;

    case "layout-action":
      positionClass =
        "bottom-40 sm:bottom-16 md:bottom-10 lg:bottom-5 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] md:w-96 max-w-sm";
      arrowClass =
        "left-1/2 -translate-x-1/2 rotate-45 " +
        "top-full mt-[-8px] " +
        "sm:top-auto sm:mt-0 sm:bottom-full sm:mb-[-8px]";
      break;

    case "top-right":
      positionClass =
        "top-20 left-1/2 -translate-x-1/2 sm:left-1/2 sm:-translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 w-[90%] sm:w-80 md:w-72 max-w-sm origin-top";
      arrowClass =
        "-top-2 right-2 md:left-auto md:right-6 -translate-x-1/2 md:translate-x-0 -rotate-135";
      break;

    default:
      positionClass =
        "bottom-16 sm:bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] max-w-md";
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
            text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border relative overflow-visible
          `}
        >
          {/* Tooltip Oku */}
          {!isIntro && (
            <div
              className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 border-l border-t border-white/20 ${arrowClass}`}
            ></div>
          )}

          <button
            onClick={onSkip}
            className="absolute top-2 right-2 p-1.5 sm:p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Eğitimi Kapat"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
            {isIntro ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                <Zap
                  size={18}
                  className="sm:w-5 sm:h-5 text-yellow-400 fill-current"
                />
              </div>
            ) : currentData.target === "help" ? (
              <HelpCircle
                size={20}
                className="sm:w-6 sm:h-6 text-white shrink-0"
              />
            ) : (
              <span className="text-[9px] sm:text-[10px] font-black bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider shrink-0">
                {step}/{TUTORIAL_STEPS.length - 1}
              </span>
            )}

            {currentData.titleKey && (
              <h3
                className={`font-bold text-base sm:text-lg leading-tight ${
                  isIntro ? "text-yellow-400" : "text-white"
                }`}
              >
                {t(currentData.titleKey)}
              </h3>
            )}
          </div>

          <p
            className={`text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 ${
              isIntro ? "text-gray-300" : "text-blue-50"
            }`}
          >
            {t(currentData.textKey)}
          </p>

          <div className="flex justify-end gap-2 sm:gap-3">
            {!isIntro && (
              <button
                onClick={onSkip}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white/70 hover:text-white transition-colors"
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
                px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg
              `}
            >
              {isIntro
                ? t("tutorial.buttons.ready")
                : isLastStep
                ? t("tutorial.buttons.start")
                : t("tutorial.buttons.next")}
              {isLastStep || isIntro ? (
                <Check size={14} className="sm:w-4 sm:h-4" />
              ) : (
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialOverlay;
