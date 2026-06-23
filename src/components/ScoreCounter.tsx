import { useEffect, useState } from "react";
import { animate } from "motion";
import { formatNumber } from "../engine/format";

const prefersReduced = () =>
  typeof matchMedia === "undefined" ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScoreCounter({
  value,
  className = "score",
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(prefersReduced() ? value : 0);

  useEffect(() => {
    if (prefersReduced()) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <div className={className}>{formatNumber(shown)}</div>;
}
