import { useCallback, useState } from "react";
import {
  playSound as utilsPlaySound,
  toggleMute as utilsToggleMute,
  getMuteStatus,
} from "../../utils/sound";

export const useSoundEffects = () => {
  const [isMuted, setIsMuted] = useState(getMuteStatus());

  const play = useCallback((type: "goal" | "whistle" | "kick" | "miss") => {
    utilsPlaySound(type);
  }, []);

  const toggle = useCallback(() => {
    const newStatus = utilsToggleMute();
    setIsMuted(newStatus);
    return newStatus;
  }, []);

  return { isMuted, play, toggle };
};
