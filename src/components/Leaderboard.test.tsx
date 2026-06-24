import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "./Leaderboard";

describe("Leaderboard", () => {
  test("renders entries and marks the player row", () => {
    render(<Leaderboard entries={[
      { rank: 1, name: "ava1", distance: 1, isMe: false },
      { rank: 2, name: "seanr", distance: 47231, isMe: true },
    ]} />);
    expect(screen.getByText("ava1")).toBeInTheDocument();
    expect(screen.getByText("off by 47,231")).toBeInTheDocument();
    expect(screen.getByText("seanr").closest(".lb-row")).toHaveClass("me");
  });
  test("shows dead on for distance 0", () => {
    render(<Leaderboard entries={[
      { rank: 1, name: "ace0", distance: 0, isMe: false },
    ]} />);
    expect(screen.getByText("dead on")).toBeInTheDocument();
  });
});
