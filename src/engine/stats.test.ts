import { describe, expect, it, test } from "vitest";
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

describe('computeStats extended fields', () => {
  it('returns longestStreak, totalPlays, averageDistance', () => {
    const rows = [
      { date: '2026-06-22', distance: 100 },
      { date: '2026-06-23', distance: 50 },
      { date: '2026-06-24', distance: 10 },
    ]
    const s = computeStats(rows, '2026-06-24')
    expect(s.longestStreak).toBe(3)
    expect(s.totalPlays).toBe(3)
    expect(s.averageDistance).toBeCloseTo(160 / 3)
  })

  it('longestStreak is independent of current streak', () => {
    const rows = [
      { date: '2026-06-20', distance: 100 },
      { date: '2026-06-21', distance: 200 },
      { date: '2026-06-24', distance: 10 },
    ]
    const s = computeStats(rows, '2026-06-24')
    expect(s.streak).toBe(1)
    expect(s.longestStreak).toBe(2)
  })
})
