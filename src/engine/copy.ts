import { formatNumber } from "./format";
import { SITE_URL_SHORT } from "../game.config";

interface CopyTier {
  id: string;
  label: string;
  max: number;
  emoji: string[];
  inGame: string[];
  share: string[];
}

export const millionleCopy = {
  url: SITE_URL_SHORT,

  // Share output shape:  `MILLIONLE No.{n}\n{emoji} {line}\n{url}`
  template: "MILLIONLE No.{n}\n{emoji} {line}\n{url}",

  tiers: [
    {
      id: "win",
      label: "One in a million",
      max: 0,
      emoji: ["🎯", "🎰", "🤯", "🏆"],
      inGame: [
        "ONE IN A MILLION.",
        "You actually did it.",
        "Perfect. Literally perfect.",
      ],
      share: [
        "I GUESSED IT. The exact number, one in a million, on one try. Good luck beating that.",
        "I just won. Nailed it on a single guess. This will never happen again - beat that (you can't):",
        "One guess. One in a million. I got it. Retiring as champion.",
      ],
    },
    {
      id: "agonising",
      label: "Agonising",
      max: 9,
      emoji: ["😭", "😫", "💔"],
      inGame: [
        "Off by {d}. Agonising.",
        "{d} away. {d}!!",
        "So close it physically hurt.",
      ],
      share: [
        "Off by {d}. As in {d}. Out of a MILLION. I'm not okay.",
        "{d} away. OUT OF A MILLION. I'm sick about it. Beat that:",
        "{d} off. That's how close I came to winning the literal lottery. Your turn:",
      ],
    },
    {
      id: "soClose",
      label: "So close",
      max: 99,
      emoji: ["😖", "😣", "🥲"],
      inGame: ["So close.", "Off by {d} - within a hair.", "Achingly close."],
      share: [
        "Off by {d}. Out of a MILLION. I was THIS close. One guess - beat that?",
        "{d} away. I'll never be that close again. Try it:",
      ],
    },
    {
      id: "reallyClose",
      label: "Really close",
      max: 999,
      emoji: ["😣", "👀", "🤏"],
      inGame: ["Really close.", "Right neighbourhood.", "Off by {d}."],
      share: [
        "Off by {d} out of a million. Honestly proud of that. Can you beat it?",
        "{d} away. Frustratingly close. Beat it:",
      ],
    },
    {
      id: "ballpark",
      label: "In the ballpark",
      max: 9999,
      emoji: ["👀", "🎯", "🙂"],
      inGame: ["In the ballpark.", "Not bad at all.", "Close-ish."],
      share: [
        "Off by {d}. In the ballpark for once. Think you can get closer?",
        "{d} away. Respectable. Beat it if you can:",
        "Only {d} off a million-to-one. I'll take it. You?",
      ],
    },
    {
      id: "warmer",
      label: "Dialed in",
      max: 24999,
      emoji: ["🔥", "😅", "♨️"],
      inGame: ["Getting warmer.", "Warm-ish.", "On the board."],
      share: [
        "Off by {d}. Close, but no cigar. Beat that?",
        "{d} away. Closer than I deserved. Your turn:",
        "{d} off. Closer than most. Can you do better?",
      ],
    },
    {
      id: "warm",
      label: "Solid read",
      max: 49999,
      emoji: ["🔥", "😅", "♨️"],
      inGame: ["Getting warmer.", "Warm-ish.", "On the board."],
      share: [
        "Off by {d}. Close, but no cigar. Beat that?",
        "{d} away. Closer than I deserved. Your turn:",
        "{d} off. Closer than most. Can you do better?",
      ],
    },
    {
      id: "lukewarm",
      label: "Lukewarm",
      max: 149999,
      emoji: ["😬", "🌡️", "😶"],
      inGame: ["Could be worse.", "Middling.", "I'll take it."],
      share: [
        "Off by {d}. Could be worse. Could be a lot better. Your turn:",
        "Off by {d}. Eh. I'll take it. Beat it?",
        "{d} away. Not my best, not my worst. Can you do better?",
      ],
    },
    {
      id: "cold",
      label: "Cold",
      max: 349999,
      emoji: ["❄️", "🥶", "🧊"],
      inGame: ["Cold.", "Not today.", "Way off, but I've seen worse."],
      share: [
        "Off by {d}. Stone cold. I didn't get it (obviously). Can you?",
        "{d} away. Not even warm. One guess, good luck:",
      ],
    },
    {
      id: "average",
      label: "Perfectly average",
      max: 499999,
      emoji: ["😐", "🫠", "🤷", "⚖️", "📊"],
      inGame: [
        "Peak average.",
        "Statistically unremarkable.",
        "Aggressively fine.",
        "Dead average.",
      ],
      share: [
        "Off by {d}. I have achieved peak mediocrity. Statistically impossible to be more average.",
        "Off by {d}. I thought about it. I really thought about it. This is what I came up with.",
        "Off by {d}. A child could beat this. Genuinely. Prove it:",
        'Off by {d}. I gave it everything and the universe said "meh." Beat me:',
        "{d} off out of a million. Aggressively forgettable. Go do better:",
      ],
    },
    {
      id: "whiffed",
      label: "You whiffed",
      max: 699999,
      emoji: ["🫠", "😵‍💫", "🙃", "📉", "🥴"],
      inGame: [
        "You whiffed.",
        "A swing and a miss.",
        "Confidently wrong.",
        "Not your finest.",
      ],
      share: [
        "Off by {d}. I committed to that guess with my whole chest. Mistakes were made.",
        "{d} away. More than half a million off. I had ONE job. Beat that:",
        "Off by {d}. I didn't just miss, I missed with conviction. Bet you can't do worse:",
        "Off by {d}. This is what overthinking gets you. One guess, show me how:",
      ],
    },
    {
      id: "lostInSpace",
      label: "Lost in space",
      max: 849999,
      emoji: ["🛰️", "🌌", "🚀"],
      inGame: ["Lost in space.", "Different planet.", "Wildly off."],
      share: [
        "Off by {d}. Wasn't even in the right hemisphere. Can you do worse?",
        "{d} away. I was playing a different game entirely.",
      ],
    },
    {
      id: "catastrophic",
      label: "Catastrophic",
      max: Infinity,
      emoji: ["💀", "☠️", "🤡"],
      inGame: [
        "How did you even manage that?",
        "Catastrophic.",
        "A genuinely impressive failure.",
      ],
      share: [
        "Off by {d}. How do you even MANAGE that? A million options and I found the worst one.",
        "{d} away. I'd have done better guessing with my eyes shut. Beat my incompetence:",
        "Off by {d}. I'd have to TRY to be this wrong - and I didn't even try.",
        "Off by {d}. That's not a guess, it's a cry for help. Can you embarrass yourself less?",
      ],
    },
  ] as CopyTier[],
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function getTier(distance: number): CopyTier {
  return (
    millionleCopy.tiers.find((t) => distance <= t.max) ??
    millionleCopy.tiers.at(-1)!
  );
}

export function inGameLine(distance: number): string {
  return pick(getTier(distance).inGame).replaceAll(
    "{d}",
    formatNumber(distance),
  );
}

export function buildShare(distance: number, puzzleNo: number): string {
  const t = getTier(distance);
  const line = pick(t.share).replaceAll("{d}", formatNumber(distance));
  return millionleCopy.template
    .replaceAll("{n}", String(puzzleNo))
    .replace("{emoji}", pick(t.emoji))
    .replace("{line}", line)
    .replace("{url}", millionleCopy.url);
}
