const DAY = 86_400_000;

export function localDate(offsetMinutes: number, now: Date = new Date()): string {
  const clamped = Math.max(-720, Math.min(840, Math.round(offsetMinutes)));
  return new Date(now.getTime() + clamped * 60_000).toISOString().slice(0, 10);
}

export function addDays(dateISO: string, days: number): string {
  const t = Date.parse(dateISO + "T00:00:00Z") + days * DAY;
  return new Date(t).toISOString().slice(0, 10);
}

export function puzzleNumber(launchISO: string, dateISO: string): number {
  const launch = Date.parse(launchISO + "T00:00:00Z");
  const date = Date.parse(dateISO + "T00:00:00Z");
  return Math.floor((date - launch) / DAY) + 1;
}
