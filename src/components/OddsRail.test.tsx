import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { OddsRail } from "./OddsRail";

describe("OddsRail", () => {
  test("renders guess and answer labels with formatted numbers", () => {
    render(<OddsRail guess={412769} answer={365538} />);
    expect(screen.getByText(/412,769/)).toBeInTheDocument();
    expect(screen.getByText(/365,538/)).toBeInTheDocument();
  });

  test("rail-fill and both pins are present with correct final positions", () => {
    render(<OddsRail guess={412769} answer={365538} />);
    // 412769 and 365538 are both close to the midpoint of 1-1,000,000
    const fill = screen.getByTestId("rail-fill");
    expect(fill).toBeInTheDocument();
    expect(screen.getByTestId("answer-pin")).toBeInTheDocument();
    expect(screen.getByTestId("guess-pin")).toBeInTheDocument();
  });
});
