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
        <ScoreCounter value={result.answer} />
        <div className="mt-5">
          <MonoLabel tracking="tracking-label">off by</MonoLabel>
          <div className="text-3xl font-extrabold">
            {formatNumber(result.distance)}
          </div>
        </div>
        <div className="mt-4">
          <DistanceBadge distance={result.distance} />
        </div>
      </section>

      <OddsRail guess={guess} answer={result.answer} />

      <div className="mt-6 text-sm text-steel">
        {result.hasJoined ? "You're" : "You'd sit at"}{" "}
        <b className="text-ink font-extrabold text-base">
          #{formatNumber(result.rank)}
        </b>{" "}
        on today's board.
      </div>

      <StatChips stats={result.stats} />
      <ShareButton
        puzzle={result.puzzle}
        guess={guess}
        distance={result.distance}
      />
      {boardAction}
    </AppShell>
  );
}
