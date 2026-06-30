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

  test("shows animated loading dots instead of static text while loading", () => {
    render(<GuessInput onSubmit={vi.fn()} loading={true} />);
    const button = screen.getByRole("button");
    expect(button.querySelectorAll(".loading-dots span")).toHaveLength(3);
    expect(screen.queryByText("Locking in…")).not.toBeInTheDocument();
  });

  test("keystrokes retrigger the input pulse animation", async () => {
    render(<GuessInput onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/your one guess/i);
    const underline = input.parentElement!;
    await userEvent.type(input, "1");
    const keyAfterFirst = underline.getAttribute("data-pulse-key");
    await userEvent.type(input, "2");
    const keyAfterSecond = underline.getAttribute("data-pulse-key");
    expect(keyAfterFirst).not.toBe(keyAfterSecond);
  });
});
