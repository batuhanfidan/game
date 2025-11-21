export type Player = "p1" | "p2";
export type GameState = "setup" | "idle" | "countdown" | "playing" | "finished"; // 'setup' eklendi
export type GameMode =
  | "classic"
  | "bot"
  | "survival"
  | "time_attack"
  | "penalty";

export type GameVariant =
  | "classic" // Normal
  | "ghost" // Hayalet (Görünmez)
  | "unstable" // Dengesiz (Hızlanıp yavaşlayan)
  | "random_start" // Rastgele Başlangıç
  | "moving_target"; // Gezgin Hedef

export interface VisualEffectData {
  type: "goal" | "post" | "miss" | "save";
  player: Player;
}

export type ShotResult =
  | "GOL"
  | "PENALTI"
  | "ŞUT"
  | "ORTA"
  | "FRİKİK"
  | "OFSAYT"
  | "KAÇTI"
  | "KURTARDI"
  | "DİREK";

export interface ShotOutcome {
  result: ShotResult;
  message: string;
  isGoal: boolean;
}
