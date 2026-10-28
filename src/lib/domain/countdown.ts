/**
 * Time-zone-safe countdown (docs/architecture.md §6).
 * Works in calendar days in the cohort's time zone, never in raw milliseconds, so DST shifts and
 * students in other time zones always see the same day count.
 */

export type CountdownStage = "pre-program" | "countdown" | "launchpad" | "post-graduation";

/** The calendar date (YYYY-MM-DD) it currently is in `timeZone`. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const DAY_MS = 86_400_000;

function toUtcDay(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) throw new Error(`Expected YYYY-MM-DD, got ${isoDate}`);
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD). */
export function calendarDaysBetween(from: string, to: string): number {
  return toUtcDay(to) - toUtcDay(from);
}

/** Days until graduation in the cohort's time zone. 0 on graduation day, negative afterwards. */
export function daysToGraduation(
  graduationDate: string,
  timeZone: string,
  now: Date = new Date(),
): number {
  return calendarDaysBetween(todayInTimeZone(timeZone, now), graduationDate);
}

export function countdownStage(days: number): CountdownStage {
  if (days > 100) return "pre-program";
  if (days > 0) return "countdown";
  if (days === 0) return "launchpad";
  return "post-graduation";
}

/** Adds days to a YYYY-MM-DD date (used for relative demo cohorts). */
export function addDays(isoDate: string, days: number): string {
  return new Date((toUtcDay(isoDate) + days) * DAY_MS).toISOString().slice(0, 10);
}
