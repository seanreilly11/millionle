import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { prefersReducedMotion, BOUNCY } from "../lib/motion";

const CONFETTI_DELAY_MS = 150; // let the win-number pop-in land before the burst starts

export function WinCelebration({ rank }: { rank: number }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    const start = setTimeout(() => {
      const end = Date.now() + 1200;
      (function frame() {
        if (cancelled) return;
        confetti({ particleCount: 5, spread: 70, origin: { y: 0.3 }, colors: ["#E8920A", "#F4602A", "#0EA896", "#0E1A22"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }, CONFETTI_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  const reduced = prefersReducedMotion();

  return (
    <>
      <div className="font-mono font-bold text-sm tracking-heading uppercase text-gold-deep text-center">
        ★ One in a million ★
      </div>
      <motion.h2
        className="win-number text-center text-win font-black leading-none my-1.5"
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : BOUNCY}
      >
        {formatNumber(1_000_000)}
      </motion.h2>
      <div className="text-center font-mono text-xs tracking-label uppercase text-gold-deep mt-2">
        Dead on
      </div>
      <div className="mt-8 mx-auto flex items-center justify-center gap-2.5 font-mono text-xs tracking-puzzle uppercase text-ink">
        <span className="text-3xl font-black text-jackpot font-num">#{rank}</span>
        <span>on today's board</span>
      </div>
    </>
  );
}
