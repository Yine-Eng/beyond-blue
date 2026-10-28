// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, securityHeaders } from "./headers";

const SUPABASE = "https://abcdefgh.supabase.co";

function directive(csp: string, name: string): string {
  return csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";
}

describe("buildContentSecurityPolicy", () => {
  it("locks production down and allows only the configured Supabase project", () => {
    const csp = buildContentSecurityPolicy({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: SUPABASE,
    });
    expect(directive(csp, "connect-src")).toBe(
      `connect-src 'self' ${SUPABASE} wss://abcdefgh.supabase.co`,
    );
    expect(directive(csp, "script-src")).not.toContain("unsafe-eval");
    expect(csp).not.toContain("vercel.live");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("allows the Vercel toolbar on preview deployments only", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production", VERCEL_ENV: "preview" });
    expect(directive(csp, "script-src")).toContain("https://vercel.live");
    expect(directive(csp, "frame-src")).toBe("frame-src https://vercel.live");
  });

  it("allows eval in development for React debugging", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "development" });
    expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("works without Supabase configured", () => {
    const csp = buildContentSecurityPolicy({ NODE_ENV: "production" });
    expect(directive(csp, "connect-src")).toBe("connect-src 'self'");
  });
});

describe("securityHeaders", () => {
  it("includes the baseline hardening headers", () => {
    const keys = securityHeaders({ NODE_ENV: "production" }).map((h) => h.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "Referrer-Policy",
        "Permissions-Policy",
      ]),
    );
  });
});
