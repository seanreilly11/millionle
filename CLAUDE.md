# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # vite only (opens browser) - NO api routes, /api/* calls will 404
npm run dev:api    # api routes only, tsx watch, reads .env.local
npm run dev:full   # vercel dev - vite + api routes together
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm test           # vitest run (single pass)
npm run test:watch # vitest watch mode
```

`npm run dev` alone will not produce a playable game: `getApi()` calls `/api/*`, which
vite does not serve. Use `dev:full`, or `dev` plus `dev:api`.

Run a single test file:

```bash
npx vitest run src/engine/score.test.ts
```

## Architecture

Millionle is a daily number-guessing game (1–1,000,000, one guess per day). Stack: React 19 + TypeScript + Vite on the front end, Vercel serverless functions (`api/`) backed by Supabase Postgres on the back end. No routing library, no state management library.

### State machine (App.tsx)

Three phases: `idle → result → joined`. `App` owns all async calls and passes props down; screens/components are stateless.

### Backend (`api/`)

Vercel serverless functions. Each file is one route:

| Route              | Method | Responsibility                                              |
| ------------------ | ------ | ----------------------------------------------------------- |
| `guess.ts`         | POST   | Scores a guess, inserts the play, returns answer/rank/stats |
| `name.ts`          | POST   | Claims a display name for a uuid+date                       |
| `leaderboard.ts`   | GET    | Ranked rows for a date                                       |
| `result.ts`        | GET    | Existing result for a uuid, for returning players           |
| `event.ts`         | POST   | Analytics events                                            |
| `dev-server.ts`    | -      | Local-only host for the routes above (`npm run dev:api`)    |

Supabase tables (`public`, RLS enabled, service key bypasses it): `plays`, `names`, `events`.

Server env vars live in `.env.local`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. The
service key is admin-level and must never be imported into `src/`.

The Supabase project is `millionle` (ref `pmbyxgnylkjfwoctdqiy`) on the **hotmail**
account - use the `supabase-hotmail` MCP server, not `supabase-gmail`.

### The answer is server-derived

`api/guess.ts` computes the answer via `api/_lib/answer.ts` and returns it in the
response. The client does not derive it. Do not reintroduce client-side answer
derivation in the real game path - it would leak the answer into the bundle.

### Engine (`src/engine/`)

Pure, side-effect-free functions - all tested with Vitest:

| File        | Responsibility                                                                               |
| ----------- | -------------------------------------------------------------------------------------------- |
| `prng.ts`   | Seeded PRNG (xmur3 hash + mulberry32)                                                        |
| `answer.ts` | `answerForDate(config, dateISO)` - seed `"millionle:YYYY-MM-DD"`. Used only by `mockApi`     |
| `score.ts`  | `score`, `distance`, `tier` - maps distance to one of 7 tier labels                          |
| `date.ts`   | `localDate(offsetMinutes)`, `puzzleNumber(launch, date)` - all date math in UTC              |
| `stats.ts`  | `computeStats` - streak, lifetime points, closest ever                                       |
| `format.ts` | Number formatting utilities                                                                  |
| `copy.ts`   | Share-text and display strings                                                               |

### Duplicated engine: `src/engine/` vs `api/_lib/`

`api/_lib/` holds its own copies of `answer.ts`, `date.ts`, `prng.ts`, `score.ts`,
and `stats.ts`. They are **not** imported from `src/` - the serverless bundle is
separate, and the copies use `.js` import suffixes and hardcoded constants rather
than `GameConfig`.

This means **game rule changes must be made twice.** The seed string, min/max, tier
thresholds, and launch date all exist in both trees. They currently agree; if they
drift, the server wins and the client silently misreports.

### API layer (`src/api/`)

`getApi()` in `client.ts` returns `httpApi`, which `fetch`es the `/api/*` routes above.

`mockApi.ts` (250 ms simulated latency, `localStorage`, synthetic leaderboard
opponents seeded by date) is still exported, but **only tests use it** - see
`App.test.tsx`, which mocks `getApi` to return it. It is not a runtime fallback.

### Persistence (`src/store/`)

- `history.ts` - `localStorage` key `millionle.history`: array of `{date, guess, distance, score}` rows
- `identity.ts` - `localStorage` keys `millionle.uuid`, `millionle.name`

Server-side, `plays` and `names` are the source of truth; `localStorage` is a cache.

### Screens vs Components

- `src/screens/` - full-page views (`IdleScreen`, `ResultScreen`, `LeaderboardScreen`, `PrivacyScreen`, `TermsScreen`)
- `src/components/` - reusable pieces (`GuessInput`, `OddsRail`, `ScoreCounter`, `Leaderboard`, `WinCelebration`, etc.)

### Config

`src/game.config.ts` exports `MILLIONLE: GameConfig` and `SITE_URL`. Changing
`launch` here only updates the client - `LAUNCH_DATE` in `api/_lib/date.ts` must be
changed to match, or puzzle numbers will disagree between client and server.

Deploy config is `vercel.json`: vite framework, SPA rewrite that excludes `/api/`,
and security headers.

### Linting

Oxlint (`oxlint`), config in `.oxlintrc.json`. React Compiler is enabled via Babel plugin - avoid manual `useMemo`/`useCallback` except where the compiler can't infer.
