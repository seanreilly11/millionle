# Backend: Vercel Functions + Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock API with three real Vercel serverless functions backed by Supabase PostgreSQL, swapping in via a single line in `src/api/client.ts`.

**Architecture:** `api/` directory in this repo holds three TypeScript handlers (`guess.ts`, `name.ts`, `leaderboard.ts`) plus a `_lib/` of pure, tested utilities. Supabase holds two tables (`plays`, `names`). The frontend calls `/api/*` endpoints - identical URLs in `vercel dev` locally and in production.

**Tech Stack:** Vercel Serverless Functions (Node.js), `@vercel/node` types, `@supabase/supabase-js`, Vitest (existing), TypeScript (existing).

**Spec:** `docs/superpowers/specs/2026-06-24-backend-vercel-supabase-design.md`

---

## File Map

| File                           | Status | Purpose                                                               |
| ------------------------------ | ------ | --------------------------------------------------------------------- |
| `api/_lib/prng.ts`             | Create | xmur3 + mulberry32 + seededRandom (exact copy of src/engine/prng.ts)  |
| `api/_lib/answer.ts`           | Create | `answerForDate(date)` - standalone, no GameConfig dep                 |
| `api/_lib/date.ts`             | Create | `dateFromOffset`, `addDays`, `puzzleNumber`                           |
| `api/_lib/score.ts`            | Create | `tier(distance)` returning TierId                                     |
| `api/_lib/stats.ts`            | Create | `computeStats(rows, today)` returning full Stats                      |
| `api/_lib/supabase.ts`         | Create | Supabase client singleton from env vars                               |
| `api/__tests__/answer.test.ts` | Create | Cross-validates server answer against client engine                   |
| `api/__tests__/date.test.ts`   | Create | Tests offset→date and puzzleNumber                                    |
| `api/__tests__/score.test.ts`  | Create | Tests all 7 tier thresholds                                           |
| `api/__tests__/stats.test.ts`  | Create | Tests streak, longestStreak, closestEver, totalPlays, averageDistance |
| `api/guess.ts`                 | Create | POST /api/guess handler                                               |
| `api/name.ts`                  | Create | POST /api/name handler                                                |
| `api/leaderboard.ts`           | Create | GET /api/leaderboard handler                                          |
| `src/engine/stats.ts`          | Modify | Expand Stats interface + computeStats with 3 new fields               |
| `src/api/client.ts`            | Modify | Add httpApi, swap return                                              |
| `src/api/mockApi.ts`           | Modify | Remove `millionle.named.${date}` localStorage                         |
| `vercel.json`                  | Create | Tell Vercel this is a Vite project                                    |
| `.env.local`                   | Create | Supabase env vars (not committed)                                     |

---

## Task 1: Install Dependencies and Configure Dev Environment

**Files:**

- Modify: `package.json`
- Create: `vercel.json`
- Create: `.env.local`

- [ ] **Step 1: Install packages**

```bash
npm install @supabase/supabase-js
npm install -D vercel @vercel/node
```

Expected: packages added to `package.json`, no errors.

- [ ] **Step 2: Add `dev:full` script to `package.json`**

In `package.json`, add to `"scripts"`:

```json
"dev:full": "vercel dev"
```

Result: `npm run dev:full` starts Vite + API functions together via Vercel CLI on `localhost:3000`. Use this instead of `npm run dev` when testing endpoints locally.

- [ ] **Step 3: Create `vercel.json`**

```json
{
  "framework": "vite"
}
```

- [ ] **Step 4: Create `.env.local`**

