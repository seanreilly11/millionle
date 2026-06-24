import { addDays } from './date'

export interface StatsRow { date: string; distance: number }

export interface Stats {
  streak: number;
  longestStreak: number;
  closestEver: number;
  totalPlays: number;
  averageDistance: number;
}

export function computeStats(rows: StatsRow[], today: string): Stats {
  if (rows.length === 0) {
    return { streak: 0, longestStreak: 0, closestEver: 0, totalPlays: 0, averageDistance: 0 }
  }

  const closestEver = Math.min(...rows.map((r) => r.distance))
  const totalPlays = rows.length
  const averageDistance = rows.reduce((sum, r) => sum + r.distance, 0) / rows.length

  const dateSet = new Set(rows.map((r) => r.date))
  let streak = 0
  let cursor = today
  while (dateSet.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }

  const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1))
  let longestStreak = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1].date, 1) === sorted[i].date) {
      run++
      if (run > longestStreak) longestStreak = run
    } else {
      run = 1
    }
  }

  return { streak, longestStreak, closestEver, totalPlays, averageDistance }
}
