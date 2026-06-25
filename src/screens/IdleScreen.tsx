import { GuessInput } from "../components/GuessInput";
import { AppShell } from "../components/AppShell";
import { GameHeader } from "../components/GameHeader";

export function IdleScreen({
  puzzle,
  onGuess,
  loading = false,
}: {
  puzzle: number;
  onGuess: (guess: number) => void;
  loading?: boolean;
}) {
  return (
    <AppShell>
      <GameHeader puzzle={puzzle} />
      <div className="text-center text-steel text-sm mt-7 leading-relaxed">
        <p>One hidden number, <b className="text-ink font-semibold">1 to 1,000,000</b>.</p>
        <p>One guess — can you get it?</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <GuessInput onSubmit={onGuess} loading={loading} />
      </div>
      <footer className="text-center space-y-1">
        <a href="/privacy" className="font-mono text-xs text-steel hover:text-ink tracking-wide">
          Privacy Policy
        </a>
        <p className="font-mono text-xs text-steel">© 2026 Sean Reilly</p>
      </footer>
    </AppShell>
  );
}
