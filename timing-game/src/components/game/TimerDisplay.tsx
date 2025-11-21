import React from "react";
import { formatTime } from "../../utils/formatTime";

interface TimerDisplayProps {
  totalMs: number;
  targetOffset?: number; // YENİ: Hedef kaydırma miktarı
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  totalMs,
  targetOffset = 0,
}) => {
  const ms = totalMs % 1000;
  const percentage = (ms / 1000) * 100;

  // Hedef bölgenin (Yeşil Alan) konumu. Normalde 0 (sol baş).
  // targetOffset 500 ise %50'ye kayar.
  const targetPercentage = (targetOffset / 1000) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-lg px-4">
      <div className="text-5xl sm:text-7xl font-black text-center my-6 font-mono tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        {formatTime(totalMs)}
      </div>
      <div className="w-full h-8 bg-gray-900 rounded-full overflow-hidden relative border-2 border-gray-700 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] mt-2">
        {/* YEŞİL HEDEF BÖLGESİ */}
        <div
          className="absolute top-0 h-full w-[5%] bg-green-500 z-30 border-r-2 border-white/50 shadow-[0_0_15px_rgba(34,197,94,0.8)] transition-all duration-500 ease-in-out"
          style={{ left: `${targetPercentage}%` }} // Dinamik Konum
        ></div>

        {/* İLERLEYEN BAR */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-400 opacity-90 z-10"
          style={{ width: `${percentage}%` }}
        />

        {/* BEYAZ ÇİZGİ (CURSOR) */}
        <div
          className="absolute top-0 h-full w-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,1)] z-40"
          style={{ left: `${percentage}%` }}
        />

        {/* ORTA ÇİZGİ (Referans) */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600/50 z-20"></div>
      </div>

      <div className="flex justify-between w-full text-[10px] sm:text-xs text-gray-400 mt-2 font-mono uppercase tracking-wider font-bold px-1">
        <span>0ms</span>
        <span>500ms</span>
        <span>1000ms</span>
      </div>
    </div>
  );
};
export default TimerDisplay;
