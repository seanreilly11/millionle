import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from './_lib/supabase'
import { dateFromOffset } from './_lib/date'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, offset, date: dateParam } = req.query as {
    uuid?: string
    offset?: string
    date?: string
  }

  const date = dateParam ?? dateFromOffset(offset ? Number(offset) : 0)

  // Get all names for this date
  const { data: names } = await supabase
    .from('names')
    .select('uuid, name')
    .eq('date', date)

  if (!names || names.length === 0) {
    return res.status(200).json({ date, entries: [], myRank: null })
  }

  const namedUuids = names.map((n) => n.uuid)

  // Get plays for named players, sorted by distance ascending
  const { data: plays } = await supabase
    .from('plays')
    .select('uuid, distance')
    .eq('date', date)
    .in('uuid', namedUuids)
    .order('distance', { ascending: true })

  if (!plays) return res.status(200).json({ date, entries: [], myRank: null })

  // Build ranked entries (handle ties: same distance = same rank)
  const nameMap = new Map(names.map((n) => [n.uuid, n.name]))
  let myRank: number | null = null
  let rank = 1

  const allRanked = plays.map((p, i) => {
    if (i > 0 && p.distance > plays[i - 1].distance) rank = i + 1
    const entry = {
      rank,
      name: nameMap.get(p.uuid) ?? 'unknown',
      distance: p.distance,
      isMe: p.uuid === uuid,
    }
    if (p.uuid === uuid) myRank = rank
    return entry
  })

  const top10 = allRanked.slice(0, 10)
  const myEntry = myRank !== null && myRank > 10
    ? allRanked.find((e) => e.isMe) ?? null
    : null

  const entries = myEntry ? [...top10, myEntry] : top10

  return res.status(200).json({ date, entries, myRank })
}
