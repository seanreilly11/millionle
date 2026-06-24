import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase'
import { answerForDate } from './_lib/answer'
import { dateFromOffset, puzzleNumber } from './_lib/date'
import { tier } from './_lib/score'
import { computeStats } from './_lib/stats'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, offset } = req.query as { uuid?: string; offset?: string }
  if (typeof uuid !== 'string' || !uuid) {
    return res.status(400).json({ error: 'Missing uuid' })
  }

  const sb = getSupabase()
  const date = dateFromOffset(offset ? Number(offset) : 0)

  const { data: play } = await sb
    .from('plays')
    .select('guess, distance')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

  if (!play) return res.status(200).json({ played: false })

  const answer = answerForDate(date)

  const { data: nameRow } = await sb
    .from('names')
    .select('name')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

  const { data: namedForRank } = await sb
    .from('names')
    .select('uuid')
    .eq('date', date)

  const namedUuidsForRank = (namedForRank ?? []).map((n) => n.uuid)

  let rank = 1
  if (namedUuidsForRank.length > 0) {
    const { count: betterCount } = await sb
      .from('plays')
      .select('*', { count: 'exact', head: true })
      .eq('date', date)
      .lt('distance', play.distance)
      .in('uuid', namedUuidsForRank)
    rank = (betterCount ?? 0) + 1
  }

  const { data: allPlays } = await sb
    .from('plays')
    .select('date, distance')
    .eq('uuid', uuid)
    .order('date')

  const stats = computeStats(allPlays ?? [], date)

  return res.status(200).json({
    played: true,
    alreadyPlayed: true,
    guess: play.guess,
    distance: play.distance,
    answer,
    rank,
    hasJoined: nameRow !== null,
    tier: tier(play.distance),
    date,
    puzzle: puzzleNumber(date),
    stats,
  })
}
