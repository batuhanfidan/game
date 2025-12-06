import { memo } from "react";
import { Gamepad2, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TurnInfoProps {
  currentPlayer: string;
  turnTimeLeft: number;
}

const TurnInfo: React.FC<TurnInfoProps> = ({ currentPlayer, turnTimeLeft }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-1.5 mt-4 animate-fade-in px-4 w-full">
      <div className="flex items-center justify-center gap-2 text-lg sm:text-xl text-white">
        <Gamepad2 size={20} className="shrink-0 text-blue-400" />
        <span className="opacity-80 text-sm sm:text-base font-medium">
          {t("components.turn_info.turn")}
        </span>
        <strong
          className="whitespace-normal max-w-[150px] sm:max-w-[200px] block text-center"
          title={currentPlayer}
        >
          {currentPlayer}
        </strong>
      </div>

      <div
        className={`
        flex items-center gap-2 text-sm font-mono font-bold px-3 py-1 rounded-full border transition-colors
        ${
          turnTimeLeft <= 3
            ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
            : "bg-neutral-800 text-gray-400 border-neutral-700"
        }
      `}
      >
        <Timer size={14} />
        <span>{turnTimeLeft}s</span>
      </div>
    </div>
  );
};

export default memo(TurnInfo);
