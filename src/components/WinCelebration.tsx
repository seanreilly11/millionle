import { useEffect } from "react";
import confetti from "canvas-confetti";
import { formatNumber } from "../engine/format";

const prefersReduced = () =>
  typeof matchMedia === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WinCelebration({ rank }: { rank: number }) {
  useEffect(() => {
    if (prefersReduced()) return;
    const end = Date.now() + 1200;
    (function frame() {
      confetti({ particleCount: 5, spread: 70, origin: { y: 0.3 }, colors: ["#E8920A", "#F4602A", "#0EA896", "#0E1A22"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <>
      <div className="font-mono font-bold text-sm tracking-heading uppercase text-gold-deep text-center">
        ★ One in a million ★
      </div>
      <div className="win-number text-center text-win font-black leading-none my-1.5">
        {formatNumber(1_000_000)}
      </div>
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