```
SUPABASE_URL=your-project-url-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get these from the Supabase dashboard: Settings → API. Use the **service role** key (not the anon key) - it bypasses RLS.

- [ ] **Step 5: Verify `.env.local` is gitignored**

`.env.local` should already be in `.gitignore` (Vite projects include it by default). Confirm:

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` appears. If not, add it.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vercel.json
git commit -m "chore: add vercel + supabase deps and dev:full script"
```

---

## Task 2: Create Supabase Tables

**Files:** None (SQL runs in Supabase dashboard)

- [ ] **Step 1: Open Supabase SQL editor**

Go to your Supabase project dashboard → SQL Editor → New query.

- [ ] **Step 2: Run table creation SQL**

```sql
CREATE TABLE plays (
  uuid      TEXT    NOT NULL,
  date      TEXT    NOT NULL,
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

CREATE INDEX idx_plays_date_distance ON plays (date, distance);
CREATE INDEX idx_plays_uuid ON plays (uuid);
```

- [ ] **Step 3: Verify tables exist**

In Supabase dashboard → Table Editor, confirm `plays` and `names` tables appear with the correct columns.

---

## Task 3: Expand Stats Type and Client-Side computeStats

The `Stats` interface is defined in `src/engine/stats.ts` and imported by `src/api/types.ts`. The backend will return 5 fields; the type must match.

**Files:**

- Modify: `src/engine/stats.ts`

- [ ] **Step 1: Write failing test for new Stats fields**

Add to `src/engine/score.test.ts` (or create `src/engine/stats.test.ts` if it doesn't exist):

```typescript
import { computeStats } from "./stats";

describe("computeStats extended fields", () => {
  it("returns longestStreak, totalPlays, averageDistance", () => {
    const rows = [
      { date: "2026-06-22", distance: 100 },
      { date: "2026-06-23", distance: 50 },
      { date: "2026-06-24", distance: 10 },
    ];
    const s = computeStats(rows, "2026-06-24");
    expect(s.longestStreak).toBe(3);
    expect(s.totalPlays).toBe(3);
    expect(s.averageDistance).toBeCloseTo(160 / 3);
  });

  it("longestStreak is independent of current streak", () => {
    const rows = [
      { date: "2026-06-20", distance: 100 },
      { date: "2026-06-21", distance: 200 },
      { date: "2026-06-24", distance: 10 },
    ];
    const s = computeStats(rows, "2026-06-24");
    expect(s.streak).toBe(1);
    expect(s.longestStreak).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npx vitest run src/engine/stats.test.ts
```

Expected: FAIL - `longestStreak` is `undefined`.

- [ ] **Step 3: Update `src/engine/stats.ts`**

Replace the entire file:

```typescript
import { addDays } from "./date";

export interface GuessRow {
  date: string;
  distance: number;
}
export interface Stats {
  streak: number;
  longestStreak: number;
  closestEver: number;
  totalPlays: number;
  averageDistance: number;
}

export function computeStats(rows: GuessRow[], today: string): Stats {
  if (rows.length === 0) {
    return {
      streak: 0,
      longestStreak: 0,
      closestEver: 0,
      totalPlays: 0,
      averageDistance: 0,
    };
  }

  const closestEver = Math.min(...rows.map((r) => r.distance));
  const totalPlays = rows.length;
  const averageDistance =
    rows.reduce((sum, r) => sum + r.distance, 0) / rows.length;

  const dateSet = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1].date, 1) === sorted[i].date) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  return { streak, longestStreak, closestEver, totalPlays, averageDistance };
}
```

- [ ] **Step 4: Run all tests to confirm passing**

```bash
npm test
```

Expected: all tests pass. TypeScript will enforce the new Stats shape everywhere it's used.

- [ ] **Step 5: Commit**

```bash
git add src/engine/stats.ts src/engine/stats.test.ts
git commit -m "feat: expand Stats type with longestStreak, totalPlays, averageDistance"
```

---

## Task 4: API Lib - PRNG and Answer Derivation

**Files:**

- Create: `api/_lib/prng.ts`
- Create: `api/_lib/answer.ts`
- Create: `api/__tests__/answer.test.ts`

- [ ] **Step 1: Write failing cross-validation test**

Create `api/__tests__/answer.test.ts`:

```typescript
// @vitest-environment node
import { answerForDate } from "../_lib/answer";
import { answerForDate as clientAnswerForDate } from "../../src/engine/answer";
import { MILLIONLE } from "../../src/game.config";

test("server and client produce identical answer for same date", () => {
  expect(answerForDate("2026-06-24")).toBe(
    clientAnswerForDate(MILLIONLE, "2026-06-24"),
  );
});

test("different dates produce different answers", () => {
  expect(answerForDate("2026-06-24")).not.toBe(answerForDate("2026-06-25"));
});

test("answer is within game range 1–1,000,000", () => {
  const a = answerForDate("2026-06-24");
  expect(a).toBeGreaterThanOrEqual(1);
  expect(a).toBeLessThanOrEqual(1_000_000);
});
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run api/__tests__/answer.test.ts
```

Expected: FAIL - `api/_lib/answer` not found.

- [ ] **Step 3: Create `api/_lib/prng.ts`**

Exact copy of `src/engine/prng.ts` (keeping the server lib self-contained):

```typescript
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(key: string): () => number {
  return mulberry32(xmur3(key)());
}
```

- [ ] **Step 4: Create `api/_lib/answer.ts`**

```typescript
import { seededRandom } from "./prng";

const GAME_NAME = "millionle";
const MIN = 1;
const MAX = 1_000_000;

export function answerForDate(dateISO: string): number {
  const rand = seededRandom(`${GAME_NAME}:${dateISO}`);
  return MIN + Math.floor(rand() * (MAX - MIN + 1));
}
```

- [ ] **Step 5: Run tests to confirm passing**

```bash
npx vitest run api/__tests__/answer.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add api/_lib/prng.ts api/_lib/answer.ts api/__tests__/answer.test.ts
git commit -m "feat: server-side PRNG and answer derivation"
```

---

## Task 5: API Lib - Date Utilities

**Files:**

- Create: `api/_lib/date.ts`
- Create: `api/__tests__/date.test.ts`

- [ ] **Step 1: Write failing tests**

Create `api/__tests__/date.test.ts`:

```typescript
// @vitest-environment node
import { dateFromOffset, addDays, puzzleNumber } from "../_lib/date";

test("dateFromOffset UTC+0 returns same as server UTC date", () => {
  // offset 0 = UTC time
  const result = dateFromOffset(0);
  const expected = new Date().toISOString().slice(0, 10);
  expect(result).toBe(expected);
});

test("dateFromOffset UTC+60 advances date at midnight", () => {
  // Simulate midnight UTC where UTC+1 is already next day
  const midnightUTC = new Date("2026-06-24T00:00:00Z");
  expect(dateFromOffset(60, midnightUTC)).toBe("2026-06-24");
  expect(dateFromOffset(0, midnightUTC)).toBe("2026-06-24");
});

test("dateFromOffset UTC-60 stays on previous day at midnight", () => {
  const midnightUTC = new Date("2026-06-24T00:00:00Z");
  expect(dateFromOffset(-60, midnightUTC)).toBe("2026-06-23");
});

test("addDays adds positive days", () => {
  expect(addDays("2026-06-24", 1)).toBe("2026-06-25");
  expect(addDays("2026-06-24", 7)).toBe("2026-07-01");
});

test("addDays subtracts negative days", () => {
  expect(addDays("2026-06-24", -1)).toBe("2026-06-23");
});

test("puzzleNumber for launch date is 1", () => {
  expect(puzzleNumber("2026-06-24")).toBe(2); // launch is 2026-06-23, so 2026-06-24 is puzzle 2
});
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run api/__tests__/date.test.ts
```

Expected: FAIL - module not found.

- [ ] **Step 3: Create `api/_lib/date.ts`**

The `LAUNCH_DATE` must match `src/game.config.ts` → `MILLIONLE.launch`. Current value: `"2026-06-23"`.

```typescript
const DAY = 86_400_000;
const LAUNCH_DATE = "2026-06-23"; // must match MILLIONLE.launch in src/game.config.ts

export function dateFromOffset(
  offsetMinutes: number,
  now: Date = new Date(),
): string {
  const clamped = Math.max(-720, Math.min(840, Math.round(offsetMinutes)));
  return new Date(now.getTime() + clamped * 60_000).toISOString().slice(0, 10);
}

export function addDays(dateISO: string, days: number): string {
  const t = Date.parse(dateISO + "T00:00:00Z") + days * DAY;
  return new Date(t).toISOString().slice(0, 10);
}

export function puzzleNumber(dateISO: string): number {
  const launch = Date.parse(LAUNCH_DATE + "T00:00:00Z");
  const date = Date.parse(dateISO + "T00:00:00Z");
  return Math.floor((date - launch) / DAY) + 1;
}
```

- [ ] **Step 4: Run tests to confirm passing**

```bash
npx vitest run api/__tests__/date.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/date.ts api/__tests__/date.test.ts
git commit -m "feat: server-side date utilities"
```

---

## Task 6: API Lib - Score / Tier

**Files:**

- Create: `api/_lib/score.ts`
- Create: `api/__tests__/score.test.ts`

- [ ] **Step 1: Write failing tests**

Create `api/__tests__/score.test.ts`:

```typescript
// @vitest-environment node
import { tier } from "../_lib/score";

test("dead-on at distance 0", () => expect(tier(0)).toBe("dead-on"));
test("within5 at distance 5", () => expect(tier(5)).toBe("within5"));
test("within5 at distance 1", () => expect(tier(1)).toBe("within5"));
test("within100 at distance 6", () => expect(tier(6)).toBe("within100"));
test("within100 at distance 100", () => expect(tier(100)).toBe("within100"));
test("within2500 at distance 101", () => expect(tier(101)).toBe("within2500"));
test("within2500 at distance 2500", () =>
  expect(tier(2500)).toBe("within2500"));
test("within50k at distance 2501", () => expect(tier(2501)).toBe("within50k"));
test("within50k at distance 50000", () =>
  expect(tier(50000)).toBe("within50k"));
test("within250k at distance 50001", () =>
  expect(tier(50001)).toBe("within250k"));
test("within250k at distance 250000", () =>
  expect(tier(250000)).toBe("within250k"));
test("beyond at distance 250001", () => expect(tier(250001)).toBe("beyond"));
test("beyond at distance 999999", () => expect(tier(999999)).toBe("beyond"));
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run api/__tests__/score.test.ts
```

Expected: FAIL - module not found.

- [ ] **Step 3: Create `api/_lib/score.ts`**

```typescript
export type TierId =
  | "dead-on"
  | "within5"
  | "within100"
  | "within2500"
  | "within50k"
  | "within250k"
  | "beyond";

const LADDER: { max: number; id: TierId }[] = [
  { max: 0, id: "dead-on" },
  { max: 5, id: "within5" },
  { max: 100, id: "within100" },
  { max: 2500, id: "within2500" },
  { max: 50000, id: "within50k" },
  { max: 250000, id: "within250k" },
  { max: Infinity, id: "beyond" },
];

export function tier(distance: number): TierId {
  return LADDER.find((t) => distance <= t.max)!.id;
}
```

- [ ] **Step 4: Run tests to confirm passing**

```bash
npx vitest run api/__tests__/score.test.ts
```

Expected: PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/score.ts api/__tests__/score.test.ts
git commit -m "feat: server-side tier computation"
```

---

## Task 7: API Lib - Stats Computation

**Files:**

- Create: `api/_lib/stats.ts`
- Create: `api/__tests__/stats.test.ts`

- [ ] **Step 1: Write failing tests**

Create `api/__tests__/stats.test.ts`:

```typescript
// @vitest-environment node
import { computeStats } from "../_lib/stats";

const TODAY = "2026-06-24";

test("empty rows returns zeros", () => {
  const s = computeStats([], TODAY);
  expect(s).toEqual({
    streak: 0,
    longestStreak: 0,
    closestEver: 0,
    totalPlays: 0,
    averageDistance: 0,
  });
});

test("3 consecutive days ending today", () => {
  const rows = [
    { date: "2026-06-22", distance: 100 },
    { date: "2026-06-23", distance: 50 },
    { date: "2026-06-24", distance: 10 },
  ];
  const s = computeStats(rows, TODAY);
  expect(s.streak).toBe(3);
  expect(s.longestStreak).toBe(3);
  expect(s.closestEver).toBe(10);
  expect(s.totalPlays).toBe(3);
  expect(s.averageDistance).toBeCloseTo(160 / 3);
});

test("streak breaks on gap, longestStreak remembers prior run", () => {
  const rows = [
    { date: "2026-06-20", distance: 100 },
    { date: "2026-06-21", distance: 200 },
    { date: "2026-06-24", distance: 10 },
  ];
  const s = computeStats(rows, TODAY);
  expect(s.streak).toBe(1);
  expect(s.longestStreak).toBe(2);
});

test("streak is 0 if not played today", () => {
  const rows = [
    { date: "2026-06-22", distance: 100 },
    { date: "2026-06-23", distance: 50 },
  ];
  const s = computeStats(rows, TODAY);
  expect(s.streak).toBe(0);
  expect(s.longestStreak).toBe(2);
});

test("single play", () => {
  const rows = [{ date: TODAY, distance: 500 }];
  const s = computeStats(rows, TODAY);
  expect(s.streak).toBe(1);
  expect(s.longestStreak).toBe(1);
  expect(s.totalPlays).toBe(1);
  expect(s.averageDistance).toBe(500);
});
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run api/__tests__/stats.test.ts
```

Expected: FAIL - module not found.

- [ ] **Step 3: Create `api/_lib/stats.ts`**

```typescript
import { addDays } from "./date";

export interface StatsRow {
  date: string;
  distance: number;
}

export interface Stats {
  streak: number;
  longestStreak: number;
  closestEver: number;
  totalPlays: number;
  averageDistance: number;
}

export function computeStats(rows: StatsRow[], today: string): Stats {
  if (rows.length === 0) {
    return {
      streak: 0,
      longestStreak: 0,
      closestEver: 0,
      totalPlays: 0,
      averageDistance: 0,
    };
  }

  const closestEver = Math.min(...rows.map((r) => r.distance));
  const totalPlays = rows.length;
  const averageDistance =
    rows.reduce((sum, r) => sum + r.distance, 0) / rows.length;

  const dateSet = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...rows].sort((a, b) => (a.date < b.date ? -1 : 1));
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1].date, 1) === sorted[i].date) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  return { streak, longestStreak, closestEver, totalPlays, averageDistance };
}
```

- [ ] **Step 4: Run tests to confirm passing**

```bash
npx vitest run api/__tests__/stats.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/stats.ts api/__tests__/stats.test.ts
git commit -m "feat: server-side stats computation"
```

---

## Task 8: Supabase Client

**Files:**

- Create: `api/_lib/supabase.ts`

- [ ] **Step 1: Create `api/_lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key)
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");

export const supabase = createClient(url, key);
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/supabase.ts
git commit -m "feat: Supabase client for API functions"
```

---

## Task 9: POST /api/guess

**Files:**

- Create: `api/guess.ts`

- [ ] **Step 1: Create `api/guess.ts`**

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_lib/supabase";
import { answerForDate } from "./_lib/answer";
import { dateFromOffset, puzzleNumber } from "./_lib/date";
import { tier } from "./_lib/score";
import { computeStats } from "./_lib/stats";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { uuid, guess, offset } = req.body as {
    uuid: string;
    guess: number;
    offset: number;
  };
  if (!uuid || typeof guess !== "number" || typeof offset !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const date = dateFromOffset(offset);
  const answer = answerForDate(date);
  const distance = Math.abs(guess - answer);

  // Check if already played
  const { data: existing } = await supabase
    .from("plays")
    .select("distance")
    .eq("uuid", uuid)
    .eq("date", date)
    .single();

  const alreadyPlayed = existing !== null;
  const finalDistance = alreadyPlayed ? existing.distance : distance;

  if (!alreadyPlayed) {
    await supabase.from("plays").insert({ uuid, date, guess, distance });
  }

  // Rank: count of plays with strictly lower distance today
  const { count: betterCount } = await supabase
    .from("plays")
    .select("*", { count: "exact", head: true })
    .eq("date", date)
    .lt("distance", finalDistance);

  const rank = (betterCount ?? 0) + 1;

  // Stats: all plays for this uuid
  const { data: allPlays } = await supabase
    .from("plays")
    .select("date, distance")
    .eq("uuid", uuid)
    .order("date");

  const stats = computeStats(allPlays ?? [], date);

  // hasJoined: name exists for uuid + date
  const { data: nameRow } = await supabase
    .from("names")
    .select("name")
    .eq("uuid", uuid)
    .eq("date", date)
    .single();

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
  });
}
```

- [ ] **Step 2: Start dev server and manually test**

```bash
npm run dev:full
```

Use a tool like `curl` or the Millionle app (now in `dev:full` mode at `localhost:3000`):

```bash
curl -X POST http://localhost:3000/api/guess \
  -H "Content-Type: application/json" \
  -d '{"uuid":"test-uuid-1","guess":500000,"offset":0}'
