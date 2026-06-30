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

      {/*
        Index 2 is skipped (StatChips uses 3): OddsRail has its own internal
        stagger (see OddsRail.tsx) and isn't wrapped here, so index 2's delay
        slot is left for it. This is an approximate stagger reservation, not a
        verified "settle then next" handoff - the BOUNCY spring's own settle
        time means these animations overlap in practice, which is fine visually.
      */}
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
