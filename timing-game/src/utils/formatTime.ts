export const formatTime = (minutes: number, seconds: number, milliseconds = 0): string => {
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  const ms = String(milliseconds).padStart(3, '0');
  return `${m}:${s}:${ms}`;
};