```

Expected: JSON response with `distance`, `answer`, `rank`, `alreadyPlayed: false`, `hasJoined: false`, `tier`, `date`, `puzzle`, `stats`.

- [ ] **Step 3: Test idempotency**

Run the same curl command again. Expected: same response with `alreadyPlayed: true`.

- [ ] **Step 4: Commit**

```bash
git add api/guess.ts
git commit -m "feat: POST /api/guess handler"
```

---

## Task 10: POST /api/name

**Files:**

- Create: `api/name.ts`

- [ ] **Step 1: Create `api/name.ts`**

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_lib/supabase";
import { dateFromOffset } from "./_lib/date";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { uuid, name, offset } = req.body as {
    uuid: string;
    name: string;
    offset: number;
  };
  if (!uuid || !name || typeof offset !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const date = dateFromOffset(offset);

  // Idempotent: ignore if name already exists for this uuid+date
  await supabase
    .from("names")
    .upsert(
      { uuid, date, name },
      { onConflict: "uuid,date", ignoreDuplicates: true },
    );

  // Rank among named players for this date
  const { data: myPlay } = await supabase
    .from("plays")
    .select("distance")
    .eq("uuid", uuid)
    .eq("date", date)
    .single();

  if (!myPlay)
    return res.status(400).json({ error: "No play found for this date" });

  // Count named players with strictly lower distance
  const { data: namedPlays } = await supabase
    .from("names")
    .select("uuid")
    .eq("date", date);

  const namedUuids = (namedPlays ?? []).map((n) => n.uuid);

  const { count: betterCount } = await supabase
    .from("plays")
    .select("*", { count: "exact", head: true })
    .eq("date", date)
    .lt("distance", myPlay.distance)
    .in("uuid", namedUuids);

  return res.status(200).json({ ok: true, rank: (betterCount ?? 0) + 1 });
}
```

