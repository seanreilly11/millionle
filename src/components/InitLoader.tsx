const DIGITS = "1,000,000";

export function InitLoader() {
  return (
    <div className="win-bg min-h-dvh flex flex-col items-center justify-center gap-5">
      <p className="font-mono text-xs tracking-label-lg uppercase text-steel">
        Millionle
      </p>
      <div className="font-black select-none" style={{ fontSize: "clamp(2rem, 10vw, 5rem)", lineHeight: 1 }}>
        {DIGITS.split("").map((char, i) => (
          <span
            key={i}
            className="win-number loader-bounce-char"
            style={{ animationDelay: `${i * 0.09}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
