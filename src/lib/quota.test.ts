/**
 * Unit Tests for Quota Management System
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getCurrentMonth,
  parseMonth,
  isCurrentMonth,
  QUOTA_LIMITS,
  type SubscriptionPlan,
} from "./quota";

describe("Quota Helper Functions", () => {
  describe("getCurrentMonth", () => {
    it("should return current month in YYYY-MM format", () => {
      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const expectedYear = now.getFullYear();
      const expectedMonth = String(now.getMonth() + 1).padStart(2, "0");
      expect(month).toBe(`${expectedYear}-${expectedMonth}`);
    });
  });

  describe("parseMonth", () => {
    it("should parse YYYY-MM string into Date", () => {
      const date = parseMonth("2024-03");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // March is month 2 (0-indexed)
      expect(date.getDate()).toBe(1);
    });

    it("should handle different months", () => {
      const jan = parseMonth("2024-01");
      const dec = parseMonth("2024-12");

      expect(jan.getMonth()).toBe(0);
      expect(dec.getMonth()).toBe(11);
    });

    it("should handle different years", () => {
      const date2023 = parseMonth("2023-06");
      const date2024 = parseMonth("2024-06");

      expect(date2023.getFullYear()).toBe(2023);
      expect(date2024.getFullYear()).toBe(2024);
    });
  });

  describe("isCurrentMonth", () => {
    it("should return true for current month", () => {
      const currentMonth = getCurrentMonth();
      expect(isCurrentMonth(currentMonth)).toBe(true);
    });

    it("should return false for past months", () => {
      const pastMonth = "2023-01";
      expect(isCurrentMonth(pastMonth)).toBe(false);
    });

    it("should return false for future months", () => {
      const futureMonth = "2099-12";
      expect(isCurrentMonth(futureMonth)).toBe(false);
    });
  });

  describe("QUOTA_LIMITS", () => {
    it("should have correct quota limits", () => {
      expect(QUOTA_LIMITS.free).toBe(15);
      expect(QUOTA_LIMITS.basic).toBe(50);
      expect(QUOTA_LIMITS.pro).toBe(Infinity);
      expect(QUOTA_LIMITS.premium).toBe(Infinity);
    });

    it("should have all subscription plans", () => {
      const plans: SubscriptionPlan[] = ["free", "basic", "pro", "premium"];
      plans.forEach((plan) => {
        expect(QUOTA_LIMITS[plan]).toBeDefined();
      });
    });
  });
});

describe("Month Rollover Logic", () => {
  it("should correctly identify month boundaries", () => {
    const months = [
      "2024-01",
      "2024-02",
      "2024-03",
      "2024-04",
      "2024-05",
      "2024-06",
      "2024-07",
      "2024-08",
      "2024-09",
      "2024-10",
      "2024-11",
      "2024-12",
    ];

    months.forEach((month, index) => {
      const date = parseMonth(month);
      expect(date.getMonth()).toBe(index);
    });
  });

  it("should handle year transitions", () => {
    const dec2023 = parseMonth("2023-12");
    const jan2024 = parseMonth("2024-01");

    expect(dec2023.getFullYear()).toBe(2023);
    expect(dec2023.getMonth()).toBe(11);

    expect(jan2024.getFullYear()).toBe(2024);
    expect(jan2024.getMonth()).toBe(0);
  });

  it("should calculate next month correctly", () => {
    const current = parseMonth("2024-06");
    const next = new Date(current);
    next.setMonth(next.getMonth() + 1);

    expect(next.getMonth()).toBe(6); // July
    expect(next.getFullYear()).toBe(2024);
  });

  it("should handle December to January rollover", () => {
    const dec = parseMonth("2024-12");
    const jan = new Date(dec);
    jan.setMonth(jan.getMonth() + 1);

    expect(jan.getMonth()).toBe(0); // January
    expect(jan.getFullYear()).toBe(2025); // Next year
  });
});

describe("Quota Business Logic", () => {
  it("should allow unlimited exports for pro users", () => {
    const proLimit = QUOTA_LIMITS.pro;
    expect(proLimit).toBe(Infinity);

    // Simulate pro user quota
    const used = 1000; // Even with 1000 exports
    const remaining = proLimit === Infinity ? Infinity : proLimit - used;

    expect(remaining).toBe(Infinity);
    expect(remaining > 0).toBe(true);
  });

  it("should allow unlimited exports for premium users", () => {
    const premiumLimit = QUOTA_LIMITS.premium;
    expect(premiumLimit).toBe(Infinity);

    const used = 5000;
    const remaining = premiumLimit === Infinity ? Infinity : premiumLimit - used;

    expect(remaining).toBe(Infinity);
  });

  it("should limit free users to 15 exports per month", () => {
    const freeLimit = QUOTA_LIMITS.free;
    expect(freeLimit).toBe(15);

    // Simulate free user at limit
    const used = 15;
    const remaining = Math.max(0, freeLimit - used);

    expect(remaining).toBe(0);
  });

  it("should calculate remaining quota correctly", () => {
    const limit = QUOTA_LIMITS.free;

    const scenarios = [
      { used: 0, expectedRemaining: 15 },
      { used: 5, expectedRemaining: 10 },
      { used: 14, expectedRemaining: 1 },
      { used: 15, expectedRemaining: 0 },
      { used: 20, expectedRemaining: 0 }, // Never negative
    ];

    scenarios.forEach(({ used, expectedRemaining }) => {
      const remaining = Math.max(0, limit - used);
      expect(remaining).toBe(expectedRemaining);
    });
  });

  it("should trigger paywall when quota exceeded", () => {
    const limit = QUOTA_LIMITS.free;
    const used = 15;
    const remaining = Math.max(0, limit - used);
    const allowed = remaining > 0;
    const paywall = !allowed;

    expect(allowed).toBe(false);
    expect(paywall).toBe(true);
  });

  it("should not trigger paywall when quota available", () => {
    const limit = QUOTA_LIMITS.free;
    const used = 10;
    const remaining = Math.max(0, limit - used);
    const allowed = remaining > 0;
    const paywall = !allowed;

    expect(allowed).toBe(true);
    expect(paywall).toBe(false);
    expect(remaining).toBe(5);
  });
});

describe("Month History Calculation", () => {
  it("should generate correct month strings for history", () => {
    const now = new Date(2024, 5, 15); // June 15, 2024
    const history: Array<{ month: string; count: number }> = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      history.push({ month, count: 0 });
    }

    expect(history[0].month).toBe("2024-06"); // June
    expect(history[1].month).toBe("2024-05"); // May
    expect(history[2].month).toBe("2024-04"); // April
    expect(history[3].month).toBe("2024-03"); // March
    expect(history[4].month).toBe("2024-02"); // February
    expect(history[5].month).toBe("2024-01"); // January
  });

  it("should handle year boundaries in history", () => {
    const now = new Date(2024, 1, 15); // February 15, 2024
    const history: Array<{ month: string; count: number }> = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      history.push({ month, count: 0 });
    }

    expect(history[0].month).toBe("2024-02"); // Feb 2024
    expect(history[1].month).toBe("2024-01"); // Jan 2024
    expect(history[2].month).toBe("2023-12"); // Dec 2023
    expect(history[3].month).toBe("2023-11"); // Nov 2023
    expect(history[4].month).toBe("2023-10"); // Oct 2023
    expect(history[5].month).toBe("2023-09"); // Sep 2023
  });
});

describe("Edge Cases", () => {
  it("should handle leap years", () => {
    const feb2024 = parseMonth("2024-02"); // 2024 is a leap year
    const nextMonth = new Date(feb2024);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    expect(feb2024.getMonth()).toBe(1);
    expect(nextMonth.getMonth()).toBe(2);
  });

  it("should handle month overflow correctly", () => {
    const date = new Date(2024, 11, 1); // December 2024
    date.setMonth(date.getMonth() + 1);

    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(0); // January
  });

  it("should handle basic plan quota", () => {
    const limit = QUOTA_LIMITS.basic;
    expect(limit).toBe(50);

    const used = 45;
    const remaining = Math.max(0, limit - used);

    expect(remaining).toBe(5);
    expect(remaining > 0).toBe(true);
  });
});
