const ROWS = 8;

/** Placeholder rows shown while the leaderboard is loading. Mirrors the
 *  Leaderboard layout so the swap to real data doesn't shift the page. */
export function LeaderboardSkeleton() {
  return (
    <div
      className="mt-4 flex flex-col gap-1.5"
      aria-busy="true"
      aria-label="Loading leaderboard"
    >
      <div className="flex justify-between px-3.5 pb-1 text-xs uppercase tracking-wide text-steel font-mono">
        <span>name</span>
        <span>how close</span>
      </div>
      {Array.from({ length: ROWS }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3.5 py-4 border border-line rounded-xl bg-card"
        >
          <span className="skeleton-shimmer h-3 w-6 rounded" />
          <span className="skeleton-shimmer h-3.5 flex-1 mx-3 rounded max-w-32" />
          <span className="skeleton-shimmer h-3.5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
