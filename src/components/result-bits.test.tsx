import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DistanceBadge } from "./DistanceBadge";
import { StatChips } from "./StatChips";
import { JoinBoard } from "./JoinBoard";

describe("result bits", () => {
  test("DistanceBadge shows the tier label", () => {
    render(<DistanceBadge distance={47231} />);
    expect(screen.getByText(/within 50k/i)).toBeInTheDocument();
  });
  test("StatChips show streak and closest ever", () => {
    render(<StatChips stats={{ streak: 7, closestEver: 312 }} />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("312")).toBeInTheDocument();
  });
  test("JoinBoard submits the autofilled name", async () => {
    const onJoin = vi.fn();
    render(<JoinBoard defaultName="seanr" onJoin={onJoin} />);
    await userEvent.click(screen.getByRole("button", { name: /join/i }));
    expect(onJoin).toHaveBeenCalledWith("seanr");
  });
});
