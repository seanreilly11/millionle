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
