import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getApi } from "./api/client";
import { MILLIONLE } from "./game.config";
import { localDate, puzzleNumber } from "./engine/date";
import { getUuid, getName, setName } from "./store/identity";
import type { GuessResponse, LeaderboardEntry } from "./api/types";
import { IdleScreen } from "./screens/IdleScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { Leaderboard } from "./components/Leaderboard";
import { AppShell } from "./components/AppShell";
import { GameHeader } from "./components/GameHeader";
import { InitLoader } from "./components/InitLoader";
import { prefersReducedMotion, SNAPPY, BOUNCY } from "./lib/motion";

type Phase = "idle" | "result" | "joined";
const offset = () => -new Date().getTimezoneOffset();

const exitVariant = { opacity: 0, y: -12 };
const enterVariant = { opacity: 0, y: 12 };
const restVariant = { opacity: 1, y: 0 };

export default function App() {
  const api = getApi();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [guess, setGuess] = useState(0);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const date = localDate(offset());
  const puzzle = puzzleNumber(MILLIONLE.launch, date);

  // On load, check the server for today's result (works across devices).
  useEffect(() => {
    async function checkExisting() {
      const [r] = await Promise.all([
        api.result({ uuid: getUuid(), offset: offset() }),
        new Promise<void>((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (r.played) {
        setGuess(r.guess);
        setResult(r);
        setPhase("result");
      }
      setInitializing(false);
    }
    checkExisting();
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
    setResult((r) => r ? { ...r, hasJoined: true } : r);
  }

  async function loadLeaderboard() {
    const lb = await api.leaderboard({ uuid: getUuid(), offset: offset() });
    setBoard(lb.entries);
    setPhase("joined");
  }

  if (initializing) return <InitLoader />;

  const reduced = prefersReducedMotion();
  const transition = reduced ? { duration: 0 } : phase === "result" ? BOUNCY : SNAPPY;

  let content: React.ReactNode;
  if (phase === "idle") {
    content = <IdleScreen puzzle={puzzle} onGuess={handleGuess} loading={loading} />;
  } else if (phase === "joined" && result) {
    content = (
      <AppShell>
        <GameHeader puzzle={result.puzzle} suffix="on the board" />
        <button
          className="mt-3 bg-transparent text-steel font-mono text-xs tracking-wide py-3 -mx-2 px-2 text-left hover:text-ink border-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:outline-none rounded"
          onClick={() => setPhase("result")}
        >
          ← Back to result
        </button>
        <Leaderboard entries={board} />
      </AppShell>
    );
  } else if (result) {
    content = (
      <ResultScreen
        result={result}
        guess={guess}
        defaultName={getName()}
        onJoin={handleJoin}
        onSeeLeaderboard={loadLeaderboard}
      />
    );
  } else {
    content = <AppShell aria-busy={loading}><span className="sr-only">Loading…</span></AppShell>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={reduced ? restVariant : enterVariant}
        animate={restVariant}
        exit={reduced ? restVariant : exitVariant}
        transition={transition}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
