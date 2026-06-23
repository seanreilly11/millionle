import { addDays } from "./date";

export interface GuessRow { date: string; distance: number; score: number; }
export interface Stats { streak: number; lifetimePoints: number; closestEver: number; }

export function computeStats(rows: GuessRow[], today: string): Stats {
  const lifetimePoints = rows.reduce((sum, r) => sum + r.score, 0);
  const closestEver = rows.length ? Math.min(...rows.map((r) => r.distance)) : 0;

  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return { streak, lifetimePoints, closestEver };
}
