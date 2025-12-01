import { memo } from "react";
import { Gamepad2, Timer } from "lucide-react";

interface TurnInfoProps {
  currentPlayer: string;
  turnTimeLeft: number;
}

const TurnInfo: React.FC<TurnInfoProps> = ({ currentPlayer, turnTimeLeft }) => {
  return (
    <div className="text-center mt-4 text-lg flex flex-col items-center gap-1">
      <p className="flex items-center gap-2">
        <Gamepad2 size={20} /> Sıra: <strong>{currentPlayer}</strong>
      </p>
      <p className="flex items-center gap-2 text-sm opacity-80">
        <Timer size={16} /> {turnTimeLeft}s
      </p>
    </div>
  );
};

export default memo(TurnInfo);
