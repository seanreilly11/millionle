import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultScreen } from "./ResultScreen";
import type { GuessResponse } from "../api/types";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const base: GuessResponse = {
  distance: 47231,
  answer: 365538,
  rank: 1243,
  alreadyPlayed: false,
  hasJoined: false,
  tier: "within50k",
  date: "2026-06-23",
  puzzle: 432,
  stats: { streak: 7, closestEver: 312, longestStreak: 7, totalPlays: 14, averageDistance: 1500 },
};

describe("ResultScreen", () => {
  test("loss variant shows distance, rank and stats", () => {
    render(
      <ResultScreen
        result={base}
        guess={412769}
        defaultName="seanr"
        onJoin={vi.fn()}
        onSeeLeaderboard={vi.fn()}
      />,
    );
    expect(screen.getByText("47,231")).toBeInTheDocument();
    expect(screen.getByText(/#1,243/)).toBeInTheDocument();
  });
  test("win variant shows the detonation and no stat bar", () => {
    const win = {
      ...base,
      distance: 0,
      answer: 500000,
      tier: "dead-on" as const,
      rank: 1,
    };
    render(
      <ResultScreen
        result={win}
        guess={500000}
        defaultName="seanr"
        onJoin={vi.fn()}
        onSeeLeaderboard={vi.fn()}
      />,
    );
    expect(screen.getByText(/one in a million/i)).toBeInTheDocument();
    expect(screen.queryByText("Lifetime points")).not.toBeInTheDocument();
  });
});
