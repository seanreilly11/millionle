import { useState } from "react";
import { formatNumber, parseGuess } from "../engine/format";

export function GuessInput({ onSubmit, loading = false }: { onSubmit: (guess: number) => void; loading?: boolean }) {
  const [raw, setRaw] = useState("");
  const parsed = parseGuess(raw);
  const display =
    raw === ""
      ? ""
      : parsed !== null
        ? formatNumber(parsed)
        : raw.replace(/[^\d]/g, "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 7);
    setRaw(digits);
  }

  return (
    <>
      <div className="font-mono text-label tracking-input text-steel uppercase">
        Your one guess
      </div>
      <div className="inline-flex items-center gap-2 px-1.5 pb-3 border-b-2 border-signal">
        <input
          className="guess-input font-num text-display font-extrabold tracking-tight text-ink w-full text-center tabular-nums"
          type="text"
          aria-label="Your one guess"
          inputMode="numeric"
          autoComplete="off"
          placeholder="412,769"
          value={display}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed !== null) onSubmit(parsed);
          }}
        />
      </div>
      <button
        className="mt-2 w-full rounded-2xl py-5 font-num font-extrabold text-lg tracking-wide text-white bg-signal shadow-cta disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none"
        disabled={parsed === null || loading}
        onClick={() => parsed !== null && !loading && onSubmit(parsed)}
      >
        {loading ? "Locking in…" : "Lock in guess"}
      </button>
    </>
  );
}
