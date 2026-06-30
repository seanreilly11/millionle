# Millionle Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete playable Millionle frontend - idle → guess → reveal → result(win/loss) → join → leaderboard - running on a mock engine backed by `localStorage` that mirrors the future server API exactly.

**Architecture:** Pure isomorphic `engine/` (PRNG, scoring, dates, formatting) is consumed by a `mockApi` behind a `GameApi` interface (the seam). UI is a single-route state machine; the real backend later = add `httpApi.ts` and flip one line in `getApi()`.

**Tech Stack:** Vite 8 + React 19 (React Compiler on) + TypeScript, `motion` for animation, `canvas-confetti` for the win, Vitest + Testing Library for tests. No router, no state library, no PWA.

**Spec:** `docs/superpowers/specs/2026-06-23-millionle-design.md`

**Conventions:**

- Commit messages: Conventional Commits. **No `Co-Authored-By` trailer.**
- TDD for all `engine/`, `api/`, `store/` logic: failing test first.
- All numbers display with thousands separators via `formatNumber`.

---

## File Structure

```
src/
  main.tsx                 React entry (exists; restyle import)
  App.tsx                  state machine + screen switch (replace scaffold)
  game.config.ts           MILLIONLE GameConfig
  engine/
    types.ts               GameConfig, GameMode
    prng.ts                xmur3 + mulberry32 + seededRandom
    answer.ts              answerForDate(config, date)
    score.ts               distance, score, tier, Tier, TierId
    date.ts                localDate, addDays, puzzleNumber
    format.ts              formatNumber, parseGuess
    stats.ts               computeStats(rows, today)
  api/
    types.ts               Guess/Name/Leaderboard contracts
    client.ts              GameApi interface + getApi()
    mockApi.ts             localStorage-backed impl + synthetic board
  store/
    identity.ts            uuid + name
    history.ts             local guess log
  screens/
    IdleScreen.tsx
    ResultScreen.tsx
  components/
    GuessInput.tsx  OddsRail.tsx  ScoreCounter.tsx  WinCelebration.tsx
    StatChips.tsx  JoinBoard.tsx  DistanceBadge.tsx  Leaderboard.tsx  ShareButton.tsx
  styles/
    app.css                ported token system + component classes
  test/
    setup.ts               jest-dom + localStorage reset
```

Delete the scaffold `src/App.css`. Replace `src/index.css` content with an import of `styles/app.css`.

---

## Task 1: Tooling - Vitest, Testing Library, animation deps

**Files:**

- Modify: `package.json`
- Create: `src/test/setup.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm i motion canvas-confetti
npm i -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/canvas-confetti
```

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 4: Add Vitest config to `vite.config.ts`**

Add the triple-slash reference at the very top of the file and a `test` field to the config object:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 5: Sanity test**

Create `src/test/smoke.test.ts`:

```ts
import { expect, test } from "vitest";
test("test runner works", () => {
  expect(1 + 1).toBe(2);
});
```

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm src/test/smoke.test.ts
git add -A
git commit -m "chore: add vitest, testing-library, motion, canvas-confetti"
```

---

## Task 2: Theme - token system + global styles

**Files:**

- Create: `src/styles/app.css`
- Modify: `src/index.css` (replace contents)
- Delete: `src/App.css`

Port the approved visual from `.superpowers/brainstorm/111-1782241494/content/arc-board-light-v3.html`. Drop the design-board chrome (`.board-head`, `.deck`, `.slot`, `.phone` framing); make `.app` a centered mobile column. Component class names (`.mark`, `.guessbox`, `.score`, `.rail`, `.track`, `.pin`, `.chip`, `.statbar`, `.winnum`, etc.) are reused verbatim by the components.

- [ ] **Step 1: Create `src/styles/app.css`**

```css
:root {
  --paper: #eaeef1;
  --card: #ffffff;
  --card2: #f4f7f8;
  --ink: #0e1a22;
  --steel: #5c7079;
  --line: rgba(14, 26, 34, 0.12);
  --line2: rgba(14, 26, 34, 0.18);
  --signal: #0ea896;
  --signal-soft: rgba(14, 168, 150, 0.12);
  --jackpot: #e8920a;
  --gold-deep: #b8780a;
  --hot: #f4602a;
  --num: "Archivo", system-ui, sans-serif;
  --mono: "Space Mono", ui-monospace, monospace;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html,
body,
#root {
  height: 100%;
}
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--num);
  -webkit-font-smoothing: antialiased;
  font-variant-numeric: tabular-nums;
}

/* mobile column shell (replaces the .phone frame from the mockup) */
.app {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 34px 26px 26px;
  position: relative;
  overflow: hidden;
}

.mark {
  font-weight: 900;
  letter-spacing: 0.01em;
  font-size: 23px;
  line-height: 1;
}
.mark .o {
  color: var(--jackpot);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.puzzle {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--steel);
  text-transform: uppercase;
}
.label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--steel);
}

/* idle hero */
.tagc {
  text-align: center;
  color: var(--steel);
  font-size: 13px;
  margin-top: 14px;
  line-height: 1.45;
}
.tagc b {
  color: var(--ink);
  font-weight: 600;
}
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.guesslab {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--steel);
}
.guessbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 12px;
  border-bottom: 3px solid var(--signal);
}
.guessbox input {
  font-family: var(--num);
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.guessbox input::placeholder {
  color: #aebdc4;
}
.hintc {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--steel);
  letter-spacing: 0.05em;
}
.railmini {
  width: 230px;
}
.railmini .track {
  position: relative;
  height: 5px;
  border-radius: 5px;
  background: var(--card2);
  border: 1px solid var(--line);
}
.railmini .ends {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 9px;
  color: var(--steel);
  margin-top: 8px;
}
.cta {
  margin-top: 8px;
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-family: var(--num);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 0.04em;
  color: #fff;
  cursor: pointer;
  background: var(--signal);
  box-shadow: 0 16px 30px -12px rgba(14, 168, 150, 0.6);
}
.cta:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
.cta:focus-visible,
.guessbox input:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 3px;
}

