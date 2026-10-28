import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DEMO_HREF } from "@/content/copy/landing";
import { PATHWAYS } from "@/content/pathways";
import { Hero } from "./hero";
import { PathwaysExplorer } from "./pathways-explorer";

describe("Hero", () => {
  it("names the product in the page's only h1 and links to the demo", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Beyond Blue");
    expect(screen.getByRole("link", { name: /Try the demo as Veronica/ })).toHaveAttribute(
      "href",
      DEMO_HREF,
    );
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
