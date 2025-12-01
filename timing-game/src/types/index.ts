export type Player = "p1" | "p2";
export type GameState = "idle" | "countdown" | "playing" | "finished";
export type GameMode = "classic" | "bot" | "survival" | "time_attack";

export type GameVariant =
  | "classic"
  | "ghost"
  | "unstable"
  | "random"
  | "moving";

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
