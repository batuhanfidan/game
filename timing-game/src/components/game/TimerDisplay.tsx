import React from "react";
import { formatTime } from "../../utils/formatTime";
import type { GameVariant } from "../../types";

interface TimerDisplayProps {
  totalMs: number;
  targetOffset?: number;
  variant?: GameVariant;
  showProgressBar?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  totalMs,
  targetOffset = 0,
  variant = "classic",
  showProgressBar = true,
}) => {
  const ms = totalMs % 1000;
  const percentage = (ms / 1000) * 100;
  const targetPos = (targetOffset / 1000) * 100;

  // Hayalet Modu: 500ms'den sonra görünmez ol
  const isGhostHidden = variant === "ghost" && ms > 500;

  // Gezgin Modu: Milisaniyeyi gizle
  let displayTime = formatTime(totalMs);
  if (variant === "moving") {
    displayTime = displayTime.slice(0, 6) + "??";
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-4">
      {/* Dijital Sayaç */}
      <div
        className={`text-5xl sm:text-7xl font-black text-center my-6 font-mono tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-opacity duration-300 ${
          isGhostHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayTime}
      </div>

      {/* Yardımcı Bar (İsteğe Bağlı) */}
      {showProgressBar && (
        <>
          <div
            className={`w-full h-8 bg-gray-900 rounded-full overflow-hidden relative border-2 border-gray-700 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] mt-2 transition-opacity duration-300 ${
              isGhostHidden ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* HEDEF BÖLGE */}
            <div
              className="absolute top-0 h-full w-[5%] bg-green-500 z-30 border-x-2 border-white/50 shadow-[0_0_15px_rgba(34,197,94,0.8)] transition-all duration-500 ease-out"
              style={{ left: `${targetPos}%` }}
            >
              {variant === "moving" && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-green-400"></div>
              )}
            </div>

            {/* İlerleme */}
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-900 via-blue-600 to-cyan-400 opacity-90 z-10"
              style={{ width: `${percentage}%` }}
            />

            {/* İmleç */}
            <div
              className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,1)] z-40"
              style={{ left: `${percentage}%` }}
            />

            {/* Orta Çizgi (Referans) */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600/50 z-20"></div>
          </div>

          <div className="flex justify-between w-full text-[10px] sm:text-xs text-gray-400 mt-2 font-mono uppercase tracking-wider font-bold px-1">
            <span
              className={
                variant === "moving" ? "text-gray-600" : "text-green-400"
              }
            >
              0ms
            </span>
            <span>500ms</span>
            <span>1000ms</span>
          </div>
        </>
      )}

      {variant === "moving" && (
        <div className="text-green-400 text-xs font-bold mt-1 animate-pulse">
          HEDEF: {targetOffset}ms
        </div>
      )}
    </div>
  );
};
export default TimerDisplay;
