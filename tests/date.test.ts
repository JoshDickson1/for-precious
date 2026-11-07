import { describe, expect, it } from "vitest";
import {
  countdownTo,
  dayKey,
  greetingFor,
  hashString,
  memoryDate,
  zonedParts,
} from "@/lib/date";

describe("dayKey", () => {
  it("uses the configured timezone, not UTC", () => {
    const justBeforeMidnightUtc = new Date("2026-10-24T23:30:00Z");
    expect(dayKey(justBeforeMidnightUtc, "Africa/Lagos")).toBe("2026-10-25");
    expect(dayKey(justBeforeMidnightUtc, "UTC")).toBe("2026-10-24");
  });

  it("formats single digit months and days with padding", () => {
    expect(dayKey(new Date("2026-01-05T12:00:00Z"), "UTC")).toBe("2026-01-05");
  });
});

describe("zonedParts", () => {
  it("returns the local hour for a timezone", () => {
    const date = new Date("2026-10-24T19:05:00Z");
    expect(zonedParts(date, "Africa/Lagos").hour).toBe(20);
    expect(zonedParts(date, "Africa/Lagos").minute).toBe(5);
  });
});

describe("greetingFor", () => {
  it("changes through the day", () => {
    expect(greetingFor(3)).toBe("Still awake");
    expect(greetingFor(8)).toBe("Good morning");
    expect(greetingFor(14)).toBe("Good afternoon");
    expect(greetingFor(19)).toBe("Good evening");
    expect(greetingFor(22)).toBe("Good night");
  });
});

describe("countdownTo", () => {
  const target = "2026-12-21T00:00:00+01:00";

  it("splits remaining time into days, hours, minutes, seconds", () => {
    const now = new Date("2026-10-21T00:00:00+01:00");
    const parts = countdownTo(target, now);
    expect(parts.done).toBe(false);
    expect(parts.days).toBe(61);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);
    expect(parts.seconds).toBe(0);
  });

  it("never shows negative values after the target", () => {
    const now = new Date("2027-01-01T00:00:00+01:00");
    expect(countdownTo(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      done: true,
    });
  });

  it("handles the exact moment", () => {
    expect(countdownTo(target, new Date(target)).done).toBe(true);
  });
});

describe("memoryDate", () => {
  it("formats exact dates", () => {
    expect(memoryDate("2026-10-09", "exact")).toBe("9 October 2026");
  });

  it("omits unknown dates instead of inventing one", () => {
    expect(memoryDate(null, "unknown")).toBeNull();
    expect(memoryDate("2026-10-09", "unknown")).toBeNull();
  });

  it("formats month-level precision", () => {
    expect(memoryDate("2026-10-09", "month")).toBe("October 2026");
  });
});

describe("hashString", () => {
  it("is stable for the same input", () => {
    expect(hashString("2026-10-24")).toBe(hashString("2026-10-24"));
  });

  it("is deterministic across different days", () => {
    expect(hashString("2026-10-24")).not.toBe(hashString("2026-10-25"));
  });
});
