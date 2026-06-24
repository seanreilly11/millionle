# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (opens browser)
npm run build      # tsc + vite build
npm run lint       # oxlint
npm test           # vitest run (single pass)
npm run test:watch # vitest watch mode
```

Run a single test file:
```bash
npx vitest run src/engine/score.test.ts
```

## Architecture

Millionle is a daily number-guessing game (1–1,000,000, one guess per day). Stack: React 19 + TypeScript + Vite, no routing library, no state management library.

### State machine (App.tsx)

Three phases: `idle → result → joined`. `App` owns all async calls and passes props down; screens/components are stateless.

### Engine (`src/engine/`)

Pure, side-effect-free functions — all tested with Vitest:

| File | Responsibility |
|------|---------------|
| `prng.ts` | Seeded PRNG (xmur3 hash + mulberry32) |
| `answer.ts` | `answerForDate(config, dateISO)` — derives today's answer from seed `"millionle:YYYY-MM-DD"` |
| `score.ts` | `score`, `distance`, `tier` — maps distance to one of 7 tier labels |
| `date.ts` | `localDate(offsetMinutes)`, `puzzleNumber(launch, date)` — all date math in UTC |
| `stats.ts` | `computeStats` — streak, lifetime points, closest ever |
| `format.ts` | Number formatting utilities |

The answer is fully client-side derived; no secret is fetched from a server.

### API layer (`src/api/`)

`getApi()` in `client.ts` returns `mockApi` (stub that simulates 250 ms latency, stores data in `localStorage`, generates synthetic leaderboard opponents seeded by date). Swap this for a real HTTP client when a backend exists.

### Persistence (`src/store/`)

- `history.ts` — `localStorage` key `millionle.history`: array of `{date, guess, distance, score}` rows
- `identity.ts` — `localStorage` keys for UUID and display name

### Screens vs Components

- `src/screens/` — full-page views (`IdleScreen`, `ResultScreen`)
- `src/components/` — reusable pieces (`GuessInput`, `OddsRail`, `ScoreCounter`, `Leaderboard`, `WinCelebration`, etc.)

### Config

`src/game.config.ts` exports `MILLIONLE: GameConfig` — change `launch` date here (ISO `YYYY-MM-DD` of puzzle #1).

### Linting

Oxlint (`oxlint`), config in `.oxlintrc.json`. React Compiler is enabled via Babel plugin — avoid manual `useMemo`/`useCallback` except where the compiler can't infer.
