# Guess-flow microanimations

Date: 2026-06-30

## Goal

Add microanimations to the idle→submit→result guess flow to make the game feel more interactive. Today: input is static, button has no press feedback, loading state is a plain text swap, the idle→result screen change is an instant unmount/mount, and the entire result screen (answer count-up aside) renders fully formed with no choreography.

Scope: guess-flow only (IdleScreen → submit → ResultScreen, including the win path). Leaderboard/join screens are out of scope for this pass.

## Approach

Hybrid: CSS-only animations for state-driven micro-interactions (input feedback, button press, loading indicator) — no JS needed, cheapest perf, runs on every keystroke. `motion` lib (already a dependency, used today in `ScoreCounter.tsx`) only where true orchestration or exit-animation is required — screen transitions need `AnimatePresence` because `App.tsx` currently unmounts screens outright via conditional `return`, which CSS can't animate the exit of; the result reveal needs sequencing across multiple children.

Alternatives considered:
- **Pure CSS everywhere** — rejected. Can't animate the idle→result exit without ugly delayed-unmount hacks (CSS can't keep an unmounted component painted).
- **`motion` lib everywhere, including input/button** — rejected. Adds JS animation overhead to high-frequency interactions (every keystroke, every press) for no visual benefit over CSS transitions/keyframes.

Tone: "mixed by moment" — snappy (~180ms, ease-out) for frequent/low-stakes feedback (input, button, loading), bouncy (spring, slight overshoot, ~320ms) reserved for the once-a-day result payoff (screen entrance, answer reveal, win number).

## Shared utility: `src/lib/motion.ts`

Currently `prefersReducedMotion()`-equivalent logic (`matchMedia("(prefers-reduced-motion: reduce)")`) is duplicated in `WinCelebration.tsx` and `ScoreCounter.tsx`. Consolidate into one module, used by all new and existing animated components:

```ts
export const prefersReducedMotion = () =>
  typeof matchMedia === "undefined" ||
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export const SNAPPY = { duration: 0.18, ease: "easeOut" } as const;
export const BOUNCY = { type: "spring", stiffness: 320, damping: 20 } as const;
export const STAGGER_MS = 90;
```

`WinCelebration.tsx` and `ScoreCounter.tsx` are refactored to import from here instead of redeclaring the check — no behavior change, just dedup.

## Input + button feedback (CSS, `GuessInput.tsx`)

- **Keystroke feedback**: the input's underline (`border-signal`) briefly flashes brighter + slightly thicker via a CSS `@keyframes input-pulse` (~120ms), retriggered on every `handleChange` call. Implementation: a counter in state bumped per keystroke, used as a `key` on the underline element (or animation-restart-via-reflow) to force the CSS animation to replay.
- **Button press**: `active:scale-[0.97]` CSS transition (~100ms) added to the existing lock-in button classes — tactile tap feedback alongside the existing `disabled:opacity-45`.
- **Loading state**: replace the static `"Locking in…"` string with an animated three-dot ellipsis (`@keyframes dot-pulse` on three `<span>`s with staggered `animation-delay`), signaling "working" without JS.
- **Reduced motion**: these are sub-200ms feedback cues, not motion-sickness territory, so no full disable — but when `prefersReducedMotion()` is true, the button press falls back to an opacity-only `active:opacity-80` (no transform) instead of scale.

## Screen transition (idle → result, `motion` lib, `App.tsx`)

`App.tsx`'s phase-based conditional `return` (idle / result / joined) is wrapped in `motion`'s `AnimatePresence mode="wait"`, keyed by `phase`:

- **Idle exit**: fade + 12px slide-up-out, `SNAPPY` preset (180ms). Quick — doesn't block the user from seeing their result.
- **Result entrance**: fade + slide-up-in, `BOUNCY` spring (~320ms, slight overshoot). This is the once-a-day payoff moment.
- **Joined (leaderboard) transition**: reuses `SNAPPY` — secondary navigation, not a payoff.
- **Reduced motion**: when true, skip the animation props entirely (instant swap), rather than rendering a zero-duration animation.

The win path (`ResultScreen`'s `isWin` branch) inherits this same entrance. The existing confetti `useEffect` in `WinCelebration.tsx` gets a ~150ms delay added so it starts after the entrance settles rather than firing simultaneously.

## Result reveal sequence (`motion` lib, `ResultScreen.tsx` non-win path)

Children are currently rendered all at once. Stagger via `motion.div` variants, `STAGGER_MS` (90ms) step, `BOUNCY` spring per item:

1. **Answer count-up** (`ScoreCounter`) — wrapped in a scale pop-in (0.92→1) coinciding with the count-up start. First in sequence.
2. **Distance badge** (`DistanceBadge`) — fade+scale in, ~90ms after the answer.
3. **Odds rail** (`OddsRail`) — currently the fill bar and both pins render at full width/position instantly. Animate `rail-fill` width from 0→target and slide both pins in from the left edge, ~90ms after the badge. This is the richest animation since distance is the core payoff metric.
4. **Stat chips** (`StatChips`) — fade+slide-up last, ~90ms after the rail.

`JoinBoard` / `ShareButton` / `DarkButton` (the board-action row) are **not** part of the stagger — they appear with the rest of the static layout below the fold. Avoids over-animating secondary actions.

## Reduced motion & testing

- Single guard point: `prefersReducedMotion()` in `src/lib/motion.ts`.
- For `AnimatePresence`/stagger variants, reduced-motion sets `transition: { duration: 0 }` rather than removing the variant/animation structure entirely — keeps `AnimatePresence` enter/exit *logic* intact (so unmount timing doesn't break) while rendering instantly.
- Existing Vitest component tests mock `matchMedia` to reduced=true where animation timing would otherwise affect assertions (pattern already used for `ScoreCounter`/`WinCelebration` tests) — extend the same mock setup to new tests covering animated components.
- No new test framework. Tests assert on final DOM state, not intermediate animation frames.

## Out of scope

- Leaderboard/join screens.
- Tier-proportional badge intensity (bigger pop for better tiers) — flagged as a nice-to-have, not included in this pass.
- Any animation library beyond CSS + the already-installed `motion` package.
