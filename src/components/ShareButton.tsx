import { formatNumber } from "../engine/format";

export function ShareButton({ puzzle, guess, distance, score }: { puzzle: number; guess: number; distance: number; score: number }) {
  const line = `MILLIONLE No.${puzzle} — ${formatNumber(guess)} → off by ${formatNumber(distance)} · score ${formatNumber(score)}`;
  return (
    <button className="share" onClick={() => navigator.clipboard?.writeText(line)}>
      Share result
    </button>
  );
}
