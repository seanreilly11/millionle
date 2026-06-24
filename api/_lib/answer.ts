import { seededRandom } from './prng.js'

const GAME_NAME = 'millionle'
const MIN = 1
const MAX = 1_000_000

export function answerForDate(dateISO: string): number {
  const rand = seededRandom(`${GAME_NAME}:${dateISO}`)
  return MIN + Math.floor(rand() * (MAX - MIN + 1))
}
