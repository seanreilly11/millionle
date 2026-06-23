import { useState } from "react";
import { formatNumber, parseGuess } from "../engine/format";

export function GuessInput({
  onSubmit,
}: {
  onSubmit: (guess: number) => void;
}) {
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
      <div className="guesslab">Your one guess</div>
      <div className="guessbox">
        <input
          aria-label="Your one guess"
          inputMode="numeric"
          placeholder="412,769"
          value={display}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed !== null) onSubmit(parsed);
          }}
        />
      </div>
      <button
        className="cta"
        disabled={parsed === null}
        onClick={() => parsed !== null && onSubmit(parsed)}
      >
        Lock in guess
      </button>
    </>
  );
}
