import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreCounter } from "./ScoreCounter";

describe("ScoreCounter", () => {
  test("renders the final formatted value", () => {
    render(<ScoreCounter value={952769} />);
    expect(screen.getByText("952,769")).toBeInTheDocument();
  });
});
