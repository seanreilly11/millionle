import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "./_lib/supabase.js";
import { dateFromOffset, puzzleNumber } from "./_lib/date.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { uuid, offset, event, properties } = req.body as {
    uuid: string;
    offset: number;
    event: string;
    properties?: Record<string, unknown>;
  };

  if (
    typeof uuid !== "string" ||
    !uuid ||
    typeof offset !== "number" ||
    typeof event !== "string" ||
    !event
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const date = dateFromOffset(offset);
  const puzzle = puzzleNumber(date);

  await getSupabase()
    .from("events")
    .insert({ uuid, event, date, puzzle, properties: properties ?? {} });

  return res.status(200).json({ ok: true });
}
