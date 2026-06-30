import { useState } from "react";
import { motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { MonoLabel } from "./MonoLabel";
import { prefersReducedMotion, BOUNCY, STAGGER_MS } from "../lib/motion";

const MIN = 1,
  MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

// Swap to false to fall back to the original tick-mark rail.
const USE_CHOREO_RAIL = true;

const TRAVEL_DELAY = 0.25;
const TRAVEL_DURATION = 0.5;

function RailScale() {
  return (
    <div className="absolute inset-0 flex justify-between top-9 font-mono text-label text-steel">
      <span>{Intl.NumberFormat().format(MIN)}</span>
      <span>{Intl.NumberFormat().format(MAX)}</span>
    </div>
  );
}

function ClassicOddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);
  const reduced = prefersReducedMotion();

  const fillTransition = reduced
    ? { duration: 0 }
    : { ...BOUNCY, delay: STAGGER_MS / 1000 };
  const pinTransition = reduced
    ? { duration: 0 }
    : { ...BOUNCY, delay: (STAGGER_MS * 1.3) / 1000 };

  return (
    <div className="mt-8">
      <MonoLabel tracking="tracking-label-lg">How close you landed</MonoLabel>
      <div className="relative h-1.5 rounded-full bg-card2 border border-line mt-12 mb-9">
        <RailScale />
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

function ChoreoOddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const dirRight = ap >= gp;
  const wrapLeft = Math.min(gp, ap);
  const wrapWidth = Math.abs(ap - gp);
  const reduced = prefersReducedMotion();
  const [settled, setSettled] = useState(reduced);

  const youTransition = reduced ? { duration: 0 } : BOUNCY;
  const travelTransition = reduced
    ? { duration: 0 }
    : {
        duration: TRAVEL_DURATION,
        delay: TRAVEL_DELAY,
        ease: [0.3, 0.9, 0.3, 1] as const,
      };
  const answerTransition = reduced
    ? { duration: 0 }
    : { ...BOUNCY, delay: TRAVEL_DELAY + TRAVEL_DURATION };

  return (
    <div className="mt-8">
      <MonoLabel tracking="tracking-label-lg">How close you landed</MonoLabel>
      <div className="relative h-1.5 rounded-full bg-card2 border border-line mt-12 mb-9">
        <RailScale />

        {/* color-filling travel beam, grows from YOU toward ANSWER */}
        <div
          data-testid="rail-fill"
          className="absolute top-0 bottom-0 rounded-full overflow-hidden"
          style={{ left: `${wrapLeft}%`, width: `${wrapWidth}%` }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              transformOrigin: dirRight ? "left center" : "right center",
              background: dirRight
                ? "linear-gradient(90deg, rgba(14, 168, 150, 0.25), #0ea896)"
                : "linear-gradient(270deg, rgba(14, 168, 150, 0.25), #0ea896)",
            }}
            initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={travelTransition}
          />
        </div>

        {/* spark riding the leading edge of the beam */}
        {!reduced && (
          <motion.div
            className="absolute top-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-signal shadow-[0_0_10px_2px_rgba(14,168,150,0.6)]"
            initial={{ left: `${gp}%`, opacity: 0 }}
            animate={{ left: `${ap}%`, opacity: [0, 1, 1, 0] }}
            transition={{ ...travelTransition, times: [0, 0.15, 0.85, 1] }}
          />
        )}

        {/* YOU pin - lands first, since the guess is already known */}
        <motion.div
          data-testid="guess-pin"
          className="absolute"
          style={{ left: `${gp}%` }}
          initial={reduced ? { scale: 1 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={youTransition}
        >
          <div
            className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-signal shadow-[0_0_0_4px_var(--color-card)] ${settled ? "rail-idle-pulse" : ""}`}
          />
          <div className="absolute top-5 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-badge-text">
            YOU {formatNumber(guess)}
          </div>
        </motion.div>

        {/* ANSWER pin - lands once the beam arrives */}
        <motion.div
          data-testid="answer-pin"
          className="absolute"
          style={{ left: `${ap}%` }}
          initial={reduced ? { scale: 1 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={answerTransition}
          onAnimationComplete={() => setSettled(true)}
        >
          {!reduced && (
            <motion.span
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-signal"
              initial={{ opacity: 0.6, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.4 }}
              transition={{
                duration: 0.5,
                delay: TRAVEL_DELAY + TRAVEL_DURATION,
                ease: "easeOut",
              }}
            />
          )}
          <div
            className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-ink ${settled ? "rail-idle-pulse" : ""}`}
          />
          <div className="absolute -top-7 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-ink">
            ANSWER {formatNumber(answer)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function OddsRail(props: { guess: number; answer: number }) {
  return USE_CHOREO_RAIL ? (
    <ChoreoOddsRail {...props} />
  ) : (
    <ClassicOddsRail {...props} />
  );
}
