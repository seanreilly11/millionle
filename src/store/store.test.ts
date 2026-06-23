import { describe, expect, test } from "vitest";
import { getUuid, getName, setName } from "./identity";
import { readHistory, appendHistory, findByDate } from "./history";

describe("identity", () => {
  test("creates and persists a uuid", () => {
    const a = getUuid();
    expect(a).toMatch(/[0-9a-f-]{36}/);
    expect(getUuid()).toBe(a);
  });
  test("stores and reads a name", () => {
    expect(getName()).toBe("");
    setName("seanr");
    expect(getName()).toBe("seanr");
  });
});

describe("history", () => {
  test("appends and finds by date, replacing same-date rows", () => {
    appendHistory({ date: "2026-06-23", guess: 412769, distance: 47231, score: 952769 });
    expect(findByDate("2026-06-23")?.score).toBe(952769);
    appendHistory({ date: "2026-06-23", guess: 1, distance: 0, score: 1_000_000 });
    expect(readHistory().filter((r) => r.date === "2026-06-23")).toHaveLength(1);
    expect(findByDate("2026-06-23")?.score).toBe(1_000_000);
  });
});
