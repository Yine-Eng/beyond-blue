import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PATHWAYS } from "@/content/pathways";
import { Hero } from "./hero";
import { PathwaysExplorer } from "./pathways-explorer";

// The real action is server-only; the hero only needs something to post to.
vi.mock("@/lib/actions/demo", () => ({ startDemo: vi.fn() }));

describe("Hero", () => {
  it("names the product in the page's only h1 and offers the demo as a button", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Beyond Blue");
    // A form button, not a link, so router prefetching can never start demo sessions.
    expect(screen.getByRole("button", { name: /Try the demo as Veronica/ })).toBeInTheDocument();
  });
});

describe("PathwaysExplorer", () => {
  it("lists all five pathways from the deck", () => {
    expect(PATHWAYS.map((p) => p.name)).toEqual([
      "Hired",
      "Job Search",
      "Higher Education",
      "Entrepreneurship",
      "Still Deciding",
    ]);
    PATHWAYS.forEach((p) => expect(p.focus).toHaveLength(3));
  });

  it("switches pathways with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<PathwaysExplorer />);
    const hired = screen.getByRole("tab", { name: "Hired" });
    expect(hired).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("I already have a job.");

    hired.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Job Search" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("I'm looking for work.");
  });
});
