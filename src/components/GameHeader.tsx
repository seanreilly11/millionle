export function GameHeader({ puzzle, suffix }: { puzzle: number; suffix?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-num font-black text-2xl leading-none tracking-tight">
        MILLI<span className="text-jackpot">O</span>NLE
      </h1>
      <div className="font-mono text-label tracking-puzzle text-steel uppercase">
        No. {puzzle}{suffix ? ` · ${suffix}` : ""}
      </div>
    </div>
  );
}
