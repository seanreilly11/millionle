# Millionle — Design Spec

**Date:** 2026-06-23
**Status:** Approved for planning
**Scope of this spec:** First build — the playable Millionle frontend with a mock engine that mirrors the future server API. No real backend, no PWA.

---

## 1. What we're building

A daily one-guess number game. Each day has a hidden number 1–1,000,000. The player gets **one guess**, scored by how close they land (`1,000,000 − |guess − answer|`), and ranked on that day's leaderboard.

This first build delivers the **complete playable UI and feel** — idle, guess, reveal, result (win/loss), join, and a lightweight leaderboard — running entirely on a **mock engine** backed by `localStorage`. The mock mirrors the eventual server API exactly so going live later is a transport swap with zero UI rewrite.

### Locked decisions (from brainstorming)

| Decision | Choice |
| --- | --- |
| Build order | Frontend-first, mock engine |
| Backend infra | None yet — planned but not built |
| Animations | `motion` + `canvas-confetti` |
| Game scope | Single game (Millionle), single route, no router |
| PWA | **Never.** Out of scope permanently. |
| Identity | `localStorage` UUID + remembered name |
| Fonts | Self-hosted Archivo + Space Mono |
| State management | Plain React hooks + the api client; React Compiler on; no state library |

---

## 2. Visual identity (locked from the mockup)

Direction: **"a calm precision instrument that detonates."** Cool, exact light idle → jackpot-gold payoff. Numerals are the hero; the 1→1,000,000 **odds-rail** is the signature element.

### Tokens

```
--paper:#EAEEF1   board / app background (cool light, not cream)
--card:#FFFFFF    surfaces
--card2:#F4F7F8   insets / inputs
--ink:#0E1A22     primary text + numerals
--steel:#5C7079   muted / labels
--line:rgba(14,26,34,.12)   --line2:rgba(14,26,34,.18)
--signal:#0EA896  idle accent (caret, CTA, near-tier, rail)  soft: rgba(14,168,150,.12)
--jackpot:#E8920A win accent      --gold-deep:#B8780A  --hot:#F4602A
```

- **Type:** Archivo (display + numerals, 400–900) for everything numeric/headline; Space Mono for labels, readouts, puzzle number, hints. `font-variant-numeric: tabular-nums` globally.
- **Layout:** mobile-first, single column, large touch targets, visible focus rings on `--signal`.
- **Reference:** `.superpowers/brainstorm/111-1782241494/content/arc-board-light-v3.html` is the approved visual.

---

## 3. Architecture

### 3.1 `engine/` — pure, isomorphic TypeScript

No DOM, no React, no storage. The eventual Vercel serverless functions import these same files, guaranteeing the mock and the real server compute identical answers/scores.

- `prng.ts` — deterministic PRNG. Hash `name + ":" + date` (e.g. xmur3) → seed → mulberry32. Pure function, no globals.
- `answer.ts` — `answerForDate(config, dateISO): number` → integer in `[config.min, config.max]` via the PRNG.
- `score.ts` —
  - `distance(guess, answer): number` = `|guess − answer|`
  - `score(guess, answer): number` = `max − distance` (where `max = config.max = 1_000_000`)
  - `tier(distance): Tier` — `dead-on | within5 | within100 | within2500 | within50k | within250k | beyond`, each with `{ id, label, copy }`.
