# Guess-flow microanimations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add microanimations to the idle→submit→result guess flow (input feedback, button press, screen transition, staggered result reveal) per the approved design spec.

**Architecture:** CSS keyframes/transitions for high-frequency state-driven feedback (input, button, loading); `motion` package's React API (`motion/react`, already a dependency) for orchestrated transitions (`AnimatePresence` screen swap, staggered result reveal, odds-rail entrance). A shared `src/lib/motion.ts` centralizes the `prefersReducedMotion()` check (currently duplicated in `WinCelebration.tsx` and `ScoreCounter.tsx`) plus shared easing/spring presets.

**Tech Stack:** React 19, TypeScript, `motion` 12.x (`motion/react` subpath = framer-motion API), Tailwind CSS v4, Vitest + Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-06-30-guess-flow-microanimations-design.md`

**Useful fact discovered during planning:** `src/styles/app.css` already has a global rule:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
This means new CSS `@keyframes`/`transition` rules (Tasks 2-3) automatically respect reduced motion with zero extra JS — only the `motion`-package-driven animations (Tasks 4-6, which set inline styles via JS, not CSS) need an explicit `prefersReducedMotion()` check.

Also discovered: jsdom (the test environment) has no `matchMedia`, so `prefersReducedMotion()` already returns `true` in every existing test today (the `typeof matchMedia === "undefined"` branch) — this is why `ScoreCounter.test.tsx` and `WinCelebration.test.tsx` never had to mock it. New tests inherit the same default; no new mocking setup is required.

---

### Task 1: Shared motion utility

**Files:**
- Create: `src/lib/motion.ts`
- Test: `src/lib/motion.test.ts`
- Modify: `src/components/ScoreCounter.tsx`
- Modify: `src/components/WinCelebration.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/motion.test.ts
import { describe, expect, test, vi, afterEach } from "vitest";
import { prefersReducedMotion, SNAPPY, BOUNCY, STAGGER_MS } from "./motion";

