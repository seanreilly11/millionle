// @vitest-environment node
import { answerForDate } from '../_lib/answer'
import { answerForDate as clientAnswerForDate } from '../../src/engine/answer'
import { MILLIONLE } from '../../src/game.config'

test('server and client produce identical answer for same date', () => {
  expect(answerForDate('2026-06-24')).toBe(clientAnswerForDate(MILLIONLE, '2026-06-24'))
})

test('different dates produce different answers', () => {
  expect(answerForDate('2026-06-24')).not.toBe(answerForDate('2026-06-25'))
})

test('answer is within game range 1–1,000,000', () => {
  const a = answerForDate('2026-06-24')
  expect(a).toBeGreaterThanOrEqual(1)
  expect(a).toBeLessThanOrEqual(1_000_000)
})
