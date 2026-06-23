import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuessInput } from "./GuessInput";

describe("GuessInput", () => {
  test("formats input with commas and enables submit on valid value", async () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/your one guess/i);
    await userEvent.type(input, "412769");
    expect(input).toHaveValue("412,769");
    await userEvent.click(screen.getByRole("button", { name: /lock in guess/i }));
    expect(onSubmit).toHaveBeenCalledWith(412769);
  });

  test("keeps submit disabled for invalid input", async () => {
    const onSubmit = vi.fn();
    render(<GuessInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/your one guess/i);
    await userEvent.type(input, "0");
    expect(screen.getByRole("button", { name: /lock in guess/i })).toBeDisabled();
  });
});
