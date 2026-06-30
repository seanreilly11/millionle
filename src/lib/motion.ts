export const prefersReducedMotion = () =>
  typeof matchMedia === "undefined" ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SNAPPY = { duration: 0.18, ease: "easeOut" } as const;
export const BOUNCY = { type: "spring", stiffness: 320, damping: 20 } as const;
export const STAGGER_MS = 90;
