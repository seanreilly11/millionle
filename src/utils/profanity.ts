// Basic profanity check — covers common substitutions (1→i, 3→e, 0→o, @→a, $→s)
const normalize = (s: string) =>
  s.toLowerCase().replace(/1/g, "i").replace(/3/g, "e").replace(/0/g, "o").replace(/@/g, "a").replace(/\$/g, "s");

const BLOCKED = [
  "fuck", "shit", "cunt", "cock", "dick", "pussy", "ass", "asshole",
  "bitch", "bastard", "twat", "wank", "wanker", "prick", "bollocks",
  "nigger", "nigga", "faggot", "fag", "retard", "slut", "whore",
  "poop", "sex",
];

export function isProfane(name: string): boolean {
  const n = normalize(name);
  return BLOCKED.some((w) => n.includes(w));
}
