import type { GuessResponse } from "../api/types";
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
    <button className="go see-lb" onClick={onSeeLeaderboard}>
      See leaderboard
    </button>
  ) : (
    <JoinBoard defaultName={defaultName} onJoin={onJoin} />
  );

  if (isWin) {
    return (
      <div className="app winscr">
        <WinCelebration rank={result.rank} />
        {boardAction}
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
        <DistanceBadge distance={result.distance} />
      </div>

      <OddsRail guess={guess} answer={result.answer} />

      <div className="reveal">
        <div className="k">off by</div>
        <div className="n">{formatNumber(result.distance)}</div>
      </div>
      <div className="rankline">
        You'd sit at <b>#{formatNumber(result.rank)}</b> on today's board.
      </div>

      <StatChips stats={result.stats} />
      <ShareButton
        puzzle={result.puzzle}
        guess={guess}
        distance={result.distance}
      />
      {boardAction}
    </div>
  );
}
