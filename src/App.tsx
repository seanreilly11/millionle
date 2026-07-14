import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getApi } from "./api/client";
import { MILLIONLE } from "./game.config";
import { localDate, puzzleNumber } from "./engine/date";
import { getUuid, getName, setName } from "./store/identity";
import type { GuessResponse, LeaderboardEntry } from "./api/types";
import { IdleScreen } from "./screens/IdleScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { AppShell } from "./components/AppShell";
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
  const [boardLoading, setBoardLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
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

  // Fetch the board whenever the leaderboard screen is shown - the name write
  // (submitName) must be committed before this read, so we do them in sequence
  // via the phase transition rather than racing them in parallel.
  useEffect(() => {
    if (phase !== "joined") return;
    let cancelled = false;
    setBoardLoading(true);
    api
      .leaderboard({ uuid: getUuid(), offset: offset() })
      .then((lb) => {
        if (!cancelled) setBoard(lb.entries);
      })
      .finally(() => {
        if (!cancelled) setBoardLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  async function handleJoin(name: string) {
    setJoining(true);
    setName(name);
    await api.submitName({ uuid: getUuid(), name, offset: offset() });
    setResult((r) => (r ? { ...r, hasJoined: true } : r));
    setPhase("joined");
    setJoining(false);
  }

  if (initializing) return <InitLoader />;

  const reduced = prefersReducedMotion();
  const transition = reduced ? { duration: 0 } : phase === "result" ? BOUNCY : SNAPPY;

  let content: React.ReactNode;
  if (phase === "idle") {
    content = <IdleScreen puzzle={puzzle} onGuess={handleGuess} loading={loading} />;
  } else if (phase === "joined" && result) {
    content = (
      <LeaderboardScreen
        puzzle={result.puzzle}
        entries={board}
        loading={boardLoading && board.length === 0}
        onBack={() => setPhase("result")}
      />
    );
  } else if (result) {
    content = (
      <ResultScreen
        result={result}
        guess={guess}
        defaultName={getName()}
        onJoin={handleJoin}
        onSeeLeaderboard={() => setPhase("joined")}
        joining={joining}
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
