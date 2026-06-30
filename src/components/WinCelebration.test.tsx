import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import confetti from "canvas-confetti";
import { WinCelebration } from "./WinCelebration";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("WinCelebration", () => {
  test("shows the perfect score and rank", () => {
    render(<WinCelebration rank={1} />);
    expect(screen.getByText("1,000,000")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  describe("confetti loop cancellation", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.mocked(confetti).mockClear();
      // prefersReducedMotion() treats "no matchMedia" as reduced motion, so
      // stub it here to exercise the confetti loop.
      vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({ matches: false }),
      );
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    test("stops calling confetti once unmounted mid-burst", () => {
      const { unmount } = render(<WinCelebration rank={1} />);

      // Advance past the pre-burst delay so the rAF loop starts.
      vi.advanceTimersByTime(150);
      expect(vi.mocked(confetti)).toHaveBeenCalled();

      const callsBeforeUnmount = vi.mocked(confetti).mock.calls.length;
      unmount();

      // Advance well past the 1200ms burst window. If the loop were still
      // running, this would trigger many more confetti() calls.
      vi.advanceTimersByTime(2000);

      expect(vi.mocked(confetti).mock.calls.length).toBe(callsBeforeUnmount);
    });
  });
});
