import { formatTime } from '../utils/formatTime';

interface PlayerTimerProps {
  player: string;
  minutes: number;
  seconds: number;
}

const PlayerTimer: React.FC<PlayerTimerProps> = ({ player, minutes, seconds }) => {
  return (
    <div className="flex flex-col items-center p-2 sm:p-3 md:p-4">
      <h2 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{player}</h2>
      <div className="text-lg sm:text-xl md:text-2xl">{formatTime(minutes, seconds)}</div>
    </div>
  );
};

export default PlayerTimer;
