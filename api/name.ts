import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase'
import { dateFromOffset } from './_lib/date'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, name, offset } = req.body as { uuid: string; name: string; offset: number }
  if (typeof uuid !== 'string' || !uuid || typeof name !== 'string' || !name || typeof offset !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const date = dateFromOffset(offset)

  // Idempotent: ignore if name already exists for this uuid+date
  await getSupabase()
    .from('names')
    .upsert({ uuid, date, name }, { onConflict: 'uuid,date', ignoreDuplicates: true })

  // Rank among named players for this date
  const { data: myPlay } = await getSupabase()
    .from('plays')
    .select('distance')
    .eq('uuid', uuid)
    .eq('date', date)
    .single()

  if (!myPlay) return res.status(400).json({ error: 'No play found for this date' })

  // Count named players with strictly lower distance
  const { data: namedPlays } = await getSupabase()
    .from('names')
    .select('uuid')
    .eq('date', date)

  const namedUuids = (namedPlays ?? []).map((n) => n.uuid)

  const { count: betterCount } = await getSupabase()
    .from('plays')
    .select('*', { count: 'exact', head: true })
    .eq('date', date)
    .lt('distance', myPlay.distance)
    .in('uuid', namedUuids)

  return res.status(200).json({ ok: true, rank: (betterCount ?? 0) + 1 })
}
