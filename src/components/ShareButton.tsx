import { formatNumber } from "../engine/format";

export function ShareButton({ puzzle, guess, distance }: { puzzle: number; guess: number; distance: number }) {
  const line = `MILLIONLE No.${puzzle} — ${formatNumber(guess)} → off by ${formatNumber(distance)}`;
  return (
    <button
      className="mt-3.5 w-full border-2 border-line2 bg-transparent text-ink rounded-xl py-3.5 font-num font-bold text-sm"
      onClick={() => navigator.clipboard?.writeText(line)}
    >
      Share result
    </button>
  );
}