- `date.ts` —
  - `localDate(offsetMinutes, now = new Date()): string` (`YYYY-MM-DD`) — applies a **validated** offset (clamp to −720…+840) to UTC. (In the mock the offset comes from the device; the contract is identical to the server's clock+offset rule so the real server slots in unchanged.)
  - `puzzleNumber(launchDateISO, dateISO): number` — day index + 1.
- `format.ts` — `formatNumber(n)` (grouped with commas), `parseGuess(str): number | null` (strips separators, validates whole number in range).

### 3.2 `game.config.ts`

```ts
export const MILLIONLE: GameConfig = {
  name: "millionle",
  mode: "number",
  min: 1,
  max: 1_000_000,
  guesses: 1,
  launch: "2026-01-01",   // puzzle #1 date (ISO)
};
```

`GameConfig` type matches the brief (name, mode, min/max, length?, guesses, launch).

### 3.3 `api/` — the contract (the seam)

`types.ts` defines the request/response shapes that the real server will also honor:

```ts
type GuessRequest  = { uuid: string; guess: number; offset: number };
type GuessResponse = {
  score: number; distance: number; answer: number;
  rank: number; alreadyPlayed: boolean; tier: TierId;
  stats: { streak: number; lifetimePoints: number; closestEver: number };
};

type NameRequest   = { uuid: string; name: string; offset: number };
type NameResponse  = { ok: true; rank: number };

type LeaderboardRequest  = { date?: string; limit?: number; uuid?: string };
type LeaderboardEntry    = { rank: number; name: string; score: number; isMe: boolean };
type LeaderboardResponse = { date: string; entries: LeaderboardEntry[]; myRank: number | null };
```

`client.ts` exposes:

```ts
interface GameApi {
  guess(req: GuessRequest): Promise<GuessResponse>;
  submitName(req: NameRequest): Promise<NameResponse>;
  leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse>;
}
export function getApi(): GameApi   // returns mockApi now; httpApi later
```

The UI imports only `getApi()`. Swapping to the real backend later means adding `httpApi.ts` and changing one line in `getApi()`.

### 3.4 `mockApi.ts` — localStorage-backed implementation

- **Scoring:** real, via `engine/`. Derives the day's answer from `MILLIONLE` + local date.
- **One-guess guard:** keyed by `(uuid, date)` in localStorage. A second `guess()` for the same date returns the stored row with `alreadyPlayed: true` (mirrors server `ON CONFLICT DO NOTHING`).
- **Stats:** aggregated from the local guess history (`history.ts`) using the exact server rules — `lifetimePoints = Σ score`, `closestEver = min distance`, `streak = consecutive local dates ending today`.
- **Synthetic board:** a date-seeded set of fake opponents (deterministic names + scores) so `rank` and the leaderboard list are consistent and believable before a real backend exists. Rank = `count(opponent.score > mine) + 1`, merged with the player's row.
- Small artificial latency (~250ms) so loading states are real.

### 3.5 `store/`

- `identity.ts` — `getUuid()` (create `crypto.randomUUID()` on first visit), `getName()/setName()`.
- `history.ts` — append/read the local guess log `{ date, guess, distance, score }[]` that feeds stats and the "already played today" revisit state.

---

## 4. UI — single route, state machine

No router. `App.tsx` holds the machine:

```
idle ──guess()──▶ revealing ──▶ result(win | loss) ──join()──▶ joined ──▶ leaderboard
                                                   └──(revisit same day)──▶ result (locked)
```

- **On load:** read identity + today's date; if a row exists for today, jump straight to the locked `result` state.

### Screens & components

- `IdleScreen` — wordmark, `No. N`, tagline, the **centered hero guess input**, range hint + mini-rail, big "Lock in guess" CTA. No stats here.
- `GuessInput` — large centered numerals, live comma formatting, numeric input mode, signal caret/underline, range validation, disabled CTA until valid.
- `ResultScreen` — has two variants:
  - **Loss variant:** score (big, via `ScoreCounter`), distance tier badge, the `OddsRail` reveal, `off by N`, provisional rank line, **all stats live here** (Streak + Closest ever chips, Lifetime points bar), `JoinBoard`.
  - **Win variant (perfect score):** pure detonation — `WinCelebration`, gold `1,000,000`, `#1`, gold claim CTA. **No stat block** (stats stay on the loss/normal result view, per the approved mockup). Idle has no stats either; the result loss view is their only home.
- `OddsRail` — **signature.** 1→1,000,000 track; the guess pin holds, then **travels** to the answer pin while a readout counts across the gap and the distance fill grows behind it. Lands on the answer (already there on a win).
- `ScoreCounter` — odometer-style count-up to the final score.
- `WinCelebration` — `canvas-confetti` burst, scaling gold `1,000,000` headline, `#1` rank, gold claim CTA. The signature detonation.
- `StatChips` / `StatBar` — streak, closest ever; lifetime points.
- `JoinBoard` — name field autofilled from `getName()`, explicit submit → `submitName()` → flips to `joined` and reveals the board.
- `Leaderboard` — lightweight top-N list + the player's highlighted row, from `leaderboard()`.
- `ShareButton` — copies the one-line result (`MILLIONLE No.432 — 412,769 → off by 47,231 · score 952,769`). Emoji proximity bar deferred.

### Animation rules

- Library: `motion` for rail-travel, score count, screen transitions; `canvas-confetti` for the win.
- **All motion respects `prefers-reduced-motion`** — reduced path jumps to final states (answer shown, score shown, no travel/confetti).
- Reveal timing roughly per brief: staggered/traveling ~1.5–2s; win is deliberately over-the-top.

---

## 5. File structure

```
src/
  main.tsx
  App.tsx                  state machine + screen switch
  game.config.ts
  engine/   prng.ts  answer.ts  score.ts  date.ts  format.ts  types.ts
  api/      types.ts  client.ts  mockApi.ts
  store/    identity.ts  history.ts
  screens/  IdleScreen.tsx  ResultScreen.tsx
  components/  GuessInput.tsx  OddsRail.tsx  ScoreCounter.tsx
               WinCelebration.tsx  StatChips.tsx  JoinBoard.tsx
               DistanceBadge.tsx  Leaderboard.tsx  ShareButton.tsx
  theme/    tokens.css  fonts.css
  styles/   global.css
```

Each `engine/` and `api/` module is independently testable pure logic.

---

## 6. Testing

- **Unit (engine, pure):** PRNG determinism (same name+date → same answer), answer always in range, scoring math + every tier boundary, `localDate` offset clamping (−720…+840) producing only yesterday/today/tomorrow, `parseGuess` validation (rejects 0, >1,000,000, non-integers, empty), `formatNumber` grouping.
- **Unit (mock):** one-guess-per-date guard returns stored row with `alreadyPlayed`; stats aggregation (streak resets on skipped date, lifetime sum, closest min); synthetic board rank math.
- **Component:** GuessInput validation/formatting; ResultScreen win vs loss branch; reduced-motion path skips animation to final state.

TDD per the test-driven-development skill: engine and mock get tests first.

---

## 7. Future server slot-in (informational, not built now)

Recorded so the seam stays honest — not in this build:
- Vercel functions `/api/guess`, `/api/name`, `/api/leaderboard` import `engine/` unchanged.
- Supabase `entries` table + indexes per the brief; `(uuid, date)` primary key is the one-guess guard.
- Server derives date from its own UTC clock + validated client offset; never trusts a client date or score.
- Anti-abuse: per-(uuid,date) key, IP burst limit (Vercel Firewall), IP logged for manual cleanup.
- Going live = add `httpApi.ts`, flip `getApi()`.

---

## 8. Out of scope (first build)

PWA (permanent), real backend / Supabase / Vercel functions, accounts, profanity service integration (basic local filter only on the name field), emoji proximity share bar, multi-game routing/engine generalization beyond config-shaped internals.
