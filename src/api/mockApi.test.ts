import { describe, expect, test, beforeEach } from "vitest";
import { mockApi } from "./mockApi";
import { getUuid } from "../store/identity";
import { answerForDate } from "../engine/answer";
import { MILLIONLE } from "../game.config";
import { localDate } from "../engine/date";

const offset = 0;

describe("mockApi.guess", () => {
  beforeEach(() => localStorage.clear());

  test("returns the answer and distance", async () => {
    const uuid = getUuid();
    const date = localDate(offset);
    const answer = answerForDate(MILLIONLE, date);
    const res = await mockApi.guess({ uuid, guess: answer, offset });
    expect(res.answer).toBe(answer);
    expect(res.distance).toBe(0);
    expect(res.tier).toBe("dead-on");
    expect(res.alreadyPlayed).toBe(false);
  });

  test("second guess same day returns stored row with alreadyPlayed", async () => {
    const uuid = getUuid();
    const first = await mockApi.guess({ uuid, guess: 500000, offset });
    const second = await mockApi.guess({ uuid, guess: 1, offset });
    expect(second.alreadyPlayed).toBe(true);
    expect(second.distance).toBe(first.distance);
  });

  test("rank is a positive integer", async () => {
    const uuid = getUuid();
    const res = await mockApi.guess({ uuid, guess: 500000, offset });
    expect(res.rank).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(res.rank)).toBe(true);
  });
});

describe("mockApi.submitName + leaderboard", () => {
  beforeEach(() => localStorage.clear());

  test("named player appears on the board as isMe", async () => {
    const uuid = getUuid();
    await mockApi.guess({ uuid, guess: 999999, offset });
    await mockApi.submitName({ uuid, name: "seanr", offset });
    const board = await mockApi.leaderboard({ uuid, offset, limit: 100 });
    const me = board.entries.find((e) => e.isMe);
    expect(me?.name).toBe("seanr");
    expect(board.myRank).toBe(me?.rank);
  });
});
