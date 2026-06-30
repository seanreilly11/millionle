import { useRef, useState } from "react";
import { formatNumber, parseGuess } from "../engine/format";

export function GuessInput({ onSubmit, loading = false }: { onSubmit: (guess: number) => void; loading?: boolean }) {
  const [raw, setRaw] = useState("");
  const [pulseKey, setPulseKey] = useState(0);
  const underlineRef = useRef<HTMLDivElement>(null);
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
    setPulseKey((k) => k + 1);
    // Force a reflow so the CSS animation restarts even though the class
    // never actually leaves the element (a plain re-render wouldn't replay
    // an already-applied keyframe animation).
    const el = underlineRef.current;
    if (el) {
      el.classList.remove("input-pulse");
      void el.offsetWidth;
      el.classList.add("input-pulse");
    }
  }

  return (
    <>
      <div className="font-mono text-label tracking-input text-steel uppercase">
        Your one guess
      </div>
      <div
        ref={underlineRef}
        data-pulse-key={pulseKey}
        className={`inline-flex items-center gap-2 px-1.5 pb-3 border-b-2 border-signal${pulseKey > 0 ? " input-pulse" : ""}`}
      >
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
        className="mt-2 w-full rounded-2xl py-5 font-num font-extrabold text-lg tracking-wide text-white bg-signal shadow-cta disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] transition-transform duration-100"
        disabled={parsed === null || loading}
        onClick={() => parsed !== null && !loading && onSubmit(parsed)}
      >
        {loading ? (
          <span className="loading-dots inline-flex gap-1" aria-label="Locking in">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          </span>
        ) : (
          "Lock in guess"
        )}
      </button>
    </>
  );
}
