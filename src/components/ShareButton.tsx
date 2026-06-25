import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { tier } from "../engine/score";
import { trackEvent } from "../api/trackEvent";

const SITE_URL = "https://www.millionle.com";

const TIER_EMOJI: Record<string, string> = {
  "dead-on": "🎯",
  within5: "🔥",
  within100: "⚡",
  within2500: "💡",
  within50k: "📍",
  within250k: "🌡️",
  beyond: "❄️",
};

export function ShareButton({
  puzzle,
  distance,
}: {
  puzzle: number;
  guess: number;
  distance: number;
}) {
  const [copied, setCopied] = useState(false);

  const t = tier(distance);
  const emoji = TIER_EMOJI[t.id];
  const text =
    distance === 0
      ? `MILLIONLE No.${puzzle}\n${emoji} ${t.label} · ${t.copy}\n${SITE_URL}`
      : `I didn't get it :( MILLIONLE No.${puzzle}\n${emoji} ${t.label} · Off by ${formatNumber(distance)}\n${SITE_URL}`;

  async function handleShare() {
    trackEvent("share", { tier: t.id, distance });
    if (navigator.share && navigator.maxTouchPoints > 0) {
      await navigator.share({ text });
      return;
    }
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        prompt("Copy your result:", text);
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
            role="status"
            className="absolute -top-9 left-1/2 -translate-x-1/2 bg-ink text-white text-xs font-mono px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="w-full border-2 border-line2 bg-transparent text-ink rounded-xl py-3.5 font-num font-bold text-sm focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={handleShare}
      >
        Share result
      </button>
    </div>
  );
}
