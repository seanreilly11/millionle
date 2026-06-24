import { useEffect, useState } from "react";
import { getApi } from "./api/client";
import { MILLIONLE } from "./game.config";
import { localDate, puzzleNumber } from "./engine/date";
import { getUuid, getName, setName } from "./store/identity";
import { findByDate } from "./store/history";
import type { GuessResponse, LeaderboardEntry } from "./api/types";
import { IdleScreen } from "./screens/IdleScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Leaderboard } from "./components/Leaderboard";
import { AppShell } from "./components/AppShell";
import { GameHeader } from "./components/GameHeader";

type Phase = "idle" | "result" | "joined";
const offset = () => -new Date().getTimezoneOffset();

export default function App() {
  const api = getApi();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [guess, setGuess] = useState(0);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const date = localDate(offset());
  const puzzle = puzzleNumber(MILLIONLE.launch, date);

  // Revisit: if today's guess already exists, recover the result state.
  useEffect(() => {
    const existing = findByDate(date);
    if (existing && !result) {
      setGuess(existing.guess);
      api
        .guess({ uuid: getUuid(), guess: existing.guess, offset: offset() })
        .then((r) => {
          setResult(r);
          setPhase("result");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGuess(g: number) {
    setLoading(true);
    setGuess(g);
    const r = await api.guess({ uuid: getUuid(), guess: g, offset: offset() });
    setResult(r);
    setPhase("result");
    setLoading(false);
  }

  async function handleJoin(name: string) {
    setName(name);
    await api.submitName({ uuid: getUuid(), name, offset: offset() });
    await loadLeaderboard();
  }

  async function loadLeaderboard() {
    const lb = await api.leaderboard({ uuid: getUuid(), offset: offset() });
    setBoard(lb.entries);
    setPhase("joined");
  }

  if (phase === "idle")
    return <IdleScreen puzzle={puzzle} onGuess={handleGuess} />;

  if (phase === "joined" && result) {
    return (
      <AppShell>
        <GameHeader puzzle={result.puzzle} suffix="on the board" />
        <button
          className="mt-3 bg-transparent text-steel font-mono text-xs tracking-wide p-0 text-left hover:text-ink border-none"
          onClick={() => setPhase("result")}
        >
          ← Back to result
        </button>
        <Leaderboard entries={board} />
      </AppShell>
    );
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        guess={guess}
        defaultName={getName()}
        onJoin={handleJoin}
        onSeeLeaderboard={loadLeaderboard}
      />
    );
  }

  return <AppShell aria-busy={loading} />;
}
