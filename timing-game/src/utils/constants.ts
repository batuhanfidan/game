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

export const SHOT_ZONES = {
  GOAL: 10,
  PENALTY: 110,
  SHOT: 310,
  CROSS: 510,
  FREEKICK: 710,
};

export const VARIANTS: { key: GameVariant; label: string; desc: string }[] = [
  { key: "classic", label: "Klasik", desc: "Standart oyun. Hedef 00ms." },
  { key: "ghost", label: "Hayalet", desc: "Sayaç 500ms'den sonra kaybolur." },
  { key: "unstable", label: "Dengesiz", desc: "Zamanın hızı sürekli değişir." },
  { key: "random", label: "Rastgele", desc: "Her tur farklı yerden başlar." },
  { key: "moving", label: "Gezgin", desc: "Hedef sürekli değişir." },
];

export const SURVIVAL_CONSTANTS = {
  SPEED_INCREASE_INTERVAL: 5,
  LIFE_BONUS_INTERVAL: 10,
  CURSE_INTERVAL: 15,
  RED_TARGET_SPAWN_CHANCE: 0.2,
  INITIAL_LIVES: 3,
  MAX_LIVES: 5,
};

export const GAME_DELAYS = {
  SHOT_RESULT_DISPLAY: 2000,
  COUNTDOWN_INTERVAL: 1000,
  FEVER_DURATION: 5000,
  EFFECT_DISPLAY_DURATION: 1000,
  POPUP_FADE_DURATION: 1500,
  BOT_REACTION_BASE: 2000,
} as const;

export const GAMEPLAY_CONSTANTS = {
  CURSE_INTERVAL: 15,
  LIFE_BONUS_INTERVAL: 10,
  SPEED_INCREASE_INTERVAL: 5,
  MAX_LIVES: 5,
  INITIAL_LIVES: 3,
  TURN_TIME_LIMIT: 10,
  FEVER_ADRENALINE_THRESHOLD: 100,
} as const;

export const UI_CONSTANTS = {
  MAX_LIVES_DISPLAY: 5,
  HEART_ICON_SIZE: 32,
  MENU_ICON_SIZE: 24,
  MOBILE_BREAKPOINT: 768,

  Z_INDEX: {
    TUTORIAL: 9999,
    POPUP: 100,
    OVERLAY: 50,
    MENU: 60,
    CONTENT: 10,
  },
  COLORS: {
    PRIMARY: "#3b82f6",
    SUCCESS: "#22c55e",
    DANGER: "#ef4444",
    WARNING: "#eab308",
    TEXT_MUTED: "#a1a1aa",
  },
} as const;

export const TUTORIAL_STEPS = [
  {
    target: "intro",
    title: "Eğitim Moduna Hoşgeldin! 👋",
    text: "Reflekslerini test etmeye hazır mısın? Bu kısa turda sana oyunun temellerini göstereceğiz.",
    position: "center",
  },
  {
    target: "timer",
    title: "Hedefin: Zamanlama",
    text: "Gördüğün zaman çubuğu senin en büyük rakibin. Amacın süreyi mükemmel anda, yani 00ms'de yakalamak.",
    position: "layout-timer",
  },
  {
    target: "turn-info",
    title: "Sıra Süresi",
    text: "Hamle yapmak için 10 saniyen var. Eğer süre dolarsa sıranı kaybedersin.",
    position: "layout-turn",
  },
  {
    target: "player-timers",
    title: "Oyuncu Süreleri",
    text: "Toplam maç süresi iki oyuncu arasında paylaştırılır. Düşünürken harcadığın zaman kendi bakiyenden düşer.",
    position: "layout-player",
  },
  {
    target: "help",
    title: "Kılavuz ve İpuçları",
    text: "Takıldığın yerde detaylı kurallar için ?(Soru işareti)'ne tıklayabilirsin.",
    position: "top-right",
  },
  {
    target: "mode-info",
    title: "Oyun Modu",
    text: "Şu an Klasik Mod'da, Orta Seviye Bot'a karşı oynamaktasın. Ana menüden farklı oyun modları ve varyasyonları seçerek yeni deneyimler elde edebilirsin.",
    position: "layout-mode",
  },
  {
    target: "action-button",
    title: "Vuruş Anı",
    text: "Hazırsan başlayalım! Süre hedefe geldiğinde butona bas.",
    position: "layout-action",
  },
];