/* result */
.score {
  font-size: 56px;
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 7px 12px;
  border-radius: 999px;
  margin-top: 12px;
}
.badge.near {
  color: #08776a;
  background: var(--signal-soft);
  border: 1px solid rgba(14, 168, 150, 0.32);
}
.rail {
  margin-top: 22px;
}
.track {
  position: relative;
  height: 6px;
  border-radius: 6px;
  background: var(--card2);
  border: 1px solid var(--line);
  margin: 14px 0 6px;
}
.track .ends {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  top: 14px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--steel);
}
.fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(14, 168, 150, 0.25), var(--signal));
}
.pin {
  position: absolute;
  top: -6px;
  width: 2px;
  height: 18px;
  border-radius: 2px;
}
.pinlab {
  position: absolute;
  top: -34px;
  transform: translateX(-50%);
  font-family: var(--mono);
  font-size: 10px;
  white-space: nowrap;
  letter-spacing: 0.04em;
}
.reveal {
  margin-top: 16px;
}
.reveal .k {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--steel);
}
.reveal .n {
  font-size: 28px;
  font-weight: 800;
  margin-top: 4px;
}
.rankline {
  margin-top: 14px;
  font-size: 14px;
  color: var(--steel);
}
.rankline b {
  color: var(--ink);
  font-weight: 800;
  font-size: 16px;
}
.chips {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.chip {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 13px;
  padding: 11px 12px;
  background: var(--card2);
}
.chip .k {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--steel);
}
.chip .v {
  font-size: 22px;
  font-weight: 800;
  margin-top: 3px;
}
.statbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  border: 1px solid var(--line);
  border-radius: 13px;
  padding: 12px 14px;
  background: var(--card2);
}
.statbar .k {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--steel);
}
.statbar .bv {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.01em;
}
.join {
  margin-top: auto;
  border-top: 1px solid var(--line);
  padding-top: 16px;
}
.namewrap {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-top: 10px;
}
.namewrap input {
  flex: 1;
  border: 1.5px solid var(--line2);
  border-radius: 13px;
  background: var(--card2);
  padding: 13px 14px;
  font-weight: 600;
  font-size: 15px;
  color: var(--ink);
  font-family: var(--num);
}
.namewrap .go {
  border: none;
  border-radius: 13px;
  background: var(--ink);
  color: #fff;
  font-weight: 800;
  padding: 0 18px;
  font-size: 14px;
  cursor: pointer;
}

/* win */
.winscr {
  justify-content: center;
  background:
    radial-gradient(
      120% 60% at 50% 0%,
      rgba(232, 146, 10, 0.34),
      transparent 55%
    ),
    radial-gradient(
      95% 40% at 50% 102%,
      rgba(244, 96, 42, 0.2),
      transparent 60%
    );
}
.glow-head {
  font-family: var(--mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--gold-deep);
  text-align: center;
}
.winnum {
  text-align: center;
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1;
  margin: 6px 0 2px;
  background: linear-gradient(180deg, #e8920a, var(--hot));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.winsub {
  text-align: center;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold-deep);
  margin-top: 8px;
}
.rank1 {
  margin: 30px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink);
}
.rank1 .hash {
  font-size: 30px;
  font-weight: 900;
  color: var(--jackpot);
  font-family: var(--num);
}
.confetti-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

