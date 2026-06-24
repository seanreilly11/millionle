import { formatNumber } from "../engine/format";
import { MonoLabel } from "./MonoLabel";

const MIN = 1,
  MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

export function OddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);

  return (
    <div className="mt-5">
      <MonoLabel tracking="tracking-label-lg">How close you landed</MonoLabel>
      <div className="relative h-1.5 rounded-full bg-card2 border border-line mt-8 mb-7">
        <div className="absolute inset-0 flex justify-between top-9 font-mono text-label text-steel">
          <span>{Intl.NumberFormat().format(MIN)}</span>
          <span>{Intl.NumberFormat().format(MAX)}</span>
        </div>
        <div
          className="absolute top-0 bottom-0 rounded-full rail-fill"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        {/* ANSWER pin — label above track */}
        <div
          className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-ink"
          style={{ left: `${ap}%` }}
        />
        <div
          className="absolute -top-7 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-ink"
          style={{ left: `${ap}%` }}
        >
          ANSWER {formatNumber(answer)}
        </div>
        {/* YOU pin — label below track */}
        <div
          className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-signal"
          style={{ left: `${gp}%` }}
        />
        <div
          className="absolute top-5 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-badge-text"
          style={{ left: `${gp}%` }}
        >
          YOU {formatNumber(guess)}
        </div>
      </div>
    </div>
  );
}
