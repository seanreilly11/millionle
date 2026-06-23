import { describe, expect, test } from "vitest";
import { formatNumber, parseGuess } from "./format";

describe("formatNumber", () => {
  test("groups thousands", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(412769)).toBe("412,769");
    expect(formatNumber(7)).toBe("7");
  });
});

describe("parseGuess", () => {
  test("accepts valid whole numbers and strips commas", () => {
    expect(parseGuess("412,769")).toBe(412769);
    expect(parseGuess("1")).toBe(1);
    expect(parseGuess("1000000")).toBe(1000000);
  });
  test("rejects out-of-range, zero, non-integer, empty", () => {
    expect(parseGuess("0")).toBeNull();
    expect(parseGuess("1000001")).toBeNull();
    expect(parseGuess("12.5")).toBeNull();
    expect(parseGuess("")).toBeNull();
    expect(parseGuess("abc")).toBeNull();
    expect(parseGuess("-5")).toBeNull();
  });
});
