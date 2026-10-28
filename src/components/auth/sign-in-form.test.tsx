import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestMagicLink } from "@/lib/actions/auth";
import { EMAIL_UNAVAILABLE } from "@/lib/auth/errors";
import { SignInForm } from "./sign-in-form";

// The real actions are server-only; the form only needs their results.
vi.mock("@/lib/actions/auth", () => ({ requestMagicLink: vi.fn() }));
vi.mock("@/lib/actions/demo", () => ({ startDemo: vi.fn(), startStaffDemo: vi.fn() }));

const send = vi.mocked(requestMagicLink);

async function submit() {
  const user = userEvent.setup();
  render(<SignInForm />);
  await user.type(screen.getByLabelText("Email"), "veronica@bluefieldstate.edu");
  await user.click(screen.getByRole("button", { name: "Email me a sign-in link" }));
}

describe("SignInForm", () => {
  beforeEach(() => send.mockReset());

  it("offers both demos when the sign-in email can't be sent", async () => {
    send.mockResolvedValue({ ok: false, error: "Please try again.", code: EMAIL_UNAVAILABLE });
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We can't send sign-in emails just now.",
    );
    expect(screen.getByRole("button", { name: /Try the demo as Veronica/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View as staff \(demo\)/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("keeps other errors on the email field", async () => {
    send.mockResolvedValue({ ok: false, error: "Too many sign-in attempts." });
    await submit();
    expect(await screen.findByText("Too many sign-in attempts.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Try the demo/ })).not.toBeInTheDocument();
  });
});
