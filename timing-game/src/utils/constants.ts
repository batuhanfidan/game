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
  HARD: { label: "Zor", reaction: 1000, accuracy: 0.75 },
  IMPOSSIBLE: { label: "İmkansız", reaction: 600, accuracy: 0.95 },
};

export const GAME_VARIANTS: {
  id: GameVariant;
  title: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: "classic",
    title: "Klasik",
    desc: "Standart kurallar. En iyi olan kazansın.",
    icon: "🟢",
  },
  {
    id: "ghost",
    title: "Hayalet",
    desc: "Sayaç 500ms'den sonra kaybolur. İçinden say!",
    icon: "👻",
  },
  {
    id: "unstable",
    title: "Dengesiz",
    desc: "Zaman akışı bozuk! Bazen hızlı, bazen yavaş.",
    icon: "📉",
  },
  {
    id: "random_start",
    title: "Rastgele Başlangıç",
    desc: "Her tur farklı bir süreden başlar.",
    icon: "🔀",
  },
  {
    id: "moving_target",
    title: "Gezgin Hedef",
    desc: "Hedef bölge her tur yer değiştirir.",
    icon: "🎯",
  },
];

export const SHOT_ZONES = {
  GOAL: 10,
  PENALTY: 110,
  SHOT: 310,
  CROSS: 510,
  FREEKICK: 710,
};
