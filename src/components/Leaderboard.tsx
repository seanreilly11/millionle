import { Fragment } from "react";
import type { LeaderboardEntry } from "../api/types";
import { formatNumber } from "../engine/format";

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="board">
      {entries.map((e, i) => (
        <Fragment key={e.rank}>
          {i > 0 && e.isMe && entries[i - 1].rank + 1 !== e.rank && (
            <div className="lb-gap" />
          )}
          <div className={`lb-row${e.isMe ? " me" : ""}`}>
            <span className="lb-rank">#{e.rank}</span>
            <span className="lb-name">{e.name}</span>
            <span className="lb-score">{formatNumber(e.score)}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
