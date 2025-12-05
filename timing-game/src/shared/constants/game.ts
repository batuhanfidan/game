import type { GameVariant } from "../types";

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
