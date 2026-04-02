import { describe, it, expect } from "vitest";
import { calculateWeeklyBudget, DAILY_ALLOWANCE, FULL_WEEK_BUDGET } from "./obrokBudget.js";

describe("calculateWeeklyBudget", () => {
  it("returns 840 for a normal week with no holidays", () => {
    // Wednesday April 8 2026 — whole week in April, no holidays
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), []);
    expect(result.budget).toBe(FULL_WEEK_BUDGET);
    expect(result.workDays).toBe(6);
    expect(result.holidays).toBe(0);
    expect(result.segments).toBeNull();
  });

  it("subtracts 140 for one Mon-Sat holiday", () => {
    // Week of April 6-11 2026, holiday on Thursday April 9
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), [
      new Date(2026, 3, 9),
    ]);
    expect(result.budget).toBe(FULL_WEEK_BUDGET - DAILY_ALLOWANCE);
    expect(result.workDays).toBe(5);
    expect(result.holidays).toBe(1);
  });

  it("subtracts 140 for each of multiple Mon-Sat holidays", () => {
    // Week of April 6-11 2026, holidays on Tuesday 7 and Friday 10
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), [
      new Date(2026, 3, 7),
      new Date(2026, 3, 10),
    ]);
    expect(result.budget).toBe(FULL_WEEK_BUDGET - 2 * DAILY_ALLOWANCE);
    expect(result.workDays).toBe(4);
    expect(result.holidays).toBe(2);
  });

  it("ignores holidays that fall on Sunday", () => {
    // Week of April 6-11 2026, holiday on Sunday April 12
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), [
      new Date(2026, 3, 12),
    ]);
    expect(result.budget).toBe(FULL_WEEK_BUDGET);
    expect(result.holidays).toBe(0);
  });

  it("ignores holidays from other weeks", () => {
    // Week of April 6-11 2026, holiday on April 15 (next week)
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), [
      new Date(2026, 3, 15),
    ]);
    expect(result.budget).toBe(FULL_WEEK_BUDGET);
    expect(result.holidays).toBe(0);
  });

  it("handles week crossing month boundary (March/April 2026)", () => {
    // March 30 (Mon) to April 4 (Sat) 2026
    // March segment: Mon 30, Tue 31 = 2 days = 280
    // April segment: Wed 1, Thu 2, Fri 3, Sat 4 = 4 days = 560
    // Total: 840 (if no holidays)
    const result = calculateWeeklyBudget(new Date(2026, 3, 1), []);
    expect(result.budget).toBe(840);
    expect(result.workDays).toBe(6);
    expect(result.segments).not.toBeNull();
    expect(result.segments[0]).toEqual({ days: 2, budget: 280 });
    expect(result.segments[1]).toEqual({ days: 4, budget: 560 });
  });

  it("handles month boundary with holiday in old month segment", () => {
    // March 30 (Mon) to April 4 (Sat), holiday on March 31 (Tue)
    // March segment: 2 days - 1 holiday = 1 day = 140
    // April segment: 4 days = 560
    // Total: 700
    const result = calculateWeeklyBudget(new Date(2026, 3, 2), [
      new Date(2026, 2, 31),
    ]);
    expect(result.budget).toBe(700);
    expect(result.workDays).toBe(5);
    expect(result.holidays).toBe(1);
    expect(result.segments[0]).toEqual({ days: 1, budget: 140 });
    expect(result.segments[1]).toEqual({ days: 4, budget: 560 });
  });

  it("handles month boundary with holiday in new month segment", () => {
    // March 30 (Mon) to April 4 (Sat), holiday on April 1 (Wed)
    // March segment: 2 days = 280
    // April segment: 4 days - 1 holiday = 3 days = 420
    // Total: 700
    const result = calculateWeeklyBudget(new Date(2026, 2, 30), [
      new Date(2026, 3, 1),
    ]);
    expect(result.budget).toBe(700);
    expect(result.workDays).toBe(5);
    expect(result.holidays).toBe(1);
    expect(result.segments[0]).toEqual({ days: 2, budget: 280 });
    expect(result.segments[1]).toEqual({ days: 3, budget: 420 });
  });

  it("works when reference date is Monday", () => {
    const result = calculateWeeklyBudget(new Date(2026, 3, 6), []);
    expect(result.budget).toBe(840);
    expect(result.workDays).toBe(6);
  });

  it("works when reference date is Saturday", () => {
    const result = calculateWeeklyBudget(new Date(2026, 3, 11), []);
    expect(result.budget).toBe(840);
    expect(result.workDays).toBe(6);
  });

  it("works when reference date is Sunday (uses that week Mon-Sat)", () => {
    // Sunday April 12 2026 belongs to week of Mon April 6
    const result = calculateWeeklyBudget(new Date(2026, 3, 12), []);
    expect(result.budget).toBe(840);
    expect(result.workDays).toBe(6);
  });

  it("handles holiday strings (ISO date strings)", () => {
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), [
      "2026-04-09",
    ]);
    expect(result.budget).toBe(700);
    expect(result.holidays).toBe(1);
  });

  it("handles entire week being holidays", () => {
    const holidays = [
      new Date(2026, 3, 6),
      new Date(2026, 3, 7),
      new Date(2026, 3, 8),
      new Date(2026, 3, 9),
      new Date(2026, 3, 10),
      new Date(2026, 3, 11),
    ];
    const result = calculateWeeklyBudget(new Date(2026, 3, 8), holidays);
    expect(result.budget).toBe(0);
    expect(result.workDays).toBe(0);
    expect(result.holidays).toBe(6);
  });
});
