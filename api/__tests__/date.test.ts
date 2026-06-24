// @vitest-environment node
import { dateFromOffset, addDays, puzzleNumber } from '../_lib/date'

test('dateFromOffset UTC+0 returns current UTC date', () => {
  const result = dateFromOffset(0)
  const expected = new Date().toISOString().slice(0, 10)
  expect(result).toBe(expected)
})

test('dateFromOffset UTC+60 advances into next day at midnight UTC', () => {
  const midnightUTC = new Date('2026-06-24T00:00:00Z')
  expect(dateFromOffset(60, midnightUTC)).toBe('2026-06-24')
  expect(dateFromOffset(0, midnightUTC)).toBe('2026-06-24')
})

test('dateFromOffset UTC-60 falls back to previous day at midnight UTC', () => {
  const midnightUTC = new Date('2026-06-24T00:00:00Z')
  expect(dateFromOffset(-60, midnightUTC)).toBe('2026-06-23')
})

test('addDays adds positive days', () => {
  expect(addDays('2026-06-24', 1)).toBe('2026-06-25')
  expect(addDays('2026-06-24', 7)).toBe('2026-07-01')
})

test('addDays subtracts negative days', () => {
  expect(addDays('2026-06-24', -1)).toBe('2026-06-23')
})

test('puzzleNumber for launch date is 1', () => {
  expect(puzzleNumber('2026-06-23')).toBe(1)
})

test('puzzleNumber for day after launch is 2', () => {
  expect(puzzleNumber('2026-06-24')).toBe(2)
})