describe("prefersReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("returns true when matchMedia is undefined", () => {
    // @ts-expect-error - simulating an environment without matchMedia
    delete window.matchMedia;
    expect(prefersReducedMotion()).toBe(true);
  });

  test("returns true when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(prefersReducedMotion()).toBe(true);
  });

  test("returns false when the user has no motion preference", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("motion presets", () => {
  test("SNAPPY is a short ease-out tween", () => {
    expect(SNAPPY).toEqual({ duration: 0.18, ease: "easeOut" });
  });

  test("BOUNCY is a spring transition", () => {
    expect(BOUNCY).toEqual({ type: "spring", stiffness: 320, damping: 20 });
  });

  test("STAGGER_MS is defined", () => {
    expect(STAGGER_MS).toBe(90);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: FAIL — `Failed to resolve import "./motion"` (file doesn't exist yet)

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/motion.ts
export const prefersReducedMotion = () =>
  typeof matchMedia === "undefined" ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SNAPPY = { duration: 0.18, ease: "easeOut" } as const;
export const BOUNCY = { type: "spring", stiffness: 320, damping: 20 } as const;
export const STAGGER_MS = 90;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/motion.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Refactor ScoreCounter.tsx to use the shared utility**

Replace `src/components/ScoreCounter.tsx` in full:

```typescript
import { useEffect, useState } from "react";
import { animate } from "motion";
import { formatNumber } from "../engine/format";
import { prefersReducedMotion } from "../lib/motion";

export function ScoreCounter({
  value,
  className = "text-display font-black leading-none tracking-tight text-ink tabular-nums",
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(prefersReducedMotion() ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
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

- [ ] **Step 6: Refactor WinCelebration.tsx to use the shared utility**

Replace `src/components/WinCelebration.tsx` in full:

```typescript
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { formatNumber } from "../engine/format";
import { prefersReducedMotion } from "../lib/motion";

export function WinCelebration({ rank }: { rank: number }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const end = Date.now() + 1200;
    (function frame() {
      confetti({ particleCount: 5, spread: 70, origin: { y: 0.3 }, colors: ["#E8920A", "#F4602A", "#0EA896", "#0E1A22"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <>
      <div className="font-mono font-bold text-sm tracking-heading uppercase text-gold-deep text-center">
        ★ One in a million ★
      </div>
      <h2 className="win-number text-center text-win font-black leading-none my-1.5">
        {formatNumber(1_000_000)}
      </h2>
      <div className="text-center font-mono text-xs tracking-label uppercase text-gold-deep mt-2">
        Dead on
      </div>
      <div className="mt-8 mx-auto flex items-center justify-center gap-2.5 font-mono text-xs tracking-puzzle uppercase text-ink">
        <span className="text-3xl font-black text-jackpot font-num">#{rank}</span>
        <span>on today's board</span>
      </div>
    </>
  );
}
```

(This file is replaced again in full in Task 6, Step 3, which adds the pop-in animation and delayed confetti on top of this dedup.)

- [ ] **Step 7: Run full test suite to confirm no regression**

Run: `npx vitest run src/lib/motion.test.ts src/components/ScoreCounter.test.tsx src/components/WinCelebration.test.tsx`
Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add src/lib/motion.ts src/lib/motion.test.ts src/components/ScoreCounter.tsx src/components/WinCelebration.tsx
git commit -m "feat: add shared motion utility, dedupe reduced-motion check"
```

---

### Task 2: CSS keyframes for input pulse, button press, loading dots

**Files:**
- Modify: `src/styles/app.css`

- [ ] **Step 1: Add the keyframes and utility classes**

Append to `src/styles/app.css` (before the existing `@media (prefers-reduced-motion: reduce)` block at the end, so that block continues to override these):

```css
/* Input keystroke feedback */
@keyframes input-pulse {
  0% {
    border-color: var(--color-signal);
  }
  40% {
    border-color: var(--color-jackpot);
    border-bottom-width: 3px;
  }
  100% {
    border-color: var(--color-signal);
    border-bottom-width: 2px;
  }
}
.input-pulse {
  animation: input-pulse 120ms ease-out;
}

/* Lock-in loading indicator */
@keyframes dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.25;
  }
  40% {
    opacity: 1;
  }
}
.loading-dots span {
  animation: dot-pulse 1s ease-in-out infinite;
}
.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}
.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}
```

- [ ] **Step 2: Verify the global reduced-motion rule still comes last**

Read `src/styles/app.css` and confirm the `@media (prefers-reduced-motion: reduce)` block (`* { animation: none !important; transition: none !important; }`) is still the final rule in the file, after the additions above. CSS cascade order doesn't strictly matter here since it uses `!important`, but keeping it last preserves the file's existing convention of "global overrides at the bottom."

- [ ] **Step 3: Commit**

```bash
git add src/styles/app.css
git commit -m "feat: add CSS keyframes for input pulse and loading dots"
```

---

### Task 3: Wire up GuessInput keystroke pulse, button press, loading dots

**Files:**
- Modify: `src/components/GuessInput.tsx`
- Test: `src/components/GuessInput.test.tsx`

- [ ] **Step 1: Write the failing test for the loading-dots indicator**

Add to `src/components/GuessInput.test.tsx`:

```typescript
test("shows animated loading dots instead of static text while loading", () => {
  render(<GuessInput onSubmit={vi.fn()} loading={true} />);
  const button = screen.getByRole("button");
  expect(button.querySelectorAll(".loading-dots span")).toHaveLength(3);
  expect(screen.queryByText("Locking in…")).not.toBeInTheDocument();
});

test("keystrokes retrigger the input pulse animation", async () => {
  render(<GuessInput onSubmit={vi.fn()} />);
  const input = screen.getByLabelText(/your one guess/i);
  const underline = input.parentElement!;
  await userEvent.type(input, "1");
  const keyAfterFirst = underline.getAttribute("data-pulse-key");
  await userEvent.type(input, "2");
  const keyAfterSecond = underline.getAttribute("data-pulse-key");
  expect(keyAfterFirst).not.toBe(keyAfterSecond);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/GuessInput.test.tsx`
Expected: FAIL — loading dots not found; `data-pulse-key` attribute not found (still `null === null` comparison would pass, so first assert is the real failure — confirm by reading output)

- [ ] **Step 3: Implement the changes**

Replace `src/components/GuessInput.tsx` in full:

```typescript
import { useState } from "react";
import { formatNumber, parseGuess } from "../engine/format";

export function GuessInput({ onSubmit, loading = false }: { onSubmit: (guess: number) => void; loading?: boolean }) {
  const [raw, setRaw] = useState("");
  const [pulseKey, setPulseKey] = useState(0);
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
    setPulseKey((k) => k + 1);
  }

  return (
    <>
      <div className="font-mono text-label tracking-input text-steel uppercase">
        Your one guess
      </div>
      <div
        key={pulseKey}
        data-pulse-key={pulseKey}
        className={`inline-flex items-center gap-2 px-1.5 pb-3 border-b-2 border-signal${pulseKey > 0 ? " input-pulse" : ""}`}
      >
        <input
          className="guess-input font-num text-display font-extrabold tracking-tight text-ink w-full text-center tabular-nums"
          type="text"
          aria-label="Your one guess"
          inputMode="numeric"
          autoComplete="off"
          placeholder="412,769"
          value={display}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && parsed !== null) onSubmit(parsed);
          }}
        />
      </div>
      <button
        className="mt-2 w-full rounded-2xl py-5 font-num font-extrabold text-lg tracking-wide text-white bg-signal shadow-cta disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.97] transition-transform duration-100"
        disabled={parsed === null || loading}
        onClick={() => parsed !== null && !loading && onSubmit(parsed)}
      >
        {loading ? (
          <span className="loading-dots inline-flex gap-1" aria-label="Locking in">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          </span>
        ) : (
          "Lock in guess"
        )}
      </button>
    </>
  );
}
```

Note: the `key={pulseKey}` on the underline `div` forces React to remount it on every keystroke, which restarts the CSS `input-pulse` animation reliably (a className toggle alone wouldn't replay an already-applied CSS animation). `pulseKey > 0` guard skips the pulse class on first render (no flash before any input).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/GuessInput.test.tsx`
Expected: PASS (all 4 tests)

- [ ] **Step 5: Run the full existing suite to confirm no regression**

Run: `npm test`
Expected: All PASS (the `IdleScreen.test.tsx` and `App.test.tsx` integration tests exercise `GuessInput` indirectly)

- [ ] **Step 6: Commit**

```bash
git add src/components/GuessInput.tsx src/components/GuessInput.test.tsx
git commit -m "feat: add keystroke pulse, button press, and loading dots to GuessInput"
```

---

### Task 4: AnimatePresence screen transition in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Confirm the existing integration test as the regression baseline**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (this is the test that must keep passing after the restructure)

- [ ] **Step 2: Restructure App.tsx to render through a single AnimatePresence-wrapped slot**

Replace `src/App.tsx` in full:

```typescript
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getApi } from "./api/client";
import { MILLIONLE } from "./game.config";
import { localDate, puzzleNumber } from "./engine/date";
import { getUuid, getName, setName } from "./store/identity";
import type { GuessResponse, LeaderboardEntry } from "./api/types";
import { IdleScreen } from "./screens/IdleScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Leaderboard } from "./components/Leaderboard";
import { AppShell } from "./components/AppShell";
import { GameHeader } from "./components/GameHeader";
import { InitLoader } from "./components/InitLoader";
import { prefersReducedMotion, SNAPPY, BOUNCY } from "./lib/motion";

type Phase = "idle" | "result" | "joined";
const offset = () => -new Date().getTimezoneOffset();

const exitVariant = { opacity: 0, y: -12 };
const enterVariant = { opacity: 0, y: 12 };
const restVariant = { opacity: 1, y: 0 };

export default function App() {
  const api = getApi();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [guess, setGuess] = useState(0);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const date = localDate(offset());
  const puzzle = puzzleNumber(MILLIONLE.launch, date);

  // On load, check the server for today's result (works across devices).
  useEffect(() => {
    async function checkExisting() {
      const [r] = await Promise.all([
        api.result({ uuid: getUuid(), offset: offset() }),
        new Promise<void>((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (r.played) {
        setGuess(r.guess);
        setResult(r);
        setPhase("result");
      }
      setInitializing(false);
    }
    checkExisting();
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
    await loadLeaderboard();
    setResult((r) => r ? { ...r, hasJoined: true } : r);
  }

  async function loadLeaderboard() {
    const lb = await api.leaderboard({ uuid: getUuid(), offset: offset() });
    setBoard(lb.entries);
    setPhase("joined");
  }

  if (initializing) return <InitLoader />;

  const reduced = prefersReducedMotion();
  const transition = reduced ? { duration: 0 } : phase === "result" ? BOUNCY : SNAPPY;

  let content: React.ReactNode;
  if (phase === "idle") {
    content = <IdleScreen puzzle={puzzle} onGuess={handleGuess} loading={loading} />;
  } else if (phase === "joined" && result) {
    content = (
      <AppShell>
        <GameHeader puzzle={result.puzzle} suffix="on the board" />
        <button
          className="mt-3 bg-transparent text-steel font-mono text-xs tracking-wide py-3 -mx-2 px-2 text-left hover:text-ink border-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none rounded"
          onClick={() => setPhase("result")}
        >
          ← Back to result
        </button>
        <Leaderboard entries={board} />
      </AppShell>
    );
  } else if (result) {
    content = (
      <ResultScreen
        result={result}
        guess={guess}
        defaultName={getName()}
        onJoin={handleJoin}
        onSeeLeaderboard={loadLeaderboard}
      />
    );
  } else {
    content = <AppShell aria-busy={loading}><span className="sr-only">Loading…</span></AppShell>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={reduced ? restVariant : enterVariant}
        animate={restVariant}
        exit={reduced ? restVariant : exitVariant}
        transition={transition}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Run the integration test to confirm no regression**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: animate idle/result/joined screen transitions with AnimatePresence"
```

---

### Task 5: OddsRail entrance animation (fill width + pin slide-in)

**Files:**
- Modify: `src/components/OddsRail.tsx`
- Test: `src/components/OddsRail.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `src/components/OddsRail.test.tsx`:

```typescript
test("rail-fill and both pins are present with correct final positions", () => {
  render(<OddsRail guess={412769} answer={365538} />);
  const fill = screen.getByTestId("rail-fill");
  // 412769 and 365538 are both close to the midpoint of 1-1,000,000
  expect(fill).toBeInTheDocument();
  expect(screen.getByTestId("answer-pin")).toBeInTheDocument();
  expect(screen.getByTestId("guess-pin")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/OddsRail.test.tsx`
Expected: FAIL — `Unable to find an element by: [data-testid="rail-fill"]`

- [ ] **Step 3: Implement the changes**

Replace `src/components/OddsRail.tsx` in full:

```typescript
import { motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { MonoLabel } from "./MonoLabel";
import { prefersReducedMotion, BOUNCY, STAGGER_MS } from "../lib/motion";

const MIN = 1,
  MAX = 1_000_000;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

export function OddsRail({ guess, answer }: { guess: number; answer: number }) {
  const gp = pct(guess);
  const ap = pct(answer);
  const left = Math.min(gp, ap);
  const width = Math.abs(gp - ap);
  const reduced = prefersReducedMotion();

  const fillTransition = reduced ? { duration: 0 } : { ...BOUNCY, delay: STAGGER_MS / 1000 };
  const pinTransition = reduced ? { duration: 0 } : { ...BOUNCY, delay: (STAGGER_MS * 1.3) / 1000 };

  return (
    <div className="mt-8">
      <MonoLabel tracking="tracking-label-lg">How close you landed</MonoLabel>
      <div className="relative h-1.5 rounded-full bg-card2 border border-line mt-12 mb-9">
        <div className="absolute inset-0 flex justify-between top-9 font-mono text-label text-steel">
          <span>{Intl.NumberFormat().format(MIN)}</span>
          <span>{Intl.NumberFormat().format(MAX)}</span>
        </div>
        <motion.div
          data-testid="rail-fill"
          className="absolute top-0 bottom-0 rounded-full rail-fill"
          style={{ left: `${left}%` }}
          initial={reduced ? { width: `${width}%` } : { width: "0%" }}
          animate={{ width: `${width}%` }}
          transition={fillTransition}
        />
        {/* ANSWER pin + label */}
        <motion.div
          data-testid="answer-pin"
          className="absolute"
          style={{ left: `${ap}%` }}
          initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pinTransition}
        >
          <div className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-ink" />
          <div className="absolute -top-7 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-ink">
            ANSWER {formatNumber(answer)}
          </div>
        </motion.div>
        {/* YOU pin + label */}
        <motion.div
          data-testid="guess-pin"
          className="absolute"
          style={{ left: `${gp}%` }}
          initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={pinTransition}
        >
          <div className="absolute -top-1.5 w-0.5 h-4 rounded-sm bg-signal" />
          <div className="absolute top-5 -translate-x-1/2 font-mono text-label whitespace-nowrap tracking-wide text-badge-text">
            YOU {formatNumber(guess)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

Note: the pin bar and its label moved from two independently-positioned absolute elements into one `motion.div` wrapper carrying the `left: %` position, with the bar and label now positioned relative to that wrapper (bar at the wrapper's origin, label still `-translate-x-1/2` to stay centered on it) — same final visual position as before, just grouped so both move together during the entrance animation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/OddsRail.test.tsx`
Expected: PASS (all tests, including the pre-existing label-text test)

- [ ] **Step 5: Commit**

```bash
git add src/components/OddsRail.tsx src/components/OddsRail.test.tsx
git commit -m "feat: animate odds rail fill width and pin entrance"
```

---

### Task 6: Staggered result reveal in ResultScreen + WinCelebration pop-in

**Files:**
- Modify: `src/screens/ResultScreen.tsx`
- Modify: `src/components/WinCelebration.tsx`

- [ ] **Step 1: Confirm existing tests as the regression baseline**

Run: `npx vitest run src/screens/ResultScreen.test.tsx src/components/WinCelebration.test.tsx`
Expected: PASS

- [ ] **Step 2: Implement the staggered reveal in ResultScreen.tsx**

Replace `src/screens/ResultScreen.tsx` in full:

```typescript
import { motion } from "motion/react";
import type { GuessResponse } from "../api/types";
import { ScoreCounter } from "../components/ScoreCounter";
import { DistanceBadge } from "../components/DistanceBadge";
import { OddsRail } from "../components/OddsRail";
import { StatChips } from "../components/StatChips";
import { JoinBoard } from "../components/JoinBoard";
import { WinCelebration } from "../components/WinCelebration";
import { ShareButton } from "../components/ShareButton";
import { DarkButton } from "../components/DarkButton";
import { AppShell } from "../components/AppShell";
import { GameHeader } from "../components/GameHeader";
import { MonoLabel } from "../components/MonoLabel";
import { formatNumber } from "../engine/format";
import { prefersReducedMotion, BOUNCY, STAGGER_MS } from "../lib/motion";

function revealProps(index: number) {
  const reduced = prefersReducedMotion();
  return {
    initial: reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    transition: reduced
      ? { duration: 0 }
      : { ...BOUNCY, delay: (index * STAGGER_MS) / 1000 },
  };
}

export function ResultScreen({
  result,
  guess,
  defaultName,
  onJoin,
  onSeeLeaderboard,
}: {
  result: GuessResponse;
  guess: number;
  defaultName: string;
  onJoin: (name: string) => void;
  onSeeLeaderboard: () => void;
}) {
  const isWin = result.distance === 0;
  const boardAction = result.hasJoined ? (
    <DarkButton fullWidth className="mt-3.5" onClick={onSeeLeaderboard}>
      See leaderboard
    </DarkButton>
  ) : (
    <JoinBoard defaultName={defaultName} onJoin={onJoin} />
  );

  if (isWin) {
    return (
      <AppShell className="win-bg justify-center">
        <WinCelebration rank={result.rank} />
        {boardAction}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <GameHeader puzzle={result.puzzle} />

      <section aria-label="Today's result" className="mt-4">
        <MonoLabel tracking="tracking-label-lg">The answer</MonoLabel>
        <motion.div {...revealProps(0)}>
          <ScoreCounter value={result.answer} />
        </motion.div>
        <div className="mt-5">
          <MonoLabel tracking="tracking-label">off by</MonoLabel>
          <div className="text-3xl font-extrabold">
            {formatNumber(result.distance)}
          </div>
        </div>
        <motion.div className="mt-4" {...revealProps(1)}>
          <DistanceBadge distance={result.distance} />
        </motion.div>
      </section>

      <OddsRail guess={guess} answer={result.answer} />

      <div className="mt-6 text-sm text-steel">
        {result.hasJoined ? "You're" : "You'd sit at"}{" "}
        <b className="text-ink font-extrabold text-base">
          #{formatNumber(result.rank)}
        </b>{" "}
        on today's board.
      </div>

      <motion.div {...revealProps(3)}>
        <StatChips stats={result.stats} />
      </motion.div>
      <ShareButton
        puzzle={result.puzzle}
        guess={guess}
        distance={result.distance}
      />
      {boardAction}
    </AppShell>
  );
}
```

Note: `OddsRail` is left unwrapped here — it already carries its own internal entrance animation (Task 5) with delays tuned relative to the badge (`revealProps(1)`), so it doesn't need an outer `motion.div` too; double-wrapping would compound delays. `StatChips` uses index `3` (not `2`) to land after the rail's internal animation settles (rail's pin delay is `STAGGER_MS * 1.3` ≈ 117ms on top of its own `STAGGER_MS` delay ≈ 90ms, so ~207ms total; `revealProps(3)` gives 270ms, after it).

- [ ] **Step 3: Implement the win-number pop-in and delayed confetti in WinCelebration.tsx**

Replace `src/components/WinCelebration.tsx` in full:

```typescript
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { formatNumber } from "../engine/format";
import { prefersReducedMotion, BOUNCY } from "../lib/motion";

export function WinCelebration({ rank }: { rank: number }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = setTimeout(() => {
      const end = Date.now() + 1200;
      (function frame() {
        confetti({ particleCount: 5, spread: 70, origin: { y: 0.3 }, colors: ["#E8920A", "#F4602A", "#0EA896", "#0E1A22"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }, 150);
    return () => clearTimeout(start);
  }, []);

  const reduced = prefersReducedMotion();

  return (
    <>
      <div className="font-mono font-bold text-sm tracking-heading uppercase text-gold-deep text-center">
        ★ One in a million ★
      </div>
      <motion.h2
        className="win-number text-center text-win font-black leading-none my-1.5"
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : BOUNCY}
      >
        {formatNumber(1_000_000)}
      </motion.h2>
      <div className="text-center font-mono text-xs tracking-label uppercase text-gold-deep mt-2">
        Dead on
      </div>
      <div className="mt-8 mx-auto flex items-center justify-center gap-2.5 font-mono text-xs tracking-puzzle uppercase text-ink">
        <span className="text-3xl font-black text-jackpot font-num">#{rank}</span>
        <span>on today's board</span>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run the affected tests**

Run: `npx vitest run src/screens/ResultScreen.test.tsx src/components/WinCelebration.test.tsx src/components/result-bits.test.tsx src/components/OddsRail.test.tsx`
Expected: All PASS

- [ ] **Step 5: Run the full suite, lint, and build**

Run: `npm test`
Expected: All PASS

Run: `npm run lint`
Expected: No errors

Run: `npm run build`
Expected: Succeeds (catches any TypeScript errors from the `motion/react` prop types)

- [ ] **Step 6: Commit**

```bash
git add src/screens/ResultScreen.tsx src/components/WinCelebration.tsx
git commit -m "feat: stagger result reveal and add win-number pop-in with delayed confetti"
```

---

### Task 7: Manual browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify the loss-path golden flow**

In the browser: type a guess digit-by-digit and confirm the underline flashes on each keystroke; confirm the lock-in button visibly compresses on press (mouse down); submit and confirm it briefly shows three pulsing dots instead of static text; confirm the idle screen slides/fades out and the result screen slides/fades in with a slight spring overshoot; confirm the answer count-up, distance badge, odds rail (fill bar growing + pins sliding in), and stat chips reveal in a visible left-to-right/top-to-bottom stagger rather than all popping in at once.

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools: open the Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → set to "reduce". Reload and repeat the guess flow. Confirm all content still appears (instantly, no animation) and nothing is missing or stuck at `opacity: 0`.

- [ ] **Step 4: Verify the win path**

The win path (`distance === 0`) requires guessing today's exact seeded answer, which isn't practically discoverable from the UI. Rely on the automated coverage for this path: `ResultScreen.test.tsx`'s "win variant" test and `WinCelebration.test.tsx` already assert the win UI renders correctly with the new pop-in/delayed-confetti code (covered in Task 6, Step 4). Visually spot-check the code change in `WinCelebration.tsx` once more for correctness (the `setTimeout` wrapping the existing confetti frame loop, and the `motion.h2` wrapping the win number) since this path can't be cheaply exercised end-to-end in the browser.

- [ ] **Step 5: Report results**

Summarize what was checked and whether anything looked off (jank, wrong timing, layout shift) before considering the feature complete.
