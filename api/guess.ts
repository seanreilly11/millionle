import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase.js'
import { answerForDate } from './_lib/answer.js'
import { dateFromOffset, puzzleNumber } from './_lib/date.js'
import { tier } from './_lib/score.js'
import { computeStats } from './_lib/stats.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, guess, offset } = req.body as { uuid: string; guess: number; offset: number }
  if (typeof uuid !== 'string' || !uuid || typeof guess !== 'number' || typeof offset !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const sb = getSupabase()
  const date = dateFromOffset(offset)
  const answer = answerForDate(date)
  const distance = Math.abs(guess - answer)

  // First round trip: everything that doesn't depend on another query's result.
  const [
    { data: existing },
    { data: namedForRank },
    { data: nameRow },
  ] = await Promise.all([
    sb.from('plays').select('distance').eq('uuid', uuid).eq('date', date).single(),
    sb.from('names').select('uuid').eq('date', date),
    sb.from('names').select('name').eq('uuid', uuid).eq('date', date).single(),
  ])

  const alreadyPlayed = existing !== null
  const finalDistance = alreadyPlayed ? existing.distance : distance
  const namedUuidsForRank = (namedForRank ?? []).map((n) => n.uuid)

  // Second round trip: insert (if needed) and the rank count, in parallel.
  // Safe to run together because betterCount uses `lt`, so it never matches
  // the row being inserted regardless of insert ordering.
  const [, betterCountResult] = await Promise.all([
    alreadyPlayed ? null : sb.from('plays').insert({ uuid, date, guess, distance }),
    namedUuidsForRank.length > 0
      ? sb
          .from('plays')
          .select('*', { count: 'exact', head: true })
          .eq('date', date)
          .lt('distance', finalDistance)
          .in('uuid', namedUuidsForRank)
      : null,
  ])

  const rank = namedUuidsForRank.length > 0 ? (betterCountResult?.count ?? 0) + 1 : 1

  // Third round trip: re-fetch now that the insert above has landed.
  const { data: allPlays } = await sb
    .from('plays')
    .select('date, distance')
    .eq('uuid', uuid)
    .order('date')

  const stats = computeStats(allPlays ?? [], date)

  return res.status(200).json({
    distance: finalDistance,
    answer,
    rank,
    alreadyPlayed,
    hasJoined: nameRow !== null,
    tier: tier(finalDistance),
    date,
    puzzle: puzzleNumber(date),
    stats,
  })
}
