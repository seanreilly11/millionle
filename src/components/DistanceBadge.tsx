import { getTier } from "../engine/copy";

export function DistanceBadge({ distance }: { distance: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-label tracking-badge uppercase px-3 py-1.5 rounded-full text-badge-text bg-signal-soft border border-badge-border">
      ◇ {getTier(distance).label}
    </div>
  );
}
