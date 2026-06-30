import { motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { MonoLabel } from "./MonoLabel";
import { prefersReducedMotion, BOUNCY, STAGGER_MS } from "../lib/motion";

const MIN = 1,
  MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

export function OddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);
  const reduced = prefersReducedMotion();

  const fillTransition = reduced ? { duration: 0 } : { ...BOUNCY, delay: STAGGER_MS / 1000 };
  const pinTransition = reduced ? { duration: 0 } : { ...BOUNCY, delay: (STAGGER_MS * 1.3) / 1000 };

  return (
    <div className="mt-8">
      <MonoLabel tracking="tracking-label-lg">How close you landed</MonoLabel>
      <div className="relative h-1.5 rounded-full bg-card2 border border-line mt-12 mb-9">
        <div className="absolute inset-0 flex justify-between top-9 font-mono text-label text-steel">
          <span>{Intl.NumberFormat().format(MIN)}</span>
          <span>{Intl.NumberFormat().format(MAX)}</span>
        </div>
        <motion.div
          data-testid="rail-fill"
          className="absolute top-0 bottom-0 rounded-full rail-fill"
          style={{ left: `${left}%` }}
          initial={reduced ? { width: `${width}%` } : { width: "0%" }}
          animate={{ width: `${width}%` }}
          transition={fillTransition}
        />
        {/* ANSWER pin + label */}
        <motion.div
          data-testid="answer-pin"
          className="absolute"
          style={{ left: `${ap}%` }}
          initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pinTransition}
        >
          <div className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-ink" />
          <div className="absolute -top-7 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-ink">
            ANSWER {formatNumber(answer)}
          </div>
        </motion.div>
        {/* YOU pin + label */}
        <motion.div
          data-testid="guess-pin"
          className="absolute"
          style={{ left: `${gp}%` }}
          initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pinTransition}
        >
          <div className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-signal" />
          <div className="absolute top-5 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-badge-text">
            YOU {formatNumber(guess)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
