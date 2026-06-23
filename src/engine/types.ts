export type GameMode = "number" | "letters";

export interface GameConfig {
  name: string;
  mode: GameMode;
  min?: number;
  max?: number;
  length?: number;
  guesses: number;
  launch: string; // ISO date YYYY-MM-DD of puzzle #1
}
