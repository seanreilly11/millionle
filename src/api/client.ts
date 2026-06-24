import type { GameApi, GuessRequest, NameRequest, LeaderboardRequest, ResultRequest } from './types'
import { mockApi } from './mockApi'

const httpApi: GameApi = {
  async guess(req: GuessRequest) {
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`/api/guess failed: ${res.status}`)
    return res.json()
  },

  async submitName(req: NameRequest) {
    const res = await fetch('/api/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`/api/name failed: ${res.status}`)
    return res.json()
  },

  async leaderboard(req: LeaderboardRequest) {
    const params = new URLSearchParams()
    if (req.uuid) params.set('uuid', req.uuid)
    if (req.offset !== undefined) params.set('offset', String(req.offset))
    if (req.date) params.set('date', req.date)
    const res = await fetch(`/api/leaderboard?${params}`)
    if (!res.ok) throw new Error(`/api/leaderboard failed: ${res.status}`)
    return res.json()
  },

  async result(req: ResultRequest) {
    const params = new URLSearchParams({ uuid: req.uuid, offset: String(req.offset) })
    const res = await fetch(`/api/result?${params}`)
    if (!res.ok) throw new Error(`/api/result failed: ${res.status}`)
    return res.json()
  },
}

export function getApi(): GameApi {
  return httpApi
}

export { mockApi }
