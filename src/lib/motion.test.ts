import { describe, expect, test, vi, afterEach } from "vitest";
import { prefersReducedMotion, SNAPPY, BOUNCY, STAGGER_MS } from "./motion";

describe("prefersReducedMotion", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("returns true when matchMedia is undefined", () => {
    // @ts-expect-error - simulating an environment without matchMedia
    delete window.matchMedia;
    expect(prefersReducedMotion()).toBe(true);
  });

  test("returns true when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(prefersReducedMotion()).toBe(true);
  });

  test("returns false when the user has no motion preference", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("motion presets", () => {
  test("SNAPPY is a short ease-out tween", () => {
    expect(SNAPPY).toEqual({ duration: 0.18, ease: "easeOut" });
  });

  test("BOUNCY is a spring transition", () => {
    expect(BOUNCY).toEqual({ type: "spring", stiffness: 320, damping: 20 });
  });

  test("STAGGER_MS is defined", () => {
    expect(STAGGER_MS).toBe(90);
  });
});