/* leaderboard */
.board {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.board .lb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--card);
}
.board .lb-row.me {
  border-color: var(--signal);
  background: var(--signal-soft);
}
.board .lb-rank {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--steel);
  width: 46px;
}
.board .lb-name {
  font-weight: 700;
  flex: 1;
}
.board .lb-score {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.share {
  margin-top: 14px;
  width: 100%;
  border: 1.5px solid var(--line2);
  background: transparent;
  color: var(--ink);
  border-radius: 14px;
  padding: 14px;
  font-family: var(--num);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Replace `src/index.css` contents**

```css
@import "./styles/app.css";
```

- [ ] **Step 3: Delete scaffold CSS and commit**

```bash
rm src/App.css
git add -A
git commit -m "feat: add Millionle token system and global styles"
```

> **Note:** self-hosted fonts are added in Task 14. Until then Archivo/Space Mono fall back to system fonts - acceptable for logic tasks.

---

## Task 3: Engine types + game config

**Files:**

- Create: `src/engine/types.ts`
- Create: `src/game.config.ts`

- [ ] **Step 1: Create `src/engine/types.ts`**

```ts
export type GameMode = "number" | "letters";

export interface GameConfig {
  name: string;
  mode: GameMode;
  min?: number;
  max?: number;
  length?: number;
  guesses: number;
  launch: string; // ISO date YYYY-MM-DD of puzzle #1
}
```

- [ ] **Step 2: Create `src/game.config.ts`**

```ts
import type { GameConfig } from "./engine/types";

export const MILLIONLE: GameConfig = {
  name: "millionle",
  mode: "number",
  min: 1,
  max: 1_000_000,
  guesses: 1,
  launch: "2026-01-01",
};
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add engine types and Millionle game config"
```

---

## Task 4: PRNG (TDD)

**Files:**

- Create: `src/engine/prng.ts`
- Test: `src/engine/prng.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { seededRandom } from "./prng";

describe("seededRandom", () => {
  test("is deterministic for the same key", () => {
    const a = seededRandom("millionle:2026-06-23")();
    const b = seededRandom("millionle:2026-06-23")();
    expect(a).toBe(b);
  });
  test("differs across keys", () => {
    const a = seededRandom("millionle:2026-06-23")();
    const b = seededRandom("millionle:2026-06-24")();
    expect(a).not.toBe(b);
  });
  test("returns a float in [0,1)", () => {
    const v = seededRandom("x")();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/prng.test.ts`
Expected: FAIL - cannot resolve `./prng`.

- [ ] **Step 3: Write `src/engine/prng.ts`**

```ts
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/prng.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add seeded PRNG (xmur3 + mulberry32)"
```

---

## Task 5: Answer generation (TDD)

**Files:**

- Create: `src/engine/answer.ts`
- Test: `src/engine/answer.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { answerForDate } from "./answer";
import { MILLIONLE } from "../game.config";

describe("answerForDate", () => {
  test("is deterministic for a date", () => {
    expect(answerForDate(MILLIONLE, "2026-06-23")).toBe(
      answerForDate(MILLIONLE, "2026-06-23"),
    );
  });
  test("stays within [min,max]", () => {
    for (const d of ["2026-01-01", "2026-06-23", "2026-12-31", "2027-03-15"]) {
      const a = answerForDate(MILLIONLE, d);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(1_000_000);
      expect(Number.isInteger(a)).toBe(true);
    }
  });
  test("varies day to day", () => {
    expect(answerForDate(MILLIONLE, "2026-06-23")).not.toBe(
      answerForDate(MILLIONLE, "2026-06-24"),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/answer.test.ts`
Expected: FAIL - cannot resolve `./answer`.

- [ ] **Step 3: Write `src/engine/answer.ts`**

```ts
import { seededRandom } from "./prng";
import type { GameConfig } from "./types";

export function answerForDate(config: GameConfig, dateISO: string): number {
  const min = config.min ?? 1;
  const max = config.max ?? 1_000_000;
  const rand = seededRandom(`${config.name}:${dateISO}`);
  return min + Math.floor(rand() * (max - min + 1));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/answer.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add deterministic daily answer generation"
```

---

## Task 6: Scoring + tiers (TDD)

**Files:**

- Create: `src/engine/score.ts`
- Test: `src/engine/score.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { distance, score, tier } from "./score";

describe("scoring", () => {
  test("distance is absolute difference", () => {
    expect(distance(412769, 365538)).toBe(47231);
    expect(distance(100, 600)).toBe(500);
  });
  test("score is max minus distance", () => {
    expect(score(500000, 500000)).toBe(1_000_000);
    expect(score(412769, 365538)).toBe(952769);
    expect(score(1, 1_000_000)).toBe(1);
  });
});

describe("tier", () => {
  test("maps distance to the right tier id", () => {
    expect(tier(0).id).toBe("dead-on");
    expect(tier(5).id).toBe("within5");
    expect(tier(6).id).toBe("within100");
    expect(tier(100).id).toBe("within100");
    expect(tier(101).id).toBe("within2500");
    expect(tier(2500).id).toBe("within2500");
    expect(tier(2501).id).toBe("within50k");
    expect(tier(50000).id).toBe("within50k");
    expect(tier(50001).id).toBe("within250k");
    expect(tier(250000).id).toBe("within250k");
    expect(tier(250001).id).toBe("beyond");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/score.test.ts`
Expected: FAIL - cannot resolve `./score`.

- [ ] **Step 3: Write `src/engine/score.ts`**

```ts
export type TierId =
  | "dead-on"
  | "within5"
  | "within100"
  | "within2500"
  | "within50k"
  | "within250k"
  | "beyond";

export interface Tier {
  id: TierId;
  label: string;
  copy: string;
}

export function distance(guess: number, answer: number): number {
  return Math.abs(guess - answer);
}

export function score(guess: number, answer: number, max = 1_000_000): number {
  return max - distance(guess, answer);
}

const LADDER: { max: number; tier: Tier }[] = [
  {
    max: 0,
    tier: { id: "dead-on", label: "Dead on", copy: "One in a million." },
  },
  { max: 5, tier: { id: "within5", label: "Within 5", copy: "Breathtaking." } },
  {
    max: 100,
    tier: { id: "within100", label: "Within 100", copy: "Razor close." },
  },
  {
    max: 2500,
    tier: { id: "within2500", label: "Within 2,500", copy: "Dialed in." },
  },
  {
    max: 50000,
    tier: { id: "within50k", label: "Within 50k", copy: "Solid read." },
  },
  {
    max: 250000,
    tier: { id: "within250k", label: "Within 250k", copy: "In the zone." },
  },
  {
    max: Infinity,
    tier: { id: "beyond", label: "Off the mark", copy: "Not today." },
  },
];

export function tier(d: number): Tier {
  return LADDER.find((t) => d <= t.max)!.tier;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/score.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add scoring and distance tiers"
```

---

## Task 7: Dates (TDD)

**Files:**

- Create: `src/engine/date.ts`
- Test: `src/engine/date.test.ts`

**Offset convention:** `offsetMinutes` = minutes to ADD to UTC to get local time (UTC+14 → +840, UTC−12 → −720). The client computes it as `-new Date().getTimezoneOffset()`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { localDate, addDays, puzzleNumber } from "./date";

describe("localDate", () => {
  test("applies positive offset", () => {
    // 2026-06-23T23:30Z + 60min = 2026-06-24 local
    const now = new Date("2026-06-23T23:30:00Z");
    expect(localDate(60, now)).toBe("2026-06-24");
  });
  test("applies negative offset", () => {
    // 2026-06-23T00:30Z - 60min = 2026-06-22 local
    const now = new Date("2026-06-23T00:30:00Z");
    expect(localDate(-60, now)).toBe("2026-06-22");
  });
  test("clamps offset to the real-world range", () => {
    const now = new Date("2026-06-23T12:00:00Z");
    // absurd offset clamps to +840 (UTC+14); still same calendar day here
    expect(localDate(999999, now)).toBe(localDate(840, now));
    expect(localDate(-999999, now)).toBe(localDate(-720, now));
  });
});

describe("addDays", () => {
  test("moves the date", () => {
    expect(addDays("2026-06-23", -1)).toBe("2026-06-22");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("puzzleNumber", () => {
  test("launch date is puzzle #1", () => {
    expect(puzzleNumber("2026-01-01", "2026-01-01")).toBe(1);
    expect(puzzleNumber("2026-01-01", "2026-01-10")).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/date.test.ts`
Expected: FAIL - cannot resolve `./date`.

- [ ] **Step 3: Write `src/engine/date.ts`**

```ts
const DAY = 86_400_000;

export function localDate(
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

export function puzzleNumber(launchISO: string, dateISO: string): number {
  const launch = Date.parse(launchISO + "T00:00:00Z");
  const date = Date.parse(dateISO + "T00:00:00Z");
  return Math.floor((date - launch) / DAY) + 1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/date.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add local-date derivation and puzzle numbering"
```

---

## Task 8: Formatting (TDD)

**Files:**

- Create: `src/engine/format.ts`
- Test: `src/engine/format.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { formatNumber, parseGuess } from "./format";

describe("formatNumber", () => {
  test("groups thousands", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(412769)).toBe("412,769");
    expect(formatNumber(7)).toBe("7");
  });
});

describe("parseGuess", () => {
  test("accepts valid whole numbers and strips commas", () => {
    expect(parseGuess("412,769")).toBe(412769);
    expect(parseGuess("1")).toBe(1);
    expect(parseGuess("1000000")).toBe(1000000);
  });
  test("rejects out-of-range, zero, non-integer, empty", () => {
    expect(parseGuess("0")).toBeNull();
    expect(parseGuess("1000001")).toBeNull();
    expect(parseGuess("12.5")).toBeNull();
    expect(parseGuess("")).toBeNull();
    expect(parseGuess("abc")).toBeNull();
    expect(parseGuess("-5")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/format.test.ts`
Expected: FAIL - cannot resolve `./format`.

- [ ] **Step 3: Write `src/engine/format.ts`**

```ts
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function parseGuess(
  input: string,
  min = 1,
  max = 1_000_000,
): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/format.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add number formatting and guess parsing"
```

---

## Task 9: Stats (TDD)

**Files:**

- Create: `src/engine/stats.ts`
- Test: `src/engine/stats.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { computeStats, type GuessRow } from "./stats";

const rows: GuessRow[] = [
  { date: "2026-06-21", distance: 5000, score: 995000 },
  { date: "2026-06-22", distance: 312, score: 999688 },
  { date: "2026-06-23", distance: 47231, score: 952769 },
];

describe("computeStats", () => {
  test("lifetime points = sum of score", () => {
    expect(computeStats(rows, "2026-06-23").lifetimePoints).toBe(
      995000 + 999688 + 952769,
    );
  });
  test("closest ever = min distance", () => {
    expect(computeStats(rows, "2026-06-23").closestEver).toBe(312);
  });
  test("streak counts consecutive dates ending today", () => {
    expect(computeStats(rows, "2026-06-23").streak).toBe(3);
  });
  test("streak breaks on a skipped date", () => {
    const gap: GuessRow[] = [
      { date: "2026-06-20", distance: 10, score: 999990 },
      { date: "2026-06-22", distance: 10, score: 999990 },
      { date: "2026-06-23", distance: 10, score: 999990 },
    ];
    expect(computeStats(gap, "2026-06-23").streak).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/stats.test.ts`
Expected: FAIL - cannot resolve `./stats`.

- [ ] **Step 3: Write `src/engine/stats.ts`**

```ts
import { addDays } from "./date";

export interface GuessRow {
  date: string;
  distance: number;
  score: number;
}
export interface Stats {
  streak: number;
  lifetimePoints: number;
  closestEver: number;
}

export function computeStats(rows: GuessRow[], today: string): Stats {
  const lifetimePoints = rows.reduce((sum, r) => sum + r.score, 0);
  const closestEver = rows.length
    ? Math.min(...rows.map((r) => r.distance))
    : 0;

  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return { streak, lifetimePoints, closestEver };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/stats.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add server-rule stats aggregation"
```

---

## Task 10: Identity + history stores (TDD)

**Files:**

- Create: `src/store/identity.ts`
- Create: `src/store/history.ts`
- Test: `src/store/store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { getUuid, getName, setName } from "./identity";
import { readHistory, appendHistory, findByDate } from "./history";

describe("identity", () => {
  test("creates and persists a uuid", () => {
    const a = getUuid();
    expect(a).toMatch(/[0-9a-f-]{36}/);
    expect(getUuid()).toBe(a);
  });
  test("stores and reads a name", () => {
    expect(getName()).toBe("");
    setName("seanr");
    expect(getName()).toBe("seanr");
  });
});

describe("history", () => {
  test("appends and finds by date, replacing same-date rows", () => {
    appendHistory({
      date: "2026-06-23",
      guess: 412769,
      distance: 47231,
      score: 952769,
    });
    expect(findByDate("2026-06-23")?.score).toBe(952769);
    appendHistory({
      date: "2026-06-23",
      guess: 1,
      distance: 0,
      score: 1_000_000,
    });
    expect(readHistory().filter((r) => r.date === "2026-06-23")).toHaveLength(
      1,
    );
    expect(findByDate("2026-06-23")?.score).toBe(1_000_000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/store.test.ts`
Expected: FAIL - cannot resolve `./identity`.

- [ ] **Step 3: Write `src/store/identity.ts`**

```ts
const UUID_KEY = "millionle.uuid";
const NAME_KEY = "millionle.name";

export function getUuid(): string {
  let id = localStorage.getItem(UUID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, id);
  }
  return id;
}

export function getName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}
```

- [ ] **Step 4: Write `src/store/history.ts`**

```ts
export interface HistoryRow {
  date: string;
  guess: number;
  distance: number;
  score: number;
}
const KEY = "millionle.history";

export function readHistory(): HistoryRow[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryRow[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(row: HistoryRow): void {
  const rows = readHistory().filter((r) => r.date !== row.date);
  rows.push(row);
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function findByDate(date: string): HistoryRow | undefined {
  return readHistory().find((r) => r.date === date);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/store/store.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add identity and guess-history stores"
```

---

## Task 11: API contract types

**Files:**

- Create: `src/api/types.ts`

- [ ] **Step 1: Create `src/api/types.ts`**

```ts
import type { TierId } from "../engine/score";
import type { Stats } from "../engine/stats";

export interface GuessRequest {
  uuid: string;
  guess: number;
  offset: number;
}
export interface GuessResponse {
  score: number;
  distance: number;
  answer: number;
  rank: number;
  alreadyPlayed: boolean;
  tier: TierId;
  date: string;
  puzzle: number;
  stats: Stats;
}

export interface NameRequest {
  uuid: string;
  name: string;
  offset: number;
}
export interface NameResponse {
  ok: true;
  rank: number;
}

export interface LeaderboardRequest {
  date?: string;
  limit?: number;
  uuid?: string;
  offset?: number;
}
export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isMe: boolean;
}
export interface LeaderboardResponse {
  date: string;
  entries: LeaderboardEntry[];
  myRank: number | null;
}

export interface GameApi {
  guess(req: GuessRequest): Promise<GuessResponse>;
  submitName(req: NameRequest): Promise<NameResponse>;
  leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse>;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add GameApi contract types"
```

---

## Task 12: Mock API (TDD)

**Files:**

- Create: `src/api/mockApi.ts`
- Test: `src/api/mockApi.test.ts`

The mock scores via `engine/`, guards one-guess-per-date via `history`, aggregates stats, and fabricates a date-seeded synthetic board for rank + leaderboard. Players who have submitted a name are persisted under `millionle.named.<date>` so the board is stable.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test, beforeEach } from "vitest";
import { mockApi } from "./mockApi";
import { getUuid } from "../store/identity";
import { answerForDate } from "../engine/answer";
import { MILLIONLE } from "../game.config";
import { localDate } from "../engine/date";

const offset = 0;

describe("mockApi.guess", () => {
  beforeEach(() => localStorage.clear());

  test("scores correctly and returns the answer", async () => {
    const uuid = getUuid();
    const date = localDate(offset);
    const answer = answerForDate(MILLIONLE, date);
    const res = await mockApi.guess({ uuid, guess: answer, offset });
    expect(res.answer).toBe(answer);
    expect(res.score).toBe(1_000_000);
    expect(res.distance).toBe(0);
    expect(res.tier).toBe("dead-on");
    expect(res.alreadyPlayed).toBe(false);
  });

  test("second guess same day returns stored row with alreadyPlayed", async () => {
    const uuid = getUuid();
    const first = await mockApi.guess({ uuid, guess: 500000, offset });
    const second = await mockApi.guess({ uuid, guess: 1, offset });
    expect(second.alreadyPlayed).toBe(true);
    expect(second.score).toBe(first.score);
  });

  test("rank is a positive integer", async () => {
    const uuid = getUuid();
    const res = await mockApi.guess({ uuid, guess: 500000, offset });
    expect(res.rank).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(res.rank)).toBe(true);
  });
});

describe("mockApi.submitName + leaderboard", () => {
  beforeEach(() => localStorage.clear());

  test("named player appears on the board as isMe", async () => {
    const uuid = getUuid();
    await mockApi.guess({ uuid, guess: 999999, offset });
    await mockApi.submitName({ uuid, name: "seanr", offset });
    const board = await mockApi.leaderboard({ uuid, offset, limit: 100 });
    const me = board.entries.find((e) => e.isMe);
    expect(me?.name).toBe("seanr");
    expect(board.myRank).toBe(me?.rank);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/api/mockApi.test.ts`
Expected: FAIL - cannot resolve `./mockApi`.

- [ ] **Step 3: Write `src/api/mockApi.ts`**

```ts
import type {
  GameApi,
  GuessRequest,
  GuessResponse,
  NameRequest,
  NameResponse,
  LeaderboardRequest,
  LeaderboardResponse,
  LeaderboardEntry,
} from "./types";
import { MILLIONLE } from "../game.config";
import { answerForDate } from "../engine/answer";
import {
  score as scoreFn,
  distance as distanceFn,
  tier,
} from "../engine/score";
import { localDate, puzzleNumber } from "../engine/date";
import { computeStats, type GuessRow } from "../engine/stats";
import { seededRandom } from "../engine/prng";
import { readHistory, appendHistory, findByDate } from "../store/history";
import { getName } from "../store/identity";

const LATENCY = 250;
const wait = () => new Promise((r) => setTimeout(r, LATENCY));

const FAKE_NAMES = [
  "ava",
  "kai",
  "noah",
  "mia",
  "leo",
  "zoe",
  "ravi",
  "ivy",
  "omar",
  "luna",
  "finn",
  "nia",
  "theo",
  "remy",
  "june",
  "cole",
  "sage",
  "wren",
  "dax",
  "iris",
];

interface BoardRow {
  name: string;
  score: number;
  isMe: boolean;
}

/** Deterministic synthetic opponents for a date. */
function syntheticBoard(date: string): { name: string; score: number }[] {
  const rand = seededRandom(`board:${date}`);
  const count = 40 + Math.floor(rand() * 60); // 40-99 opponents
  const rows: { name: string; score: number }[] = [];
  for (let i = 0; i < count; i++) {
    // skew toward high scores so the board feels competitive
    const s = 1_000_000 - Math.floor(Math.pow(rand(), 2) * 1_000_000);
    rows.push({ name: `${FAKE_NAMES[i % FAKE_NAMES.length]}${i}`, score: s });
  }
  return rows;
}

function namedKey(date: string) {
  return `millionle.named.${date}`;
}

function getMyName(date: string): string | null {
  return localStorage.getItem(namedKey(date));
}

function rankFor(myScore: number, date: string): number {
  const better = syntheticBoard(date).filter((o) => o.score > myScore).length;
  return better + 1;
}

export const mockApi: GameApi = {
  async guess(req: GuessRequest): Promise<GuessResponse> {
    await wait();
    const date = localDate(req.offset);
    const answer = answerForDate(MILLIONLE, date);
    const existing = findByDate(date);

    let row: GuessRow;
    let alreadyPlayed = false;
    if (existing) {
      alreadyPlayed = true;
      row = { date, distance: existing.distance, score: existing.score };
    } else {
      const dist = distanceFn(req.guess, answer);
      const sc = scoreFn(req.guess, answer);
      appendHistory({ date, guess: req.guess, distance: dist, score: sc });
      row = { date, distance: dist, score: sc };
    }

    const stats = computeStats(
      readHistory().map((r) => ({
        date: r.date,
        distance: r.distance,
        score: r.score,
      })),
      date,
    );

    return {
      score: row.score,
      distance: row.distance,
      answer,
      rank: rankFor(row.score, date),
      alreadyPlayed,
      tier: tier(row.distance).id,
      date,
      puzzle: puzzleNumber(MILLIONLE.launch, date),
      stats,
    };
  },

  async submitName(req: NameRequest): Promise<NameResponse> {
    await wait();
    const date = localDate(req.offset);
    const row = findByDate(date);
    if (!row) throw new Error("no entry for date");
    localStorage.setItem(namedKey(date), req.name);
    return { ok: true, rank: rankFor(row.score, date) };
  },

  async leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse> {
    await wait();
    const date = req.date ?? localDate(req.offset ?? 0);
    const limit = req.limit ?? 100;
    const rows: BoardRow[] = syntheticBoard(date).map((o) => ({
      ...o,
      isMe: false,
    }));

    const myRow = findByDate(date);
    const myName = getMyName(date) ?? getName();
    let myRank: number | null = null;
    if (myRow && getMyName(date)) {
      rows.push({ name: myName || "you", score: myRow.score, isMe: true });
    }

    rows.sort((a, b) => b.score - a.score);
    const ranked: LeaderboardEntry[] = rows.map((r, i) => {
      const entry = { rank: i + 1, name: r.name, score: r.score, isMe: r.isMe };
      if (r.isMe) myRank = entry.rank;
      return entry;
    });

    return { date, entries: ranked.slice(0, limit), myRank };
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/api/mockApi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add localStorage-backed mock API with synthetic board"
```

---

## Task 13: API client seam

**Files:**

- Create: `src/api/client.ts`

- [ ] **Step 1: Create `src/api/client.ts`**

```ts
import type { GameApi } from "./types";
import { mockApi } from "./mockApi";

// Swap to httpApi here when the real backend exists.
export function getApi(): GameApi {
  return mockApi;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add GameApi client seam"
```

---

## Task 14: Self-hosted fonts

**Files:**

- Create: `src/styles/fonts.css`
- Modify: `src/index.css`
- Add font files under `src/assets/fonts/`

- [ ] **Step 1: Install font packages**

Run:

```bash
npm i @fontsource-variable/archivo @fontsource/space-mono
```

- [ ] **Step 2: Create `src/styles/fonts.css`**

```css
@import "@fontsource-variable/archivo";
@import "@fontsource/space-mono/400.css";
@import "@fontsource/space-mono/700.css";
```

- [ ] **Step 3: Import fonts first in `src/index.css`**

```css
@import "./styles/fonts.css";
@import "./styles/app.css";
```

- [ ] **Step 4: Verify dev build**

Run: `npm run build`
Expected: build succeeds, no unresolved import errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: self-host Archivo and Space Mono"
```

---

## Task 15: GuessInput component (TDD)

**Files:**

- Create: `src/components/GuessInput.tsx`
- Test: `src/components/GuessInput.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuessInput } from "./GuessInput";

describe("GuessInput", () => {
  test("formats input with commas and enables submit on valid value", async () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/your one guess/i);
    await userEvent.type(input, "412769");
    expect(input).toHaveValue("412,769");
    await userEvent.click(
      screen.getByRole("button", { name: /lock in guess/i }),
    );
    expect(onSubmit).toHaveBeenCalledWith(412769);
  });

  test("keeps submit disabled for invalid input", async () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/your one guess/i);
    await userEvent.type(input, "0");
    expect(
      screen.getByRole("button", { name: /lock in guess/i }),
    ).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GuessInput.test.tsx`
Expected: FAIL - cannot resolve `./GuessInput`.

- [ ] **Step 3: Write `src/components/GuessInput.tsx`**

```tsx
import { useState } from "react";
import { formatNumber, parseGuess } from "../engine/format";

export function GuessInput({
  onSubmit,
}: {
  onSubmit: (guess: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const parsed = parseGuess(raw);
  const display =
    raw === ""
      ? ""
      : parsed !== null
        ? formatNumber(parsed)
        : raw.replace(/[^\d]/g, "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 7);
    setRaw(digits);
  }

  return (
    <>
      <div className="guesslab">Your one guess</div>
      <div className="guessbox">
        <input
          aria-label="Your one guess"
          inputMode="numeric"
          placeholder="412,769"
          value={display}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed !== null) onSubmit(parsed);
          }}
        />
      </div>
      <div className="hintc">whole number · 1–1,000,000</div>
      <div className="railmini">
        <div className="track" />
        <div className="ends">
          <span>1</span>
          <span>1,000,000</span>
        </div>
      </div>
      <button
        className="cta"
        disabled={parsed === null}
        onClick={() => parsed !== null && onSubmit(parsed)}
      >
        Lock in guess
      </button>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/GuessInput.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add GuessInput with live comma formatting and validation"
```

---

## Task 16: ScoreCounter component (TDD)

**Files:**

- Create: `src/components/ScoreCounter.tsx`
- Test: `src/components/ScoreCounter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCounter } from "./ScoreCounter";

describe("ScoreCounter", () => {
  test("renders the final formatted value", () => {
    render(<ScoreCounter value={952769} />);
    expect(screen.getByText("952,769")).toBeInTheDocument();
  });
});
```

> Note: with `prefers-reduced-motion` unset in jsdom, the component renders the final value immediately; the count-up only animates in a real browser. The test asserts the final value is present.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ScoreCounter.test.tsx`
Expected: FAIL - cannot resolve `./ScoreCounter`.

- [ ] **Step 3: Write `src/components/ScoreCounter.tsx`**

```tsx
import { useEffect, useState } from "react";
import { animate } from "motion";
import { formatNumber } from "../engine/format";

const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScoreCounter({
  value,
  className = "score",
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(prefersReduced() ? value : 0);

  useEffect(() => {
    if (prefersReduced()) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <div className={className}>{formatNumber(shown)}</div>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ScoreCounter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ScoreCounter odometer count-up"
```

---

## Task 17: OddsRail component (signature) (TDD)

**Files:**

- Create: `src/components/OddsRail.tsx`
- Test: `src/components/OddsRail.test.tsx`

The rail places a YOU pin at the guess and an ANSWER pin at the answer, with a distance fill between. Pins/fill are positioned by `% = (value - min) / (max - min) * 100`. With motion, the YOU pin animates from its position to meet the readout; in reduced-motion it renders final positions.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { OddsRail } from "./OddsRail";

describe("OddsRail", () => {
  test("renders guess and answer labels with formatted numbers", () => {
    render(<OddsRail guess={412769} answer={365538} />);
    expect(screen.getByText(/412,769/)).toBeInTheDocument();
    expect(screen.getByText(/365,538/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/OddsRail.test.tsx`
Expected: FAIL - cannot resolve `./OddsRail`.

- [ ] **Step 3: Write `src/components/OddsRail.tsx`**

```tsx
import { formatNumber } from "../engine/format";

const MIN = 1,
  MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

export function OddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);

  return (
    <div className="rail">
      <div className="label">How close you landed</div>
      <div className="track" style={{ marginTop: 30 }}>
        <div className="ends">
          <span>1</span>
          <span>1,000,000</span>
        </div>
        <div
          className="fill"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div
          className="pin"
          style={{ left: `${gp}%`, background: "var(--signal)" }}
        />
        <div className="pinlab" style={{ left: `${gp}%`, color: "#08776a" }}>
          YOU {formatNumber(guess)}
        </div>
        <div
          className="pin"
          style={{ left: `${ap}%`, background: "var(--ink)" }}
        />
        <div
          className="pinlab"
          style={{ left: `${ap}%`, top: -52, color: "var(--ink)" }}
        >
          ANSWER {formatNumber(answer)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/OddsRail.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add OddsRail range-reveal viz"
```

---

## Task 18: WinCelebration component

**Files:**

- Create: `src/components/WinCelebration.tsx`
- Test: `src/components/WinCelebration.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WinCelebration } from "./WinCelebration";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("WinCelebration", () => {
  test("shows the perfect score and rank", () => {
    render(<WinCelebration rank={1} />);
    expect(screen.getByText("1,000,000")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/WinCelebration.test.tsx`
Expected: FAIL - cannot resolve `./WinCelebration`.

- [ ] **Step 3: Write `src/components/WinCelebration.tsx`**

```tsx
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { formatNumber } from "../engine/format";

const prefersReduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WinCelebration({ rank }: { rank: number }) {
  useEffect(() => {
    if (prefersReduced()) return;
    const end = Date.now() + 1200;
    (function frame() {
      confetti({
        particleCount: 5,
        spread: 70,
        origin: { y: 0.3 },
        colors: ["#E8920A", "#F4602A", "#0EA896", "#0E1A22"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <>
      <div className="glow-head">★ One in a million ★</div>
      <div className="winnum">{formatNumber(1_000_000)}</div>
      <div className="winsub">Dead on · perfect score</div>
      <div className="rank1">
        <span className="hash">#{rank}</span>
        <span>on today’s board</span>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/WinCelebration.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add WinCelebration detonation"
```

---

## Task 19: Small result components

**Files:**

- Create: `src/components/DistanceBadge.tsx`
- Create: `src/components/StatChips.tsx`
- Create: `src/components/JoinBoard.tsx`
- Create: `src/components/ShareButton.tsx`
- Test: `src/components/result-bits.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DistanceBadge } from "./DistanceBadge";
import { StatChips } from "./StatChips";
import { JoinBoard } from "./JoinBoard";

describe("result bits", () => {
  test("DistanceBadge shows the tier label", () => {
    render(<DistanceBadge distance={47231} />);
    expect(screen.getByText(/within 50k/i)).toBeInTheDocument();
  });
  test("StatChips show all three stats", () => {
    render(
      <StatChips
        stats={{ streak: 7, closestEver: 312, lifetimePoints: 8412769 }}
      />,
    );
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("312")).toBeInTheDocument();
    expect(screen.getByText("8,412,769")).toBeInTheDocument();
  });
  test("JoinBoard submits the autofilled name", async () => {
    const onJoin = vi.fn();
    render(<JoinBoard defaultName="seanr" onJoin={onJoin} />);
    await userEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(onJoin).toHaveBeenCalledWith("seanr");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/result-bits.test.tsx`
Expected: FAIL - cannot resolve `./DistanceBadge`.

- [ ] **Step 3: Write the four components**

`src/components/DistanceBadge.tsx`:

```tsx
import { tier } from "../engine/score";

export function DistanceBadge({ distance }: { distance: number }) {
  return <div className="badge near">◇ {tier(distance).label}</div>;
}
```

`src/components/StatChips.tsx`:

```tsx
import type { Stats } from "../engine/stats";
import { formatNumber } from "../engine/format";

export function StatChips({ stats }: { stats: Stats }) {
  return (
    <>
      <div className="chips">
        <div className="chip">
          <div className="k">Streak</div>
          <div className="v">{stats.streak}</div>
        </div>
        <div className="chip">
          <div className="k">Closest ever</div>
          <div className="v">{formatNumber(stats.closestEver)}</div>
        </div>
      </div>
      <div className="statbar">
        <span className="k">Lifetime points</span>
        <span className="bv">{formatNumber(stats.lifetimePoints)}</span>
      </div>
    </>
  );
}
```

`src/components/JoinBoard.tsx`:

```tsx
import { useState } from "react";

export function JoinBoard({
  defaultName,
  onJoin,
}: {
  defaultName: string;
  onJoin: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const clean = name.trim().slice(0, 20);
  return (
    <div className="join">
      <div className="namewrap">
        <input
          aria-label="Your name"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="go"
          disabled={clean.length === 0}
          onClick={() => onJoin(clean)}
        >
          Join board
        </button>
      </div>
    </div>
  );
}
```

`src/components/ShareButton.tsx`:

```tsx
import { formatNumber } from "../engine/format";

export function ShareButton({
  puzzle,
  guess,
  distance,
  score,
}: {
  puzzle: number;
  guess: number;
  distance: number;
  score: number;
}) {
  const line = `MILLIONLE No.${puzzle} - ${formatNumber(guess)} → off by ${formatNumber(distance)} · score ${formatNumber(score)}`;
  return (
    <button
      className="share"
      onClick={() => navigator.clipboard?.writeText(line)}
    >
      Share result
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/result-bits.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add DistanceBadge, StatChips, JoinBoard, ShareButton"
```

---

## Task 20: Leaderboard component

**Files:**

- Create: `src/components/Leaderboard.tsx`
- Test: `src/components/Leaderboard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "./Leaderboard";

describe("Leaderboard", () => {
  test("renders entries and marks the player row", () => {
    render(
      <Leaderboard
        entries={[
          { rank: 1, name: "ava1", score: 999999, isMe: false },
          { rank: 2, name: "seanr", score: 952769, isMe: true },
        ]}
      />,
    );
    expect(screen.getByText("ava1")).toBeInTheDocument();
    expect(screen.getByText("952,769")).toBeInTheDocument();
    expect(screen.getByText("seanr").closest(".lb-row")).toHaveClass("me");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/Leaderboard.test.tsx`
Expected: FAIL - cannot resolve `./Leaderboard`.

- [ ] **Step 3: Write `src/components/Leaderboard.tsx`**

```tsx
import type { LeaderboardEntry } from "../api/types";
import { formatNumber } from "../engine/format";

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="board">
      {entries.map((e) => (
        <div key={e.rank} className={`lb-row${e.isMe ? " me" : ""}`}>
          <span className="lb-rank">#{e.rank}</span>
          <span className="lb-name">{e.name}</span>
          <span className="lb-score">{formatNumber(e.score)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/Leaderboard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Leaderboard list"
```

---

## Task 21: IdleScreen

**Files:**

- Create: `src/screens/IdleScreen.tsx`
- Test: `src/screens/IdleScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdleScreen } from "./IdleScreen";

describe("IdleScreen", () => {
  test("shows puzzle number and forwards a guess", async () => {
    const onGuess = vi.fn();
    render(<IdleScreen puzzle={432} onGuess={onGuess} />);
    expect(screen.getByText(/No\. 432/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/your one guess/i), "412769");
    await userEvent.click(
      screen.getByRole("button", { name: /lock in guess/i }),
    );
    expect(onGuess).toHaveBeenCalledWith(412769);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/IdleScreen.test.tsx`
Expected: FAIL - cannot resolve `./IdleScreen`.

- [ ] **Step 3: Write `src/screens/IdleScreen.tsx`**

```tsx
import { GuessInput } from "../components/GuessInput";

export function IdleScreen({
  puzzle,
  onGuess,
}: {
  puzzle: number;
  onGuess: (guess: number) => void;
}) {
  return (
    <div className="app">
      <div className="row">
        <div className="mark">
          MILLI<span className="o">O</span>NLE
        </div>
        <div className="puzzle">No. {puzzle}</div>
      </div>
      <div className="tagc">
        One hidden number, <b>1 to 1,000,000</b>.<br />
        One guess - how close can you land?
      </div>
      <div className="hero">
        <GuessInput onSubmit={onGuess} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/screens/IdleScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add IdleScreen"
```

---

## Task 22: ResultScreen

**Files:**

- Create: `src/screens/ResultScreen.tsx`
- Test: `src/screens/ResultScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultScreen } from "./ResultScreen";
import type { GuessResponse } from "../api/types";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const base: GuessResponse = {
  score: 952769,
  distance: 47231,
  answer: 365538,
  rank: 1243,
  alreadyPlayed: false,
  tier: "within50k",
  date: "2026-06-23",
  puzzle: 432,
  stats: { streak: 7, lifetimePoints: 8412769, closestEver: 312 },
};

describe("ResultScreen", () => {
  test("loss variant shows score, rank and stats", () => {
    render(
      <ResultScreen
        result={base}
        guess={412769}
        defaultName="seanr"
        onJoin={vi.fn()}
      />,
    );
    expect(screen.getByText("952,769")).toBeInTheDocument();
    expect(screen.getByText(/#1,243/)).toBeInTheDocument();
    expect(screen.getByText("8,412,769")).toBeInTheDocument();
  });
  test("win variant shows the detonation and no stat bar", () => {
    const win = {
      ...base,
      score: 1_000_000,
      distance: 0,
      answer: 500000,
      tier: "dead-on" as const,
      rank: 1,
    };
    render(
      <ResultScreen
        result={win}
        guess={500000}
        defaultName="seanr"
        onJoin={vi.fn()}
      />,
    );
    expect(screen.getByText(/one in a million/i)).toBeInTheDocument();
    expect(screen.queryByText("Lifetime points")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/ResultScreen.test.tsx`
Expected: FAIL - cannot resolve `./ResultScreen`.

- [ ] **Step 3: Write `src/screens/ResultScreen.tsx`**

```tsx
import type { GuessResponse } from "../api/types";
import { ScoreCounter } from "../components/ScoreCounter";
import { DistanceBadge } from "../components/DistanceBadge";
import { OddsRail } from "../components/OddsRail";
import { StatChips } from "../components/StatChips";
import { JoinBoard } from "../components/JoinBoard";
import { WinCelebration } from "../components/WinCelebration";
import { ShareButton } from "../components/ShareButton";
import { formatNumber } from "../engine/format";

export function ResultScreen({
  result,
  guess,
  defaultName,
  onJoin,
}: {
  result: GuessResponse;
  guess: number;
  defaultName: string;
  onJoin: (name: string) => void;
}) {
  const isWin = result.distance === 0;

  if (isWin) {
    return (
      <div className="app winscr">
        <WinCelebration rank={result.rank} />
        <JoinBoard defaultName={defaultName} onJoin={onJoin} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="row">
        <div className="mark" style={{ fontSize: 18 }}>
          MILLI<span className="o">O</span>NLE
        </div>
        <div className="puzzle">No. {result.puzzle} · locked</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="label">Your score today</div>
        <ScoreCounter value={result.score} />
        <DistanceBadge distance={result.distance} />
      </div>

      <OddsRail guess={guess} answer={result.answer} />

      <div className="reveal">
        <div className="k">off by</div>
        <div className="n">{formatNumber(result.distance)}</div>
      </div>
      <div className="rankline">
        You’d sit at <b>#{formatNumber(result.rank)}</b> on today’s board.
      </div>

      <StatChips stats={result.stats} />
      <ShareButton
        puzzle={result.puzzle}
        guess={guess}
        distance={result.distance}
        score={result.score}
      />
      <JoinBoard defaultName={defaultName} onJoin={onJoin} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/screens/ResultScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ResultScreen with win/loss variants"
```

---

## Task 23: App state machine + wiring

**Files:**

- Replace: `src/App.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("App flow", () => {
  beforeEach(() => localStorage.clear());

  test("idle → guess → result, then revisiting stays locked", async () => {
    const { unmount } = render(<App />);
    await userEvent.type(
      await screen.findByLabelText(/your one guess/i),
      "500000",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /lock in guess/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/your score today|one in a million/i),
      ).toBeInTheDocument(),
    );

    unmount();
    render(<App />);
    // revisit: should not show the idle CTA again
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /lock in guess/i }),
      ).not.toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL - current scaffold App has no guess input.

- [ ] **Step 3: Replace `src/App.tsx`**

```tsx
import { useEffect, useState } from "react";
import { getApi } from "./api/client";
import { MILLIONLE } from "./game.config";
import { localDate, puzzleNumber } from "./engine/date";
import { getUuid, getName, setName } from "./store/identity";
import { findByDate } from "./store/history";
import type { GuessResponse, LeaderboardEntry } from "./api/types";
import { IdleScreen } from "./screens/IdleScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Leaderboard } from "./components/Leaderboard";

type Phase = "idle" | "result" | "joined";
const offset = () => -new Date().getTimezoneOffset();

export default function App() {
  const api = getApi();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [guess, setGuess] = useState(0);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const date = localDate(offset());
  const puzzle = puzzleNumber(MILLIONLE.launch, date);

  // Revisit: if today's guess already exists, recover the result state.
  useEffect(() => {
    const existing = findByDate(date);
    if (existing && !result) {
      setGuess(existing.guess);
      api
        .guess({ uuid: getUuid(), guess: existing.guess, offset: offset() })
        .then((r) => {
          setResult(r);
          setPhase("result");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGuess(g: number) {
    setLoading(true);
    setGuess(g);
    const r = await api.guess({ uuid: getUuid(), guess: g, offset: offset() });
    setResult(r);
    setPhase("result");
    setLoading(false);
  }

  async function handleJoin(name: string) {
    setName(name);
    await api.submitName({ uuid: getUuid(), name, offset: offset() });
    const lb = await api.leaderboard({
      uuid: getUuid(),
      offset: offset(),
      limit: 100,
    });
    setBoard(lb.entries);
    setPhase("joined");
  }

  if (phase === "idle")
    return <IdleScreen puzzle={puzzle} onGuess={handleGuess} />;

  if (phase === "joined" && result) {
    return (
      <div className="app">
        <div className="row">
          <div className="mark" style={{ fontSize: 18 }}>
            MILLI<span className="o">O</span>NLE
          </div>
          <div className="puzzle">No. {result.puzzle} · on the board</div>
        </div>
        <Leaderboard entries={board} />
      </div>
    );
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        guess={guess}
        defaultName={getName()}
        onJoin={handleJoin}
      />
    );
  }

  return <div className="app" aria-busy={loading} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verify the full suite, build, and lint**

Run:

```bash
npm test
npm run build
npm run lint
```

Expected: all tests pass, build succeeds, lint clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire App state machine (idle → result → joined)"
```

---

## Task 24: Manual smoke + cleanup

**Files:**

- Modify: `index.html` (title), `src/main.tsx` (confirm imports)

- [ ] **Step 1: Set the document title in `index.html`**

Change `<title>` to `Millionle`.

- [ ] **Step 2: Confirm `src/main.tsx` imports `./index.css`**

It should already (`import './index.css'`). No `App.css` import remains.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`, open the local URL, and verify:

- Idle: hero guess input centered, comma formatting, CTA enables on a valid number.
- Guess a non-perfect number → result: score counts up, rail shows both pins + fill, rank + stats render.
- Join → leaderboard shows your highlighted row.
- Reload → stays on the locked result (one guess per day).
- Guess `500000` repeatedly across reloads until a win to see the detonation, OR temporarily hardcode a guess equal to `answerForDate` to verify the win path.
- Toggle OS reduced-motion → no count-up/confetti, final states shown immediately.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: set title and finalize smoke pass"
```

---

## Self-Review notes (already applied)

- **Spec coverage:** engine (PRNG/answer/score/tier/date/format/stats) → Tasks 4–9; api seam + mock + synthetic board → Tasks 11–13; identity/history → Task 10; all screens/components incl. signature OddsRail + WinCelebration → Tasks 15–22; state machine + revisit-lock → Task 23; tokens/fonts → Tasks 2, 14; sharing → Task 19; reduced-motion → in ScoreCounter/WinCelebration + global CSS. Leaderboard view + synthetic opponents in scope → Tasks 12, 20, 23.
- **Out of scope (per spec):** backend, PWA, accounts, emoji share bar, multi-game routing - none planned. Correct.
- **Type consistency:** `Stats` (engine/stats) and `TierId` (engine/score) are the single definitions imported by `api/types`, components, and screens. `GuessResponse` shape is identical across mock, ResultScreen, and App. `offset` convention (`-getTimezoneOffset()`) is consistent in App and the date tests.
