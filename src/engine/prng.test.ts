import { describe, expect, test } from "vitest";
import { seededRandom } from "./prng";

describe("seededRandom", () => {
  test("is deterministic for the same key", () => {
    const a = seededRandom("millionle:2026-06-23")();
    const b = seededRandom("millionle:2026-06-23")();
    expect(a).toBe(b);
  });
  test("differs across keys", () => {
    const a = seededRandom("millionle:2026-06-23")();
    const b = seededRandom("millionle:2026-06-24")();
    expect(a).not.toBe(b);
  });
  test("returns a float in [0,1)", () => {
    const v = seededRandom("x")();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});
