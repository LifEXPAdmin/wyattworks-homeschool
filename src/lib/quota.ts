/**
 * Quota Management System
 *
 * Handles export quotas with monthly rollover based on subscription plans.
 */

import prisma from "./prisma";

/**
 * Quota limits by subscription plan
 */
export const QUOTA_LIMITS = {
  free: 15, // 15 exports per month for free users
  basic: 50, // 50 exports per month for basic users
  pro: Infinity, // Unlimited exports for pro users
  premium: Infinity, // Unlimited exports for premium users
} as const;

export type SubscriptionPlan = keyof typeof QUOTA_LIMITS;

/**
 * Quota check result
 */
export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  currentMonth: string;
  paywall: boolean;
  plan: SubscriptionPlan;
}

/**
 * Gets the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Parses a month string (YYYY-MM) into a Date
 */
export function parseMonth(monthStr: string): Date {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * Checks if a month string is the current month
 */
export function isCurrentMonth(monthStr: string): boolean {
  return monthStr === getCurrentMonth();
}

/**
 * Gets the user's subscription plan
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  // If no subscription or inactive, return free
  if (!subscription || subscription.status !== "active") {
    return "free";
  }

  return subscription.plan as SubscriptionPlan;
}

/**
 * Counts exports for a user in the current month
 */
export async function countMonthlyExports(userId: string, month: string): Promise<number> {
  const monthStart = parseMonth(month);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const count = await prisma.exportLog.count({
    where: {
      userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  return count;
}

/**
 * Checks if a user can export based on their quota
 *
 * @param userId - The user's ID
 * @returns QuotaResult with allowed status and details
 *
 * @example
 * ```typescript
 * const quota = await checkQuota(user.id);
 * if (!quota.allowed) {
 *   if (quota.paywall) {
 *     return { error: "Upgrade to continue", paywall: true };
 *   }
 * }
 * ```
 */
export async function checkQuota(userId: string): Promise<QuotaResult> {
  // Get user's plan
  const plan = await getUserPlan(userId);
  const limit = QUOTA_LIMITS[plan];
  const currentMonth = getCurrentMonth();

  // Pro and premium users have unlimited exports
  if (limit === Infinity) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      currentMonth,
      paywall: false,
      plan,
    };
  }

  // Count exports in current month
  const used = await countMonthlyExports(userId, currentMonth);
  const remaining = Math.max(0, limit - used);
  const allowed = remaining > 0;

  return {
    allowed,
    remaining,
    limit,
    currentMonth,
    paywall: !allowed, // Show paywall if quota exceeded
    plan,
  };
}

/**
 * Deducts one export from the user's quota (for tracking purposes)
 * Note: The actual deduction happens when creating the ExportLog
 *
 * @param userId - The user's ID
 * @returns Updated quota information
 */
export async function deductExport(userId: string): Promise<QuotaResult> {
  // Simply return current quota after the export log has been created
  return checkQuota(userId);
}

/**
 * Gets quota usage statistics for a user
 */
export async function getQuotaUsage(userId: string): Promise<{
  currentMonth: string;
  used: number;
  limit: number;
  remaining: number;
  plan: SubscriptionPlan;
  history: Array<{ month: string; count: number }>;
}> {
  const plan = await getUserPlan(userId);
  const currentMonth = getCurrentMonth();
  const limit = QUOTA_LIMITS[plan];
  const used = await countMonthlyExports(userId, currentMonth);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);

  // Get last 6 months of history
  const history: Array<{ month: string; count: number }> = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const count = await countMonthlyExports(userId, month);
    history.push({ month, count });
  }

  return {
    currentMonth,
    used,
    limit,
    remaining,
    plan,
    history,
  };
}

/**
 * Checks if a specific export already exists for the user
 * This prevents charging users for regenerating the same worksheet
 */
export async function findExistingExport(
  userId: string,
  configHash: string
): Promise<{ id: string; metadata: string | null; createdAt: Date } | null> {
  return prisma.exportLog.findUnique({
    where: {
      userId_configHash: {
        userId,
        configHash,
      },
    },
    select: {
      id: true,
      metadata: true,
      createdAt: true,
    },
  });
}
