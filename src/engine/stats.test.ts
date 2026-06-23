import { describe, expect, test } from "vitest";
import { computeStats, type GuessRow } from "./stats";

const rows: GuessRow[] = [
  { date: "2026-06-21", distance: 5000, score: 995000 },
  { date: "2026-06-22", distance: 312, score: 999688 },
  { date: "2026-06-23", distance: 47231, score: 952769 },
];

describe("computeStats", () => {
  test("lifetime points = sum of score", () => {
    expect(computeStats(rows, "2026-06-23").lifetimePoints).toBe(995000 + 999688 + 952769);
  });
  test("closest ever = min distance", () => {
    expect(computeStats(rows, "2026-06-23").closestEver).toBe(312);
  });
  test("streak counts consecutive dates ending today", () => {
    expect(computeStats(rows, "2026-06-23").streak).toBe(3);
  });
  test("streak breaks on a skipped date", () => {
    const gap: GuessRow[] = [
      { date: "2026-06-20", distance: 10, score: 999990 },
      { date: "2026-06-22", distance: 10, score: 999990 },
      { date: "2026-06-23", distance: 10, score: 999990 },
    ];
    expect(computeStats(gap, "2026-06-23").streak).toBe(2);
  });
});
