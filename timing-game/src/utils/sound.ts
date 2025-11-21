const sounds = {
  goal: new Audio("/sounds/goal.mp3"),
  whistle: new Audio("/sounds/whistle.mp3"),
  kick: new Audio("/sounds/kick.mp3"),
  miss: new Audio("/sounds/miss.mp3"),
};

Object.values(sounds).forEach((sound) => {
  sound.load();
  sound.volume = 0.5;
});

let isMuted = false;

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  return isMuted;
};

export const getMuteStatus = (): boolean => isMuted;

export const playSound = (type: keyof typeof sounds) => {
  if (isMuted) return;

  const sound = sounds[type];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
};
