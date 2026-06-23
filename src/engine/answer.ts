import { seededRandom } from "./prng";
import type { GameConfig } from "./types";

export function answerForDate(config: GameConfig, dateISO: string): number {
  const min = config.min ?? 1;
  const max = config.max ?? 1_000_000;
  const rand = seededRandom(`${config.name}:${dateISO}`);
  return min + Math.floor(rand() * (max - min + 1));
}