- [ ] **Step 2: Test manually**

```bash
curl -X POST http://localhost:3000/api/name \
  -H "Content-Type: application/json" \
  -d '{"uuid":"test-uuid-1","name":"sean","offset":0}'
```

Expected: `{ "ok": true, "rank": 1 }` (only player).

- [ ] **Step 3: Commit**

```bash
git add api/name.ts
git commit -m "feat: POST /api/name handler"
```

---

## Task 11: GET /api/leaderboard

**Files:**

- Create: `api/leaderboard.ts`

- [ ] **Step 1: Create `api/leaderboard.ts`**

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "./_lib/supabase";
import { dateFromOffset } from "./_lib/date";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const {
    uuid,
    offset,
    date: dateParam,
  } = req.query as {
    uuid?: string;
    offset?: string;
    date?: string;
  };

  const date = dateParam ?? dateFromOffset(offset ? Number(offset) : 0);

  // Get all names for this date
  const { data: names } = await supabase
    .from("names")
    .select("uuid, name")
    .eq("date", date);

  if (!names || names.length === 0) {
    return res.status(200).json({ date, entries: [], myRank: null });
  }

  const namedUuids = names.map((n) => n.uuid);

  // Get plays for named players, sorted by distance ascending
  const { data: plays } = await supabase
    .from("plays")
    .select("uuid, distance")
    .eq("date", date)
    .in("uuid", namedUuids)
    .order("distance", { ascending: true });

  if (!plays) return res.status(200).json({ date, entries: [], myRank: null });

  // Build ranked entries (handle ties: same distance = same rank)
  const nameMap = new Map(names.map((n) => [n.uuid, n.name]));
  let myRank: number | null = null;
  let rank = 1;

  const allRanked = plays.map((p, i) => {
    if (i > 0 && p.distance > plays[i - 1].distance) rank = i + 1;
    const entry = {
      rank,
      name: nameMap.get(p.uuid) ?? "unknown",
      distance: p.distance,
      isMe: p.uuid === uuid,
    };
    if (p.uuid === uuid) myRank = rank;
    return entry;
  });

  const top10 = allRanked.slice(0, 10);
  const myEntry =
    myRank !== null && myRank > 10
      ? (allRanked.find((e) => e.isMe) ?? null)
      : null;

  const entries = myEntry ? [...top10, myEntry] : top10;

  return res.status(200).json({ date, entries, myRank });
}
```

- [ ] **Step 2: Test manually**

```bash
curl "http://localhost:3000/api/leaderboard?uuid=test-uuid-1&offset=0"
```

Expected: `{ date, entries: [{ rank: 1, name: "sean", distance: ..., isMe: true }], myRank: 1 }`.

- [ ] **Step 3: Test without a name (not joined)**

```bash
curl "http://localhost:3000/api/leaderboard?uuid=unknown-uuid&offset=0"
```

Expected: `myRank: null`, `isMe: false` on all entries.

- [ ] **Step 4: Commit**

```bash
git add api/leaderboard.ts
git commit -m "feat: GET /api/leaderboard handler"
```

---

## Task 12: Wire httpApi, Swap Client, and Clean Up mockApi

**Files:**

- Modify: `src/api/client.ts`
- Modify: `src/api/mockApi.ts`

- [ ] **Step 1: Add httpApi to `src/api/client.ts` and swap**

Replace the entire file:

```typescript
import type {
  GameApi,
  GuessRequest,
  NameRequest,
  LeaderboardRequest,
} from "./types";
import { mockApi } from "./mockApi";

