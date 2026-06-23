import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdleScreen } from "./IdleScreen";

describe("IdleScreen", () => {
  test("shows puzzle number and forwards a guess", async () => {
    const onGuess = vi.fn();
    render(<IdleScreen puzzle={432} onGuess={onGuess} />);
    expect(screen.getByText(/No\. 432/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/your one guess/i), "412769");
    await userEvent.click(screen.getByRole("button", { name: /lock in guess/i }));
    expect(onGuess).toHaveBeenCalledWith(412769);
  });
});
