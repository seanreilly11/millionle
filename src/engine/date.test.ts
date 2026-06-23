import { describe, expect, test } from "vitest";
import { localDate, addDays, puzzleNumber } from "./date";

describe("localDate", () => {
  test("applies positive offset", () => {
    // 2026-06-23T23:30Z + 60min = 2026-06-24 local
    const now = new Date("2026-06-23T23:30:00Z");
    expect(localDate(60, now)).toBe("2026-06-24");
  });
  test("applies negative offset", () => {
    // 2026-06-23T00:30Z - 60min = 2026-06-22 local
    const now = new Date("2026-06-23T00:30:00Z");
    expect(localDate(-60, now)).toBe("2026-06-22");
  });
  test("clamps offset to the real-world range", () => {
    const now = new Date("2026-06-23T12:00:00Z");
    expect(localDate(999999, now)).toBe(localDate(840, now));
    expect(localDate(-999999, now)).toBe(localDate(-720, now));
  });
});

describe("addDays", () => {
  test("moves the date", () => {
    expect(addDays("2026-06-23", -1)).toBe("2026-06-22");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("puzzleNumber", () => {
  test("launch date is puzzle #1", () => {
    expect(puzzleNumber("2026-01-01", "2026-01-01")).toBe(1);
    expect(puzzleNumber("2026-01-01", "2026-01-10")).toBe(10);
  });
});
