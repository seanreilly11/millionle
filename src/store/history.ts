export interface HistoryRow { date: string; guess: number; distance: number; }
const KEY = "millionle.history";

export function readHistory(): HistoryRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryRow[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(row: HistoryRow): void {
  const rows = readHistory().filter((r) => r.date !== row.date);
  rows.push(row);
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function findByDate(date: string): HistoryRow | undefined {
  return readHistory().find((r) => r.date === date);
}
