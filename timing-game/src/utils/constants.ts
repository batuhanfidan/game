import type { GameVariant } from "../types";

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
  HARD: { label: "Zor", reaction: 1500, accuracy: 0.75 },
  IMPOSSIBLE: { label: "İmkansız", reaction: 1000, accuracy: 1 },
};

// Vuruş bölgeleri (milisaniye cinsinden)
export const SHOT_ZONES = {
  GOAL: 10, // 0-9 ms -> Mükemmel Gol
  PENALTY: 110, // 10-109 ms -> Penaltı şansı
  SHOT: 310, // 110-309 ms -> Şut şansı
  CROSS: 510, // 310-509 ms -> Orta şansı
  FREEKICK: 710, // 510-709 ms -> Frikik şansı
};

export const VARIANTS: { key: GameVariant; label: string; desc: string }[] = [
  { key: "classic", label: "Klasik", desc: "Standart oyun. Hedef 00ms." },
  { key: "ghost", label: "Hayalet", desc: "Sayaç 500ms'den sonra kaybolur." },
  { key: "unstable", label: "Dengesiz", desc: "Zamanın hızı sürekli değişir." },
  { key: "random", label: "Rastgele", desc: "Her tur farklı yerden başlar." },
  { key: "moving", label: "Gezgin", desc: "Hedef sürekli değişir." },
];

export const SURVIVAL_CONSTANTS = {
  SPEED_INCREASE_INTERVAL: 5, // Her 5 seride hız artar
  LIFE_BONUS_INTERVAL: 10, // Her 10 seride can verir
  CURSE_INTERVAL: 15, // Her 15 seride lanet gelir
  RED_TARGET_SPAWN_CHANCE: 0.2,
  INITIAL_LIVES: 3,
  MAX_LIVES: 5,
};
