import { formatNumber } from "../engine/format";

export function ShareButton({ puzzle, guess, distance }: { puzzle: number; guess: number; distance: number }) {
  const line = `MILLIONLE No.${puzzle} — ${formatNumber(guess)} → off by ${formatNumber(distance)}`;
  return (
    <button className="share" onClick={() => navigator.clipboard?.writeText(line)}>
      Share result
    </button>
  );
}
