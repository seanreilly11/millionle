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
      <div className="glow-head">★ One in a million ★</div>
      <div className="winnum">{formatNumber(1_000_000)}</div>
      <div className="winsub">Dead on · perfect score</div>
      <div className="rank1"><span className="hash">#{rank}</span><span>on today's board</span></div>
    </>
  );
}
