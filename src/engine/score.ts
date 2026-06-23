export type TierId =
  | "dead-on" | "within5" | "within100" | "within2500"
  | "within50k" | "within250k" | "beyond";

export interface Tier { id: TierId; label: string; copy: string; }

export function distance(guess: number, answer: number): number {
  return Math.abs(guess - answer);
}

export function score(guess: number, answer: number, max = 1_000_000): number {
  return max - distance(guess, answer);
}

const LADDER: { max: number; tier: Tier }[] = [
  { max: 0,        tier: { id: "dead-on",    label: "Dead on",       copy: "One in a million." } },
  { max: 5,        tier: { id: "within5",    label: "Within 5",      copy: "Breathtaking."    } },
  { max: 100,      tier: { id: "within100",  label: "Within 100",    copy: "Razor close."     } },
  { max: 2500,     tier: { id: "within2500", label: "Within 2,500",  copy: "Dialed in."       } },
  { max: 50000,    tier: { id: "within50k",  label: "Within 50k",    copy: "Solid read."      } },
  { max: 250000,   tier: { id: "within250k", label: "Within 250k",   copy: "In the zone."     } },
  { max: Infinity, tier: { id: "beyond",     label: "Off the mark",  copy: "Not today."       } },
];

export function tier(d: number): Tier {
  return LADDER.find((t) => d <= t.max)!.tier;
}