const httpApi: GameApi = {
  async guess(req: GuessRequest) {
    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`/api/guess failed: ${res.status}`);
    return res.json();
  },

  async submitName(req: NameRequest) {
    const res = await fetch("/api/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`/api/name failed: ${res.status}`);
    return res.json();
  },

  async leaderboard(req: LeaderboardRequest) {
    const params = new URLSearchParams();
    if (req.uuid) params.set("uuid", req.uuid);
    if (req.offset !== undefined) params.set("offset", String(req.offset));
    if (req.date) params.set("date", req.date);
    const res = await fetch(`/api/leaderboard?${params}`);
    if (!res.ok) throw new Error(`/api/leaderboard failed: ${res.status}`);
    return res.json();
  },
};

export function getApi(): GameApi {
  return httpApi;
}

export { mockApi };
```

- [ ] **Step 2: Remove `millionle.named.${date}` from `src/api/mockApi.ts`**

Remove the `namedKey` and `getMyName` functions. Then make these targeted replacements:

In `mockApi.guess`, change:

```typescript
hasJoined: getMyName(date) !== null,
```

to:

```typescript
hasJoined: false,
```

In `mockApi.submitName`, remove the localStorage line entirely (the function still returns `{ ok: true, rank }`):

```typescript
// DELETE this line:
localStorage.setItem(namedKey(date), req.name);
```

In `mockApi.leaderboard`, replace the `myRow && getMyName(date)` block. Change:

```typescript
const myRow = findByDate(date);
const myName = getMyName(date) ?? getName();
let myRank: number | null = null;
if (myRow && getMyName(date)) {
  rows.push({ name: myName || "you", distance: myRow.distance, isMe: true });
}
```

to:

```typescript
const myRow = findByDate(date);
let myRank: number | null = null;
```

Also remove the `getName` import from `"../store/identity"` if it's no longer used after this change.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Smoke test the full flow in the browser**

```bash
npm run dev:full
```

Open `http://localhost:3000`. Play the game:

1. Enter a guess → result screen appears with distance, tier, stats
2. Click to join leaderboard, enter a name → rank appears
3. Refresh → `alreadyPlayed: true`, result screen restores from server

- [ ] **Step 5: Commit**

```bash
git add src/api/client.ts src/api/mockApi.ts
git commit -m "feat: wire httpApi and swap from mockApi to real backend"
```

---

## Verification Checklist

- [ ] `POST /api/guess` returns correct shape; second call returns `alreadyPlayed: true` with original distance
- [ ] `POST /api/name` returns `ok: true` and correct rank
- [ ] `GET /api/leaderboard` returns top 10 + player row when rank > 10; `myRank: null` when not named
- [ ] Stats fields (`longestStreak`, `totalPlays`, `averageDistance`) appear in guess response
- [ ] Refreshing the page restores the result screen (server is source of truth)
- [ ] Deploy to Vercel preview branch; repeat all checks against production Supabase
