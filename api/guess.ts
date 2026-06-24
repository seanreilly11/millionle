import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase'
import { answerForDate } from './_lib/answer'
import { dateFromOffset, puzzleNumber } from './_lib/date'
import { tier } from './_lib/score'
import { computeStats } from './_lib/stats'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, guess, offset } = req.body as { uuid: string; guess: number; offset: number }
  if (typeof uuid !== 'string' || !uuid || typeof guess !== 'number' || typeof offset !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const date = dateFromOffset(offset)
  const answer = answerForDate(date)
  const distance = Math.abs(guess - answer)

  // Check if already played
  const { data: existing } = await supabase
    .from('plays')
    .select('distance')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

  const alreadyPlayed = existing !== null
  const finalDistance = alreadyPlayed ? existing.distance : distance

  if (!alreadyPlayed) {
    await getSupabase().from('plays').insert({ uuid, date, guess, distance })
  }

  // Rank: count of plays with strictly lower distance today
  const { count: betterCount } = await supabase
    .from('plays')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .lt('distance', finalDistance)

  const rank = (betterCount ?? 0) + 1

  // Stats: all plays for this uuid
  const { data: allPlays } = await supabase
    .from('plays')
    .select('date, distance')
    .eq('uuid', uuid)
    .order('date')

  const stats = computeStats(allPlays ?? [], date)

  // hasJoined: name exists for uuid + date
  const { data: nameRow } = await supabase
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
