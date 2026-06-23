import { tier } from "../engine/score";

export function DistanceBadge({ distance }: { distance: number }) {
  return <div className="badge near">◇ {tier(distance).label}</div>;
}
