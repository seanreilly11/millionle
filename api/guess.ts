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

  // Check if already played
  const { data: existing } = await sb
    .from('plays')
    .select('distance')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

  const alreadyPlayed = existing !== null
  const finalDistance = alreadyPlayed ? existing.distance : distance

  if (!alreadyPlayed) {
    await sb.from('plays').insert({ uuid, date, guess, distance })
  }

  // Rank: position among named players only
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
      .lt('distance', finalDistance)
      .in('uuid', namedUuidsForRank)
    rank = (betterCount ?? 0) + 1
  }

  // Stats: all plays for this uuid
  const { data: allPlays } = await sb
    .from('plays')
    .select('date, distance')
    .eq('uuid', uuid)
    .order('date')

  const stats = computeStats(allPlays ?? [], date)

  // hasJoined: name exists for uuid + date
  const { data: nameRow } = await sb
    .from('names')
    .select('name')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

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
