import type { LeaderboardEntry } from "../api/types";
import { AppShell } from "../components/AppShell";
import { GameHeader } from "../components/GameHeader";
import { Leaderboard } from "../components/Leaderboard";
import { LeaderboardSkeleton } from "../components/LeaderboardSkeleton";

export function LeaderboardScreen({
  puzzle,
  entries,
  loading,
  onBack,
}: {
  puzzle: number;
  entries: LeaderboardEntry[];
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <AppShell>
      <GameHeader puzzle={puzzle} suffix="on the board" />
      <button
        className="mt-3 bg-transparent text-steel font-mono text-xs tracking-wide py-3 -mx-2 px-2 text-left hover:text-ink border-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none rounded"
        onClick={onBack}
      >
        ← Back to result
      </button>
      {loading ? <LeaderboardSkeleton /> : <Leaderboard entries={entries} />}
    </AppShell>
  );
}
