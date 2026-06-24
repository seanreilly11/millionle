// @vitest-environment node
import { computeStats } from '../_lib/stats'

const TODAY = '2026-06-24'

test('empty rows returns zeros', () => {
  const s = computeStats([], TODAY)
  expect(s).toEqual({ streak: 0, longestStreak: 0, closestEver: 0, totalPlays: 0, averageDistance: 0 })
})

test('3 consecutive days ending today', () => {
  const rows = [
    { date: '2026-06-22', distance: 100 },
    { date: '2026-06-23', distance: 50 },
    { date: '2026-06-24', distance: 10 },
  ]
  const s = computeStats(rows, TODAY)
  expect(s.streak).toBe(3)
  expect(s.longestStreak).toBe(3)
  expect(s.closestEver).toBe(10)
  expect(s.totalPlays).toBe(3)
  expect(s.averageDistance).toBeCloseTo(160 / 3)
})

test('streak breaks on gap, longestStreak remembers prior run', () => {
  const rows = [
    { date: '2026-06-20', distance: 100 },
    { date: '2026-06-21', distance: 200 },
    { date: '2026-06-24', distance: 10 },
  ]
  const s = computeStats(rows, TODAY)
  expect(s.streak).toBe(1)
  expect(s.longestStreak).toBe(2)
})

test('streak is 0 if not played today', () => {
  const rows = [
    { date: '2026-06-22', distance: 100 },
    { date: '2026-06-23', distance: 50 },
  ]
  const s = computeStats(rows, TODAY)
  expect(s.streak).toBe(0)
  expect(s.longestStreak).toBe(2)
})

test('single play', () => {
  const rows = [{ date: TODAY, distance: 500 }]
  const s = computeStats(rows, TODAY)
  expect(s.streak).toBe(1)
  expect(s.longestStreak).toBe(1)
  expect(s.totalPlays).toBe(1)
  expect(s.averageDistance).toBe(500)
})
