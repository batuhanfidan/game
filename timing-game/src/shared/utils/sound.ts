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

// Seslerin hazır olup olmadığını kontrol eden güvenli Promise
export const soundsReady = Promise.all(
  Object.values(sounds).map(
    (s) =>
      new Promise((resolve) => {
        // Eğer ses zaten yüklendiyse
        if (s.readyState >= 3) {
          resolve(null);
          return;
        }

        const onSuccess = () => {
          s.removeEventListener("canplaythrough", onSuccess);
          s.removeEventListener("error", onError);
          resolve(null);
        };

        const onError = (e: Event) => {
          console.warn("Ses dosyası yüklenemedi, sessiz mod devam edecek:", e);
          s.removeEventListener("canplaythrough", onSuccess);
          s.removeEventListener("error", onError);
          resolve(null);
        };

        s.addEventListener("canplaythrough", onSuccess, { once: true });
        s.addEventListener("error", onError, { once: true });
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
    if (sound.paused) {
      sound.play().catch(() => {});
    } else {
      sound.currentTime = 0;
    }
  }
};
