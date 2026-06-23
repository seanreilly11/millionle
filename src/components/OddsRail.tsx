import { formatNumber } from "../engine/format";

const MIN = 1, MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

export function OddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);

  return (
    <div className="rail">
      <div className="label">How close you landed</div>
      <div className="track" style={{ marginTop: 30 }}>
        <div className="ends"><span>1</span><span>1,000,000</span></div>
        <div className="fill" style={{ left: `${left}%`, width: `${width}%` }} />
        <div className="pin" style={{ left: `${gp}%`, background: "var(--signal)" }} />
        <div className="pinlab" style={{ left: `${gp}%`, color: "#08776a" }}>YOU {formatNumber(guess)}</div>
        <div className="pin" style={{ left: `${ap}%`, background: "var(--ink)" }} />
        <div className="pinlab" style={{ left: `${ap}%`, top: -52, color: "var(--ink)" }}>ANSWER {formatNumber(answer)}</div>
      </div>
    </div>
  );
}
