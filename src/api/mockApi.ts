import type {
  GameApi,
  GuessRequest,
  GuessResponse,
  NameRequest,
  NameResponse,
  LeaderboardRequest,
  LeaderboardResponse,
  LeaderboardEntry,
  ResultRequest,
} from "./types";
import { MILLIONLE } from "../game.config";
import { answerForDate } from "../engine/answer";
import {
  distance as distanceFn,
  tier,
} from "../engine/score";
import { localDate, puzzleNumber } from "../engine/date";
import { computeStats } from "../engine/stats";
import { seededRandom } from "../engine/prng";
import { readHistory, appendHistory, findByDate } from "../store/history";

const LATENCY = 250;
const wait = () => new Promise((r) => setTimeout(r, LATENCY));

const FAKE_NAMES = [
  "ava",
  "kai",
  "noah",
  "mia",
  "leo",
  "zoe",
  "ravi",
  "ivy",
  "omar",
  "luna",
  "finn",
  "nia",
  "theo",
  "remy",
  "june",
  "cole",
  "sage",
  "wren",
  "dax",
  "iris",
];

interface BoardRow {
  name: string;
  distance: number;
  isMe: boolean;
}

/** Deterministic synthetic opponents for a date. */
function syntheticBoard(date: string): { name: string; distance: number }[] {
  const rand = seededRandom(`board:${date}`);
  const count = 40 + Math.floor(rand() * 60); // 40-99 opponents
  const rows: { name: string; distance: number }[] = [];
  for (let i = 0; i < count; i++) {
    // skew toward low distances so the board feels competitive
    const d = Math.floor(Math.pow(rand(), 2) * 1_000_000);
    rows.push({ name: `${FAKE_NAMES[i % FAKE_NAMES.length]}${i}`, distance: d });
  }
  return rows;
}

function rankFor(myDistance: number, date: string): number {
  const better = syntheticBoard(date).filter((o) => o.distance < myDistance).length;
  return better + 1;
}

export const mockApi: GameApi = {
  async guess(req: GuessRequest): Promise<GuessResponse> {
    await wait();
    const date = localDate(req.offset);
    const answer = answerForDate(MILLIONLE, date);
    const existing = findByDate(date);

    let dist: number;
    let alreadyPlayed = false;
    if (existing) {
      alreadyPlayed = true;
      dist = existing.distance;
    } else {
      dist = distanceFn(req.guess, answer);
      appendHistory({ date, guess: req.guess, distance: dist });
    }

    const stats = computeStats(
      readHistory().map((r) => ({ date: r.date, distance: r.distance })),
      date,
    );

    return {
      distance: dist,
      answer,
      rank: rankFor(dist, date),
      alreadyPlayed,
      hasJoined: false,
      tier: tier(dist).id,
      date,
      puzzle: puzzleNumber(MILLIONLE.launch, date),
      stats,
    };
  },

  async submitName(req: NameRequest): Promise<NameResponse> {
    await wait();
    const date = localDate(req.offset);
    const row = findByDate(date);
    if (!row) throw new Error("no entry for date");
    return { ok: true, rank: rankFor(row.distance, date) };
  },

  async leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse> {
    await wait();
    const date = req.date ?? localDate(req.offset ?? 0);
    const rows: BoardRow[] = syntheticBoard(date).map((o) => ({ ...o, isMe: false }));

    let myRank: number | null = null;

    rows.sort((a, b) => a.distance - b.distance);
    const ranked: LeaderboardEntry[] = rows.map((r, i) => {
      const entry = { rank: i + 1, name: r.name, distance: r.distance, isMe: r.isMe };
      if (r.isMe) myRank = entry.rank;
      return entry;
    });

    const top10 = ranked.slice(0, 10);
    const myEntry = myRank !== null && myRank > 10 ? ranked[myRank - 1] : null;
    const entries = myEntry ? [...top10, myEntry] : top10;

    return { date, entries, myRank };
  },

  async result(req: ResultRequest) {
    await wait();
    const date = localDate(req.offset);
    const existing = findByDate(date);
    if (!existing) return { played: false as const };

    const answer = answerForDate(MILLIONLE, date);
    const stats = computeStats(
      readHistory().map((r) => ({ date: r.date, distance: r.distance })),
      date,
    );
    return {
      played: true as const,
      guess: existing.guess,
      distance: existing.distance,
      answer,
      rank: rankFor(existing.distance, date),
      hasJoined: false,
      tier: tier(existing.distance).id,
      date,
      puzzle: puzzleNumber(MILLIONLE.launch, date),
      stats,
    };
  },
};
