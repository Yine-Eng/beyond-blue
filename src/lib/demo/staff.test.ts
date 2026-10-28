// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { demoFundBalance, demoFundRequests, demoStaffDashboard } = await import("./staff");

describe("staff demo data", () => {
  const dashboard = demoStaffDashboard("session-a");

  it("is a fictional 60-student cohort across all five pathways", () => {
    expect(dashboard.overview.students).toBe(60);
    expect(dashboard.overview.byPathway).toHaveLength(5);
    expect(dashboard.cohorts[0]).toMatch(/fictional/);
  });

  it("has some students behind the countdown, but not most", () => {
    expect(dashboard.overview.atRisk.length).toBeGreaterThan(2);
    expect(dashboard.overview.atRisk.length).toBeLessThan(20);
  });

  it("is stable within a session and differs between sessions", () => {
    expect(demoStaffDashboard("session-a")).toEqual(dashboard);
    expect(demoStaffDashboard("session-b").overview.overall).not.toEqual(
      dashboard.overview.overall,
    );
  });

  it("keeps fund requests within the cap and the balance consistent", () => {
    const requests = demoFundRequests("session-a");
    expect(requests.every((r) => r.amount_cents <= 25_000)).toBe(true);
    const approved = requests.filter((r) => r.status === "approved");
    expect(demoFundBalance("session-a").approved_cents).toBe(
      approved.reduce((s, r) => s + r.amount_cents, 0),
    );
    expect(dashboard.fund.byStatus.submitted).toBe(
      requests.filter((r) => r.status === "submitted").length,
    );
  });

  it("suppresses Day +100 groups under five responses", () => {
    const small = dashboard.insights.filter((i) => i.responses < 5);
    expect(small.length).toBeGreaterThan(0);
    for (const group of small) expect(group).toMatchObject({ suppressed: true, outcomes: null });
  });
});
