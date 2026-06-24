import { Fragment } from "react";
import type { LeaderboardEntry } from "../api/types";
import { formatNumber } from "../engine/format";

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <div className="flex justify-between px-3.5 pb-1 text-xs uppercase tracking-wide text-steel font-mono">
        <span>name</span>
        <span>how close</span>
      </div>
      {entries.map((e, i) => (
        <Fragment key={e.rank}>
          {i > 0 && e.isMe && entries[i - 1].rank + 1 !== e.rank && (
            <div className="h-px bg-line my-1" />
          )}
          <div className={`flex items-center justify-between px-3.5 py-3 border border-line rounded-xl bg-card${e.isMe ? " border-signal bg-signal-soft" : ""}`}>
            <span className="font-mono text-xs text-steel w-11">#{e.rank}</span>
            <span className="font-bold flex-1">{e.name}</span>
            <span className="font-extrabold tabular-nums">{e.distance === 0 ? "dead on" : formatNumber(e.distance)}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
