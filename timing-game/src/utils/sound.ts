let isMuted = false;

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteStatus = (): boolean => isMuted;

export const playSound = (type: "goal" | "whistle" | "kick" | "miss") => {
  if (isMuted) return;

  const sounds = {
    goal: "/sounds/goal.mp3",
    whistle: "/sounds/whistle.mp3",
    kick: "/sounds/kick.mp3",
    miss: "/sounds/miss.mp3",
  };

  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play().catch(() => {});
};
