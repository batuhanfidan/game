import React from "react";
import { formatTime } from "../../utils/formatTime";
import type { GameVariant } from "../../types";
import { Apple, ShieldAlert } from "lucide-react";

interface TimerDisplayProps {
  totalMs: number;
  targetOffset?: number;
  variant?: GameVariant;
  showProgressBar?: boolean;
  threshold?: number;
  goldenThreshold?: number;
  isCursed?: boolean;
  redTarget?: number | null;
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
}) => {
  const ms = totalMs % 1000;
  const percentage = (ms / 1000) * 100;

  const visualTargetOffset = isCursed ? 1000 - targetOffset : targetOffset;
  const targetPos = (visualTargetOffset / 1000) * 100;

  let redPos = 0;
  if (redTarget !== null) {
    const visualRed = isCursed ? 1000 - redTarget : redTarget;
    redPos = (visualRed / 1000) * 100;
  }

  const isGhostHidden = variant === "ghost" && ms > 500;

  let displayTime = formatTime(totalMs);
  if (variant === "moving") {
    displayTime = displayTime.slice(0, 6) + "??";
  }

  const thresholdWidthPercent = Math.max(2, (threshold / 1000) * 100);
  const effectiveGoldenThreshold = goldenThreshold > 0 ? goldenThreshold : 10;
  const goldenWidthPercent = (effectiveGoldenThreshold / 1000) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-4">
      <div
        className={`text-5xl sm:text-7xl md:text-8xl font-black text-center my-6 font-mono tracking-widest text-[#e4e4e7] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-opacity duration-300 ${
          isGhostHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayTime}
      </div>

      {showProgressBar && (
        <>
          <div
            className={`w-full h-10 md:h-12 bg-[#27272a] rounded-full overflow-hidden relative border-2 border-[#09090b] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] mt-2 transition-opacity duration-300 ${
              isGhostHidden ? "opacity-0" : "opacity-100"
            }`}
            style={{
              transform: isCursed ? "scaleX(-1)" : "none",
            }}
          >
            {redTarget !== null && (
              <div
                className="absolute top-0 h-full bg-[#ef4444] z-40 border-x border-white/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center justify-center"
                style={{
                  left: `${redPos}%`,
                  width: `5%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="absolute -top-6 left-1/2 text-[#ef4444]"
                  style={{
                    transform: isCursed
                      ? "scaleX(-1) translateX(50%)"
                      : "translateX(-50%)",
                  }}
                >
                  {threshold < 150 ? (
                    <ShieldAlert size={20} fill="#ef4444" />
                  ) : (
                    <Apple size={16} fill="#ef4444" />
                  )}
                </div>
              </div>
            )}

            <div
              className="absolute top-0 h-full bg-[#10b981] z-20 border-x-2 border-white/50 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-300 ease-out"
              style={{
                left: `${targetPos}%`,
                width: `${thresholdWidthPercent}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="absolute top-0 h-full bg-[#f59e0b] z-30 opacity-80"
                style={{
                  left: "50%",
                  width: `${
                    (goldenWidthPercent / thresholdWidthPercent) * 100
                  }%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>

            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-900 via-blue-600 to-cyan-400 opacity-90 z-10 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              style={{ width: `${percentage}%` }}
            />

            <div
              className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] ring-1 ring-black/30 z-50"
              style={{ left: `${percentage}%` }}
            />
          </div>

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
        </>
      )}

      {variant === "moving" && (
        <div className="text-[#10b981] text-xs font-bold mt-1 animate-pulse">
          HEDEF: {targetOffset}ms
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
