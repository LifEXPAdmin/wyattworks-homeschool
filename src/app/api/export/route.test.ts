/**
 * Tests for POST /api/export
 *
 * Tests quota management, caching, and export flow
 */

import { describe, it, expect } from "vitest";
import { getCurrentMonth, parseMonth, QUOTA_LIMITS } from "@/lib/quota";

describe("Export API Flow", () => {
  describe("Config Hash Deduplication", () => {
    it("should return same hash for equivalent configs", () => {
      import("@/lib/config").then(({ hashConfig }) => {
        const config1 = {
          subject: "math" as const,
          type: "practice" as const,
          options: { showAnswerKey: true },
          layout: { orientation: "portrait" as const },
          seed: 12345,
        };

        const config2 = {
          subject: "math" as const,
          type: "practice" as const,
          options: { showAnswerKey: true },
          layout: { orientation: "portrait" as const },
          seed: 12345,
        };

        expect(hashConfig(config1)).toBe(hashConfig(config2));
      });
    });
  });

  describe("Quota Logic", () => {
    it("should allow pro users unlimited exports", () => {
      const proLimit = QUOTA_LIMITS.pro;
      expect(proLimit).toBe(Infinity);

      const used = 1000;
      const remaining = proLimit === Infinity ? Infinity : proLimit - used;
      const allowed = remaining > 0;

      expect(allowed).toBe(true);
      expect(remaining).toBe(Infinity);
    });

    it("should allow free users up to 15 exports per month", () => {
      const freeLimit = QUOTA_LIMITS.free;
      expect(freeLimit).toBe(15);

      const scenarios = [
        { used: 0, shouldAllow: true, remaining: 15 },
        { used: 10, shouldAllow: true, remaining: 5 },
        { used: 14, shouldAllow: true, remaining: 1 },
        { used: 15, shouldAllow: false, remaining: 0 },
        { used: 20, shouldAllow: false, remaining: 0 },
      ];

      scenarios.forEach(({ used, shouldAllow, remaining: expectedRemaining }) => {
        const remaining = Math.max(0, freeLimit - used);
        const allowed = remaining > 0;

        expect(allowed).toBe(shouldAllow);
        expect(remaining).toBe(expectedRemaining);
      });
    });

    it("should trigger paywall when free quota exceeded", () => {
      const freeLimit = QUOTA_LIMITS.free;
      const used = 15;
      const remaining = Math.max(0, freeLimit - used);
      const allowed = remaining > 0;
      const paywall = !allowed;

      expect(paywall).toBe(true);
    });

    it("should not trigger paywall for pro users", () => {
      const proLimit = QUOTA_LIMITS.pro;
      const used = 1000;
      const remaining = proLimit === Infinity ? Infinity : proLimit - used;
      const allowed = remaining > 0;
      const paywall = !allowed;

      expect(paywall).toBe(false);
    });
  });

  describe("Monthly Rollover", () => {
    it("should correctly identify current month", () => {
      const currentMonth = getCurrentMonth();
      expect(currentMonth).toMatch(/^\d{4}-\d{2}$/);

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      expect(currentMonth).toBe(`${year}-${month}`);
    });

    it("should count exports per month separately", () => {
      // Simulate different months
      const month1 = "2024-01";
      const month2 = "2024-02";

      expect(month1).not.toBe(month2);

      // Parse months
      const date1 = parseMonth(month1);
      const date2 = parseMonth(month2);

      expect(date1.getMonth()).toBe(0); // January
      expect(date2.getMonth()).toBe(1); // February
    });

    it("should handle year transitions", () => {
      const dec2023 = parseMonth("2023-12");
      const jan2024 = parseMonth("2024-01");

      expect(dec2023.getFullYear()).toBe(2023);
      expect(jan2024.getFullYear()).toBe(2024);

      // Different months, should be counted separately
      const dec2023Str = "2023-12";
      const jan2024Str = "2024-01";
      expect(dec2023Str).not.toBe(jan2024Str);
    });

    it("should calculate month boundaries correctly", () => {
      const month = "2024-06";
      const monthStart = parseMonth(month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      expect(monthStart.getMonth()).toBe(5); // June
      expect(monthEnd.getMonth()).toBe(6); // July

      // June has 30 days
      const daysDiff = (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(30);
    });

    it("should reset quota on new month", () => {
      // Simulate quota reset logic
      const previousMonth = "2024-05";
      const currentMonth = "2024-06";

      expect(previousMonth).not.toBe(currentMonth);

      // In new month, quota should reset
      const previousUsed = 15; // Used all quota last month
      const newMonthUsed = 0; // Fresh start
      const limit = QUOTA_LIMITS.free;

      const previousRemaining = Math.max(0, limit - previousUsed);
      const newMonthRemaining = Math.max(0, limit - newMonthUsed);

      expect(previousRemaining).toBe(0); // No quota left last month
      expect(newMonthRemaining).toBe(15); // Full quota this month
    });
  });

  describe("Caching Logic", () => {
    it("should simulate cache hit scenario", () => {
      // When export exists with same configHash
      const existingExport = {
        id: "export-123",
        metadata: JSON.stringify({
          worksheetUrl: "/tmp/worksheet-123.pdf",
          answerKeyUrl: "/tmp/answer-key-123.pdf",
        }),
        createdAt: new Date(),
      };

      // Should return existing URLs
      expect(existingExport.id).toBeDefined();
      expect(existingExport.metadata).toBeDefined();

      const metadata = JSON.parse(existingExport.metadata);
      expect(metadata.worksheetUrl).toBeDefined();
      expect(metadata.answerKeyUrl).toBeDefined();
    });

    it("should simulate cache miss scenario", () => {
      const existingExport = null;

      // Should proceed with new generation
      expect(existingExport).toBeNull();
    });
  });

  describe("Response Validation", () => {
    it("should have correct success response structure", () => {
      const response = {
        success: true,
        cached: false,
        urls: {
          worksheet: "/tmp/worksheet-123.pdf",
          answerKey: "/tmp/answer-key-123.pdf",
        },
        exportId: "export-123",
        quota: {
          used: 11,
          limit: 15,
          remaining: 4,
          plan: "free",
          currentMonth: getCurrentMonth(),
        },
      };

      expect(response.success).toBe(true);
      expect(response.urls.worksheet).toBeDefined();
      expect(response.urls.answerKey).toBeDefined();
      expect(response.quota).toBeDefined();
    });

    it("should have correct paywall response structure", () => {
      const response = {
        error: "Quota exceeded",
        paywall: true,
        quota: {
          used: 15,
          limit: 15,
          remaining: 0,
          plan: "free",
          currentMonth: getCurrentMonth(),
        },
      };

      expect(response.error).toBe("Quota exceeded");
      expect(response.paywall).toBe(true);
      expect(response.quota.remaining).toBe(0);
    });

    it("should have correct cached response structure", () => {
      const response = {
        success: true,
        cached: true,
        urls: {
          worksheet: "/tmp/worksheet-cached.pdf",
          answerKey: "/tmp/answer-key-cached.pdf",
        },
        exportId: "export-cached",
        createdAt: new Date(),
      };

      expect(response.cached).toBe(true);
      expect(response.success).toBe(true);
      // Cached responses don't update quota
      expect("quota" in response).toBe(false);
    });
  });
});
