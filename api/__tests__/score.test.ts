// @vitest-environment node
import { tier } from '../_lib/score'

test('dead-on at distance 0', () => expect(tier(0)).toBe('dead-on'))
test('within5 at distance 5', () => expect(tier(5)).toBe('within5'))
test('within5 at distance 1', () => expect(tier(1)).toBe('within5'))
test('within100 at distance 6', () => expect(tier(6)).toBe('within100'))
test('within100 at distance 100', () => expect(tier(100)).toBe('within100'))
test('within2500 at distance 101', () => expect(tier(101)).toBe('within2500'))
test('within2500 at distance 2500', () => expect(tier(2500)).toBe('within2500'))
test('within50k at distance 2501', () => expect(tier(2501)).toBe('within50k'))
test('within50k at distance 50000', () => expect(tier(50000)).toBe('within50k'))
test('within250k at distance 50001', () => expect(tier(50001)).toBe('within250k'))
test('within250k at distance 250000', () => expect(tier(250000)).toBe('within250k'))
test('beyond at distance 250001', () => expect(tier(250001)).toBe('beyond'))
test('beyond at distance 999999', () => expect(tier(999999)).toBe('beyond'))
