import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { OddsRail } from "./OddsRail";

describe("OddsRail", () => {
  test("renders guess and answer labels with formatted numbers", () => {
    render(<OddsRail guess={412769} answer={365538} />);
    expect(screen.getByText(/412,769/)).toBeInTheDocument();
    expect(screen.getByText(/365,538/)).toBeInTheDocument();
  });
});
