import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Doodle, MarkerHeading, PaperCard, Sticker, Tape } from ".";

describe("scrapbook kit", () => {
  it("hides every decoration from assistive technology", () => {
    const { container } = render(
      <PaperCard variant="torn">
        <Tape />
        <Doodle name="star" />
        <p>Content</p>
      </PaperCard>,
    );
    const decorations = container.querySelectorAll("svg, [data-slot=paper-card] > span");
    expect(decorations.length).toBeGreaterThan(0);
    decorations.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });

  it("keeps card content readable", () => {
    render(
      <PaperCard variant="spiral">
        <p>Your next 100 days, mapped out.</p>
      </PaperCard>,
    );
    expect(screen.getByText("Your next 100 days, mapped out.")).toBeVisible();
  });

  it("renders marker headings as real headings with the given level", () => {
    render(
      <MarkerHeading as="h1" underline>
        Veronica starts her path.
      </MarkerHeading>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Veronica starts her path." }),
    ).toBeInTheDocument();
  });

  it("applies the pinned tilt as a CSS variable", () => {
    render(<Sticker tilt={2}>68%</Sticker>);
    expect(screen.getByText("68%").style.getPropertyValue("--tilt")).toBe("2deg");
  });
});
