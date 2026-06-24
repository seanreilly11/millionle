import { describe, test, expect } from "vitest";
import { isProfane } from "./profanity";

describe("isProfane", () => {
  test("clean names pass", () => {
    expect(isProfane("sean")).toBe(false);
    expect(isProfane("MillionPlayer")).toBe(false);
    expect(isProfane("x")).toBe(false);
  });

  test("direct profanity is caught", () => {
    expect(isProfane("fuck")).toBe(true);
    expect(isProfane("shit")).toBe(true);
    expect(isProfane("cunt")).toBe(true);
  });

  test("profanity embedded in a name is caught", () => {
    expect(isProfane("bigdick")).toBe(true);
    expect(isProfane("shutthefuckup")).toBe(true);
  });

  test("leet-speak substitutions are caught", () => {
    expect(isProfane("fUcK")).toBe(true);  // case
    expect(isProfane("sh1t")).toBe(true);   // 1 → i
    expect(isProfane("@ss")).toBe(true);    // @ → a
  });
});
