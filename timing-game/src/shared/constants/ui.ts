export const THEMES = [
  { name: "Klasik", class: "bg-black" },
  { name: "Çim Saha", class: "bg-green-900" },
  { name: "Gece Mavisi", class: "bg-slate-900" },
  { name: "Neon", class: "bg-purple-900" },
  { name: "Zamana Karşı", class: "bg-slate-950" },
  { name: "Hayatta Kalma", class: "bg-neutral-950" },
];

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
    titleKey: "tutorial.intro.title",
    textKey: "tutorial.intro.text",
    position: "center",
  },
  {
    target: "timer",
    titleKey: "tutorial.timer.title",
    textKey: "tutorial.timer.text",
    position: "layout-timer",
  },
  {
    target: "turn-info",
    titleKey: "tutorial.turn.title",
    textKey: "tutorial.turn.text",
    position: "layout-turn",
  },
  {
    target: "player-timers",
    titleKey: "tutorial.player.title",
    textKey: "tutorial.player.text",
    position: "layout-player",
  },
  {
    target: "help",
    titleKey: "tutorial.help.title",
    textKey: "tutorial.help.text",
    position: "top-right",
  },
  {
    target: "mode-info",
    titleKey: "tutorial.mode.title",
    textKey: "tutorial.mode.text",
    position: "layout-mode",
  },
  {
    target: "action-button",
    titleKey: "tutorial.action.title",
    textKey: "tutorial.action.text",
    position: "layout-action",
  },
];
