import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));
vi.mock("./api/client", async () => {
  const { mockApi } = await import("./api/mockApi");
  return { getApi: () => mockApi, mockApi };
});

describe("App flow", () => {
  beforeEach(() => localStorage.clear());

  test("idle → guess → result, then revisiting stays locked", async () => {
    const { unmount } = render(<App />);

    // Init loader runs for ≥1s — wait up to 2s for the idle screen
    const input = await screen.findByLabelText(/your one guess/i, {}, { timeout: 2000 });
    await userEvent.type(input, "500000");
    await userEvent.click(screen.getByRole("button", { name: /lock in guess/i }));

    await waitFor(() => expect(screen.getByText(/off by|one in a million/i)).toBeInTheDocument());

    unmount();
    render(<App />);

    // revisit: should not show the idle CTA again (wait ≥1s for init + result restore)
    await waitFor(
      () => expect(screen.queryByRole("button", { name: /lock in guess/i })).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
}, 10000); // 10s suite timeout — two ≥1s init waits
