// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getSiteUrl } from "./site-url";

describe("getSiteUrl", () => {
  it("prefers the explicit production URL", () => {
    expect(
      getSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://beyond-blue-vert.vercel.app",
        VERCEL_URL: "beyond-blue-abc123.vercel.app",
      }).href,
    ).toBe("https://beyond-blue-vert.vercel.app/");
  });

  it("falls back to the Vercel deployment URL on previews", () => {
    expect(getSiteUrl({ VERCEL_URL: "beyond-blue-git-feature.vercel.app" }).href).toBe(
      "https://beyond-blue-git-feature.vercel.app/",
    );
    expect(getSiteUrl({ NEXT_PUBLIC_VERCEL_URL: "preview.vercel.app" }).origin).toBe(
      "https://preview.vercel.app",
    );
  });

  it("falls back to localhost in development", () => {
    expect(getSiteUrl({}).href).toBe("http://localhost:3000/");
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "  " }).href).toBe("http://localhost:3000/");
  });
});
