import { describe, expect, test } from "vitest";
import { distance, score, tier } from "./score";

describe("scoring", () => {
  test("distance is absolute difference", () => {
    expect(distance(412769, 365538)).toBe(47231);
    expect(distance(100, 600)).toBe(500);
  });
  test("score is max minus distance", () => {
    expect(score(500000, 500000)).toBe(1_000_000);
    expect(score(412769, 365538)).toBe(952769);
    expect(score(1, 1_000_000)).toBe(1);
  });
});

describe("tier", () => {
  test("maps distance to the right tier id", () => {
    expect(tier(0).id).toBe("dead-on");
    expect(tier(5).id).toBe("within5");
    expect(tier(6).id).toBe("within100");
    expect(tier(100).id).toBe("within100");
    expect(tier(101).id).toBe("within2500");
    expect(tier(2500).id).toBe("within2500");
    expect(tier(2501).id).toBe("within50k");
    expect(tier(50000).id).toBe("within50k");
    expect(tier(50001).id).toBe("within250k");
    expect(tier(250000).id).toBe("within250k");
    expect(tier(250001).id).toBe("beyond");
  });
});
