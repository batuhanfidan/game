export type Player = "p1" | "p2";
export type GameState =
  | "idle"
  | "countdown"
  | "playing"
  | "finished"
  | "waiting";
export type GameMode =
  | "classic"
  | "bot"
  | "survival"
  | "time_attack"
  | "multiplayer";
import type { ElementType } from "react";

export interface ActionMessage {
  text: string;
  icon?: ElementType;
  className?: string;
}

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

export type CurseType = "REVERSE" | "UNSTABLE" | "MOVING_TARGET";

export interface TimeChangePopup {
  id: number;
  value: number;
  type: "positive" | "negative";
}

export type SoundType = "goal" | "whistle" | "kick" | "miss";
