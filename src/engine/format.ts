export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function parseGuess(input: string, min = 1, max = 1_000_000): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}
