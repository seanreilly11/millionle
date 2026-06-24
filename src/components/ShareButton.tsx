import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatNumber } from "../engine/format";

export function ShareButton({ puzzle, guess, distance }: { puzzle: number; guess: number; distance: number }) {
  const [copied, setCopied] = useState(false);
  const line = `MILLIONLE No.${puzzle} — ${formatNumber(guess)} → off by ${formatNumber(distance)}`;

  function handleCopy() {
    navigator.clipboard?.writeText(line).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="relative mt-3.5">
      <AnimatePresence>
        {copied && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 bg-ink text-white text-xs font-mono px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="w-full border-2 border-line2 bg-transparent text-ink rounded-xl py-3.5 font-num font-bold text-sm"
        onClick={handleCopy}
      >
        Share result
      </button>
    </div>
  );
}
