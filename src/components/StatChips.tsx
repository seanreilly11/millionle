import type { Stats } from "../engine/stats";
import { formatNumber } from "../engine/format";

export function StatChips({ stats }: { stats: Stats }) {
  return (
    <div className="flex gap-2.5 mt-4">
      <div className="flex-1 border border-line rounded-xl p-3 bg-card2">
        <div className="font-mono text-2xs tracking-label text-steel uppercase">Streak</div>
        <div className="text-2xl font-extrabold mt-1">{stats.streak}</div>
      </div>
      <div className="flex-1 border border-line rounded-xl p-3 bg-card2">
        <div className="font-mono text-2xs tracking-label text-steel uppercase">Closest ever</div>
        <div className="text-2xl font-extrabold mt-1">{formatNumber(stats.closestEver)}</div>
      </div>
    </div>
  );
}
