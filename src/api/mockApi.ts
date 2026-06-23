import type {
  GameApi,
  GuessRequest,
  GuessResponse,
  NameRequest,
  NameResponse,
  LeaderboardRequest,
  LeaderboardResponse,
  LeaderboardEntry,
} from "./types";
import { MILLIONLE } from "../game.config";
import { answerForDate } from "../engine/answer";
import {
  score as scoreFn,
  distance as distanceFn,
  tier,
} from "../engine/score";
import { localDate, puzzleNumber } from "../engine/date";
import { computeStats, type GuessRow } from "../engine/stats";
import { seededRandom } from "../engine/prng";
import { readHistory, appendHistory, findByDate } from "../store/history";
import { getName } from "../store/identity";

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
  score: number;
  isMe: boolean;
}

/** Deterministic synthetic opponents for a date. */
function syntheticBoard(date: string): { name: string; score: number }[] {
  const rand = seededRandom(`board:${date}`);
  const count = 40 + Math.floor(rand() * 60); // 40-99 opponents
  const rows: { name: string; score: number }[] = [];
  for (let i = 0; i < count; i++) {
    // skew toward high scores so the board feels competitive
    const s = 1_000_000 - Math.floor(Math.pow(rand(), 2) * 1_000_000);
    rows.push({ name: `${FAKE_NAMES[i % FAKE_NAMES.length]}${i}`, score: s });
  }
  return rows;
}

function namedKey(date: string) {
  return `millionle.named.${date}`;
}

function getMyName(date: string): string | null {
  return localStorage.getItem(namedKey(date));
}

function rankFor(myScore: number, date: string): number {
  const better = syntheticBoard(date).filter((o) => o.score > myScore).length;
  return better + 1;
}

export const mockApi: GameApi = {
  async guess(req: GuessRequest): Promise<GuessResponse> {
    await wait();
    const date = localDate(req.offset);
    const answer = answerForDate(MILLIONLE, date);
    const existing = findByDate(date);

    let row: GuessRow;
    let alreadyPlayed = false;
    if (existing) {
      alreadyPlayed = true;
      row = { date, distance: existing.distance, score: existing.score };
    } else {
      const dist = distanceFn(req.guess, answer);
      const sc = scoreFn(req.guess, answer);
      appendHistory({ date, guess: req.guess, distance: dist, score: sc });
      row = { date, distance: dist, score: sc };
    }

    const stats = computeStats(
      readHistory().map((r) => ({
        date: r.date,
        distance: r.distance,
        score: r.score,
      })),
      date,
    );

    return {
      score: row.score,
      distance: row.distance,
      answer,
      rank: rankFor(row.score, date),
      alreadyPlayed,
      tier: tier(row.distance).id,
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
    localStorage.setItem(namedKey(date), req.name);
    return { ok: true, rank: rankFor(row.score, date) };
  },

  async leaderboard(req: LeaderboardRequest): Promise<LeaderboardResponse> {
    await wait();
    const date = req.date ?? localDate(req.offset ?? 0);
    const limit = req.limit ?? 100;
    const rows: BoardRow[] = syntheticBoard(date).map((o) => ({
      ...o,
      isMe: false,
    }));

    const myRow = findByDate(date);
    const myName = getMyName(date) ?? getName();
    let myRank: number | null = null;
    if (myRow && getMyName(date)) {
      rows.push({ name: myName || "you", score: myRow.score, isMe: true });
    }

    rows.sort((a, b) => b.score - a.score);
    const ranked: LeaderboardEntry[] = rows.map((r, i) => {
      const entry = { rank: i + 1, name: r.name, score: r.score, isMe: r.isMe };
      if (r.isMe) myRank = entry.rank;
      return entry;
    });

    return { date, entries: ranked.slice(0, limit), myRank };
  },
};
