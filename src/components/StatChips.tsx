import type { Stats } from "../engine/stats";
import { formatNumber } from "../engine/format";

export function StatChips({ stats }: { stats: Stats }) {
  return (
    <>
      <div className="chips">
        <div className="chip"><div className="k">Streak</div><div className="v">{stats.streak}</div></div>
        <div className="chip"><div className="k">Closest ever</div><div className="v">{formatNumber(stats.closestEver)}</div></div>
      </div>
      <div className="statbar">
        <span className="k">Lifetime points</span>
        <span className="bv">{formatNumber(stats.lifetimePoints)}</span>
      </div>
    </>
  );
}
