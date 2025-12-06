import type { GameVariant } from "../types";

export const DIFFICULTIES = {
  EASY: { labelKey: "difficulty.easy", reaction: 2500, accuracy: 0.3 },
  MEDIUM: { labelKey: "difficulty.medium", reaction: 2000, accuracy: 0.5 },
  HARD: { labelKey: "difficulty.hard", reaction: 1500, accuracy: 0.75 },
  IMPOSSIBLE: {
    labelKey: "difficulty.impossible",
    reaction: 1000,
    accuracy: 1,
  },
};

export const SHOT_ZONES = {
  GOAL: 10,
  PENALTY: 110,
  SHOT: 310,
  CROSS: 510,
  FREEKICK: 710,
};

export const VARIANTS: {
  key: GameVariant;
  labelKey: string;
  descKey: string;
}[] = [
  {
    key: "classic",
    labelKey: "variant.classic.label",
    descKey: "variant.classic.desc",
  },
  {
    key: "ghost",
    labelKey: "variant.ghost.label",
    descKey: "variant.ghost.desc",
  },
  {
    key: "unstable",
    labelKey: "variant.unstable.label",
    descKey: "variant.unstable.desc",
  },
  {
    key: "random",
    labelKey: "variant.random.label",
    descKey: "variant.random.desc",
  },
  {
    key: "moving",
    labelKey: "variant.moving.label",
    descKey: "variant.moving.desc",
  },
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
