import { describe, expect, test } from "vitest";
import { computeStats, type GuessRow } from "./stats";

const rows: GuessRow[] = [
  { date: "2026-06-21", distance: 5000 },
  { date: "2026-06-22", distance: 312 },
  { date: "2026-06-23", distance: 47231 },
];

describe("computeStats", () => {
  test("closest ever = min distance", () => {
    expect(computeStats(rows, "2026-06-23").closestEver).toBe(312);
  });
  test("streak counts consecutive dates ending today", () => {
    expect(computeStats(rows, "2026-06-23").streak).toBe(3);
  });
  test("streak breaks on a skipped date", () => {
    const gap: GuessRow[] = [
      { date: "2026-06-20", distance: 10 },
      { date: "2026-06-22", distance: 10 },
      { date: "2026-06-23", distance: 10 },
    ];
    expect(computeStats(gap, "2026-06-23").streak).toBe(2);
  });
});
