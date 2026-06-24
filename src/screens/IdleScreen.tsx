import { GuessInput } from "../components/GuessInput";
import { AppShell } from "../components/AppShell";
import { GameHeader } from "../components/GameHeader";

export function IdleScreen({
  puzzle,
  onGuess,
}: {
  puzzle: number;
  onGuess: (guess: number) => void;
}) {
  return (
    <AppShell>
      <GameHeader puzzle={puzzle} />
      <div className="text-center text-steel text-sm mt-7 leading-relaxed">
        <p>One hidden number, <b className="text-ink font-semibold">1 to 1,000,000</b>.</p>
        <p>One guess — can you get it?</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <GuessInput onSubmit={onGuess} />
      </div>
    </AppShell>
  );
}
