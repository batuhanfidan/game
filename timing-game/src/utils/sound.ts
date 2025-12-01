const sounds = {
  goal: new Audio("/sounds/goal.mp3"),
  whistle: new Audio("/sounds/whistle.mp3"),
  kick: new Audio("/sounds/kick.mp3"),
  miss: new Audio("/sounds/miss.mp3"),
};

// Preload ve Hata Yönetimi
Object.values(sounds).forEach((sound) => {
  sound.load();
  sound.volume = 0.5;
  sound.addEventListener("error", (e) => {
    console.warn("Ses dosyası yüklenemedi:", e);
  });
});

let isMuted = false;

// Seslerin hazır olup olmadığını kontrol eden bir promise
export const soundsReady = Promise.all(
  Object.values(sounds).map(
    (s) =>
      new Promise((resolve) => {
        s.addEventListener("canplaythrough", resolve, { once: true });
        s.addEventListener(
          "error",
          (e) => {
            console.warn(
              "Ses dosyası yüklenemedi, sessiz mod devam edecek:",
              e
            );
            resolve(null); // Resolve to allow game to continue
          },
          { once: true }
        );
      })
  )
);

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
    sound.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.warn(`Sound '${type}' failed to play:`, err);
      }
    });
  }
};
