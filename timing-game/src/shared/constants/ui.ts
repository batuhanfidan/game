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
