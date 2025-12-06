import React, { useMemo, memo } from "react";
import { formatTime } from "../../shared/utils/formatTime";
import type { GameVariant } from "../../shared/types";
import { Apple, ShieldAlert, Hand } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TimerDisplayProps {
  totalMs: number;
  targetOffset?: number;
  variant?: GameVariant;
  showProgressBar?: boolean;
  threshold?: number;
  goldenThreshold?: number;
  isCursed?: boolean;
  redTarget?: number | null;
  disableTransition?: boolean;
  showHint?: boolean;
  isPenaltyMode?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  totalMs,
  targetOffset = 0,
  variant = "classic",
  showProgressBar = true,
  threshold = 100,
  goldenThreshold = 0,
  isCursed = false,
  redTarget = null,
  disableTransition = false,
  showHint = false,
  isPenaltyMode = false,
}) => {
  const ms = totalMs % 1000;
  const percentage = (ms / 1000) * 100;
  const { t } = useTranslation();

  const targetPos = useMemo(() => {
    if (isPenaltyMode) {
      return (targetOffset / 1000) * 100;
    }
    const visualTargetOffset = isCursed ? 1000 - targetOffset : targetOffset;
    return (visualTargetOffset / 1000) * 100;
  }, [targetOffset, isCursed, isPenaltyMode]);

  const redPos = useMemo(() => {
    if (redTarget === null) return 0;
    const visualRed = isCursed ? 1000 - redTarget : redTarget;
    return (visualRed / 1000) * 100;
  }, [redTarget, isCursed]);

  const isGhostHidden = variant === "ghost" && ms > 500;

  const displayTime = useMemo(() => {
    let dt = formatTime(totalMs);
    if (variant === "moving") {
      dt = dt.slice(0, 6) + "??";
    }
    return dt;
  }, [totalMs, variant]);

  const thresholdWidthPercent = useMemo(
    () => Math.max(2, (threshold / 1000) * 100),
    [threshold]
  );

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-4 mb-8">
      {/* Büyük Sayaç */}
      <div
        className={`text-4xl sm:text-5xl md:text-8xl font-black text-center my-6 font-mono tracking-widest text-[#e4e4e7] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-opacity duration-300 ${
          isGhostHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayTime}
      </div>

      {showProgressBar && (
        <>
          <div
            role="progressbar"
            className={`w-full h-10 md:h-12 bg-[#27272a] rounded-full overflow-hidden relative border-2 border-[#09090b] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] mt-2 transition-opacity duration-300 ${
              isGhostHidden ? "opacity-0" : "opacity-100"
            }`}
            style={{
              transform: isCursed ? "scaleX(-1)" : "none",
            }}
          >
            {/* Kırmızı Hedef (Survival) */}
            {redTarget !== null && !isPenaltyMode && (
              <div
                className="absolute top-0 h-full bg-[#ef4444] z-40 border-x border-white/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center justify-center"
                style={{
                  left: `${redPos}%`,
                  width: `5%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="absolute -top-6 left-1/2 text-[#ef4444] -translate-x-1/2">
                  {threshold < 150 ? (
                    <ShieldAlert size={20} fill="#ef4444" />
                  ) : (
                    <Apple size={16} fill="#ef4444" />
                  )}
                </div>
              </div>
            )}

            {/* HEDEF ÇUBUĞU - ORİJİNAL YEŞİL RENK KORUNDU */}
            <div
              className={`absolute top-0 h-full bg-[#10b981] z-20 border-x-2 border-white/50 shadow-[0_0_15px_rgba(16,185,129,0.6)] 
                ${
                  disableTransition || isPenaltyMode
                    ? ""
                    : "transition-all duration-300 ease-out"
                }`}
              style={{
                left: `${targetPos}%`,
                width: `${thresholdWidthPercent}%`,
                transform: "translateX(-50%)",
              }}
            >
              {/* Altın Bölge */}
              {!isPenaltyMode && goldenThreshold > 0 && (
                <div
                  className="absolute top-0 h-full bg-[#f59e0b] z-30 opacity-80"
                  style={{
                    left: "50%",
                    width: `${(goldenThreshold / threshold) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </div>

            {/* İlerleme Çubuğu */}
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-900 via-blue-600 to-cyan-400 opacity-90 z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              style={{ width: `${percentage}%` }}
            />

            <div
              className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] ring-1 ring-black/30 z-50"
              style={{ left: `${percentage}%` }}
            />

            {showHint && !isPenaltyMode && (
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-50 pointer-events-none"
                style={{
                  left: `${targetPos}%`,
                  transform: isCursed
                    ? "scaleX(-1) translateX(50%)"
                    : "translateX(-50%)",
                }}
              >
                <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded mb-1 whitespace-nowrap shadow-lg">
                  {t("components.timer.hint")}
                </span>
                <Hand className="rotate-180 fill-white text-white" size={20} />
              </div>
            )}
          </div>

          {/* Alt Metinler */}
          {!isPenaltyMode && (
            <div className="flex justify-between w-full text-[10px] sm:text-xs text-[#71717a] mt-2 font-mono uppercase tracking-wider font-bold px-1">
              {isCursed ? (
                <>
                  <span className="text-[#10b981]">1000ms</span>
                  <span>500ms</span>
                  <span>0ms</span>
                </>
              ) : (
                <>
                  <span
                    className={
                      variant === "moving" ? "text-[#71717a]" : "text-[#10b981]"
                    }
                  >
                    0ms
                  </span>
                  <span>500ms</span>
                  <span>1000ms</span>
                </>
              )}
            </div>
          )}
        </>
      )}

      {variant === "moving" && !isPenaltyMode && (
        <div className="text-[#10b981] text-xs font-bold mt-1 animate-pulse">
          {t("components.timer.target")}: {targetOffset}ms
        </div>
      )}
    </div>
  );
};

export default memo(TimerDisplay);
