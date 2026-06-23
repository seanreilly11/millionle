import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WinCelebration } from "./WinCelebration";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("WinCelebration", () => {
  test("shows the perfect score and rank", () => {
    render(<WinCelebration rank={1} />);
    expect(screen.getByText("1,000,000")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });
});
