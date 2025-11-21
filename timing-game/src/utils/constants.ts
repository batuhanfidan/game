export const THEMES = [
  { name: "Klasik", class: "bg-black" },
  { name: "Çim Saha", class: "bg-green-900" },
  { name: "Gece Mavisi", class: "bg-slate-900" },
  { name: "Neon", class: "bg-purple-900" },
  { name: "Zamana Karşı", class: "bg-slate-950" },
  { name: "Hayatta Kalma", class: "bg-neutral-950" },
];

export const DIFFICULTIES = {
  EASY: { label: "Kolay", reaction: 2500, accuracy: 0.3 },
  MEDIUM: { label: "Orta", reaction: 2000, accuracy: 0.5 },
  HARD: { label: "Zor", reaction: 1000, accuracy: 0.75 },
  IMPOSSIBLE: { label: "İmkansız", reaction: 600, accuracy: 0.95 },
};

// Vuruş bölgeleri (milisaniye cinsinden)
export const SHOT_ZONES = {
  GOAL: 10, // 0-9 ms -> Mükemmel Gol
  PENALTY: 110, // 10-109 ms -> Penaltı şansı
  SHOT: 310, // 110-309 ms -> Şut şansı
  CROSS: 510, // 310-509 ms -> Orta şansı
  FREEKICK: 710, // 510-709 ms -> Frikik şansı
};
