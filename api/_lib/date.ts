const DAY = 86_400_000
const LAUNCH_DATE = '2026-06-23' // must match MILLIONLE.launch in src/game.config.ts

export function dateFromOffset(offsetMinutes: number, now: Date = new Date()): string {
  const clamped = Math.max(-720, Math.min(840, Math.round(offsetMinutes)))
  return new Date(now.getTime() + clamped * 60_000).toISOString().slice(0, 10)
}

export function addDays(dateISO: string, days: number): string {
  const t = Date.parse(dateISO + 'T00:00:00Z') + days * DAY
  return new Date(t).toISOString().slice(0, 10)
}

export function puzzleNumber(dateISO: string): number {
  const launch = Date.parse(LAUNCH_DATE + 'T00:00:00Z')
  const date = Date.parse(dateISO + 'T00:00:00Z')
  return Math.floor((date - launch) / DAY) + 1
}
