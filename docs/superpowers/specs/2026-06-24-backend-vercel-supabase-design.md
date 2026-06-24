# Backend Design: Vercel Functions + Supabase

## Context

Millionle runs entirely client-side today — the answer is derived from a seeded PRNG, guesses live in `localStorage`, and the leaderboard is synthetic (generated opponents). This design replaces the mock API with a real backend to enable persistent cross-device history and genuine player rankings.

The frontend already abstracts all API calls behind a `GameApi` interface (`src/api/types.ts`). The swap is a single line in `src/api/client.ts`.

## Architecture

- **Backend**: Vercel Serverless Functions (`api/` directory in this repo)
- **Database**: Supabase PostgreSQL
- **Frontend**: unchanged — swap `mockApi` → `httpApi` in `client.ts`

No separate repo, no separate deployment pipeline. `git push` ships everything.

## Endpoints

### POST /api/guess

Request: `{ uuid: string; guess: number; offset: number }`

Response:
```ts
{
  distance: number;
  answer: number;
  rank: number;
  alreadyPlayed: boolean;
  hasJoined: boolean;
  tier: string;
  date: string;        // YYYY-MM-DD derived from offset
  puzzle: number;
  stats: {
    streak: number;
    longestStreak: number;
    closestEver: number;
    totalPlays: number;
    averageDistance: number;
  }
}
```

Behaviour:
- `offset` = `-new Date().getTimezoneOffset()` from the browser (minutes east of UTC). Server applies it to its UTC clock to derive the player's local `date` (YYYY-MM-DD), matching `src/engine/date.ts` `localDate()` logic
- Derive `answer` using replicated PRNG (`src/engine/prng.ts` + `src/engine/answer.ts`)
- `puzzle` = days elapsed since `MILLIONLE.launch` date (from `src/game.config.ts`), matching `src/engine/date.ts` `puzzleNumber()`
- `INSERT INTO plays ON CONFLICT DO NOTHING` — idempotent, second call returns `alreadyPlayed: true`
- `rank` = 1 + count of plays rows WHERE date = derived_date AND distance **strictly less than** mine
- `tier` from score thresholds (replicate `src/engine/score.ts`)
- `stats` computed from all plays rows for this uuid
- `hasJoined` = row exists in `names` for uuid + date

### POST /api/name

Request: `{ uuid: string; name: string; offset: number }`

Response: `{ ok: true; rank: number }`

Behaviour:
- Derive date from offset (same logic as `/api/guess`)
- `INSERT INTO names ON CONFLICT DO NOTHING`
- Return current rank for uuid on that date (rank among named players)

### GET /api/leaderboard

Query params: `uuid`, `offset`, optional `date`

Response:
```ts
{
  date: string;
  entries: { rank: number; name: string; distance: number; isMe: boolean }[];
  myRank: number | null;
}
```

Behaviour:
- Only named players appear (join plays + names on uuid + date)
- Top 10 entries sorted by distance ascending
- If player rank > 10, append their row as entry 11
- `isMe` = entry uuid matches request uuid
- `myRank` = null if player has not submitted a name (not on the named leaderboard)

## Database Schema

```sql
CREATE TABLE plays (
  uuid      TEXT    NOT NULL,
  date      TEXT    NOT NULL,  -- YYYY-MM-DD
  guess     INTEGER NOT NULL,
  distance  INTEGER NOT NULL,
  PRIMARY KEY (uuid, date)
);

CREATE TABLE names (
  uuid  TEXT NOT NULL,
  date  TEXT NOT NULL,
  name  TEXT NOT NULL,
  PRIMARY KEY (uuid, date)
);

-- rank query: date + distance filter
CREATE INDEX idx_plays_date_distance ON plays (date, distance);

-- stats query: all rows per player
CREATE INDEX idx_plays_uuid ON plays (uuid);
```

No RLS. Vercel functions call Supabase with the service key server-side only — never exposed to the browser.

## Answer Derivation

Replicate `src/engine/prng.ts` (xmur3 + mulberry32) and `src/engine/answer.ts` inside the Vercel function. Seed: `"millionle:YYYY-MM-DD"`. Range: 1–1,000,000. No DB column needed — answer is always derivable from date alone.

## Stats Computation

Query all plays rows for a uuid ordered by date. Apply same logic as `src/engine/stats.ts`:

| Field | Computation |
|-------|-------------|
| `streak` | Consecutive days ending today, counting backward |
| `longestStreak` | Max consecutive-day run across all history |
| `closestEver` | `MIN(distance)` |
| `totalPlays` | Count of rows |
| `averageDistance` | `AVG(distance)` |

## Ranking

Lowest distance wins. `rank` = 1 + count of rows WHERE date = X AND distance < mine.

## localStorage

| Key | Action | Reason |
|-----|--------|--------|
| `millionle.uuid` | **Keep** | Player identity — sent in every API request |
| `millionle.name` | **Keep as UX cache** | Pre-fills name input; server (`names` table) is authoritative |
| `millionle.history` | **Keep as startup cache** | Used on load to decide idle vs result screen without a server round-trip; `appendHistory()` still called after a successful guess; stats computation removed (server owns that) |
| `millionle.named.${date}` | **Delete** | Mock-only key; server returns `hasJoined` in `/guess` response |

Existing localStorage data is not migrated — pre-development, players start fresh on the server.

## Frontend Changes

1. `src/api/types.ts` — expand `stats` type to add `longestStreak`, `totalPlays`, `averageDistance`
2. `src/api/client.ts` — implement `httpApi`, swap `return mockApi` → `return httpApi`
3. `src/store/history.ts` — remove stats computation usage; keep `appendHistory` + `findByDate` for startup cache
4. `src/api/mockApi.ts` — remove `millionle.named.${date}` localStorage reads/writes

## Verification

1. Create tables in Supabase dashboard (SQL editor)
2. Add `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` to Vercel env vars and local `.env`
3. `npm run dev` — Vercel CLI serves `api/` functions alongside Vite
4. POST `/api/guess` — check response shape; call twice, confirm `alreadyPlayed: true` on second
5. POST `/api/name` — confirm player appears on leaderboard
6. GET `/api/leaderboard` — confirm top 10 + player-append logic
7. Deploy to Vercel preview branch, repeat checks against live Supabase
