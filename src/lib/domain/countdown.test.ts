// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  addDays,
  calendarDaysBetween,
  countdownStage,
  daysToGraduation,
  todayInTimeZone,
} from "./countdown";

const NY = "America/New_York";

describe("todayInTimeZone", () => {
  it("uses the cohort's calendar date, not UTC", () => {
    // 02:30 UTC on 1 May is still 30 April (22:30) in New York.
    const instant = new Date("2027-05-01T02:30:00Z");
    expect(todayInTimeZone(NY, instant)).toBe("2027-04-30");
    expect(todayInTimeZone("UTC", instant)).toBe("2027-05-01");
  });
});

describe("daysToGraduation", () => {
  it("counts calendar days to graduation", () => {
    expect(daysToGraduation("2027-05-08", NY, new Date("2027-02-10T15:00:00Z"))).toBe(87);
  });

  it("is unaffected by the spring DST change", () => {
    // DST starts 14 Mar 2027 in the US: the 23-hour day must still count as one day.
    const before = daysToGraduation("2027-03-20", NY, new Date("2027-03-13T17:00:00Z"));
    const after = daysToGraduation("2027-03-20", NY, new Date("2027-03-14T17:00:00Z"));
    expect(before - after).toBe(1);
    expect(after).toBe(6);
  });

  it("gives every student the same number regardless of their own time zone", () => {
    // 23:30 in New York is already the next day in Tokyo; the cohort zone decides.
    const instant = new Date("2027-02-11T04:30:00Z");
    expect(daysToGraduation("2027-05-08", NY, instant)).toBe(87);
  });

  it("is 0 on graduation day and negative afterwards", () => {
    expect(daysToGraduation("2027-05-08", NY, new Date("2027-05-08T16:00:00Z"))).toBe(0);
    expect(daysToGraduation("2027-05-08", NY, new Date("2027-05-10T16:00:00Z"))).toBe(-2);
  });
});

describe("countdownStage", () => {
  it.each([
    [140, "pre-program"],
    [100, "countdown"],
    [1, "countdown"],
    [0, "launchpad"],
    [-5, "post-graduation"],
  ] as const)("%i days → %s", (days, stage) => {
    expect(countdownStage(days)).toBe(stage);
  });
});

describe("date helpers", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-30", 87)).toBe("2027-03-27");
    expect(calendarDaysBetween("2026-10-28", "2027-01-23")).toBe(87);
  });

  it("rejects malformed dates", () => {
    expect(() => calendarDaysBetween("2027-5-8", "2027-05-09")).toThrow();
  });
});

describe("greetingFor", () => {
  it("greets by the hour in the cohort's time zone", async () => {
    const { greetingFor } = await import("./greeting");
    expect(greetingFor(NY, new Date("2027-02-10T13:00:00Z"))).toBe("Good morning"); // 08:00
    expect(greetingFor(NY, new Date("2027-02-10T19:00:00Z"))).toBe("Good afternoon"); // 14:00
    expect(greetingFor(NY, new Date("2027-02-11T01:00:00Z"))).toBe("Good evening"); // 20:00
  });
});
