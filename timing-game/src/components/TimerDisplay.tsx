import { formatTime } from "../utils/formatTime";

interface TimerDisplayProps {
  totalMs: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ totalMs }) => {
  return (
    <div className="text-4xl sm:text-6xl font-bold text-center my-4 font-mono tracking-wider text-white drop-shadow-md">
      {formatTime(totalMs)}
    </div>
  );
};

export default TimerDisplay;
