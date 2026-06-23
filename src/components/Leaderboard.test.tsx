import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "./Leaderboard";

describe("Leaderboard", () => {
  test("renders entries and marks the player row", () => {
    render(<Leaderboard entries={[
      { rank: 1, name: "ava1", score: 999999, isMe: false },
      { rank: 2, name: "seanr", score: 952769, isMe: true },
    ]} />);
    expect(screen.getByText("ava1")).toBeInTheDocument();
    expect(screen.getByText("952,769")).toBeInTheDocument();
    expect(screen.getByText("seanr").closest(".lb-row")).toHaveClass("me");
  });
});
