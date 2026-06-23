import { describe, expect, test } from "vitest";
import { answerForDate } from "./answer";
import { MILLIONLE } from "../game.config";

describe("answerForDate", () => {
  test("is deterministic for a date", () => {
    expect(answerForDate(MILLIONLE, "2026-06-23")).toBe(answerForDate(MILLIONLE, "2026-06-23"));
  });
  test("stays within [min,max]", () => {
    for (const d of ["2026-01-01", "2026-06-23", "2026-12-31", "2027-03-15"]) {
      const a = answerForDate(MILLIONLE, d);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(1_000_000);
      expect(Number.isInteger(a)).toBe(true);
    }
  });
  test("varies day to day", () => {
    expect(answerForDate(MILLIONLE, "2026-06-23")).not.toBe(answerForDate(MILLIONLE, "2026-06-24"));
  });
});
