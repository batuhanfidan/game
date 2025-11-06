import { formatTime } from '../utils/formatTime';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ minutes, seconds, milliseconds }) => {
  return (
    <div className="text-3xl font-bold text-center my-4">
      {formatTime(minutes, seconds, milliseconds)}
    </div>
  );
};

export default TimerDisplay;
