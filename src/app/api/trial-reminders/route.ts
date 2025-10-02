import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/trial-reminders
 * Send trial reminder emails to users whose trials end in 2 days
 */
export async function POST(request: NextRequest) {
  try {
    // This would typically be called by a cron job or scheduled task
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Find users whose trials end in 2 days
    const usersWithExpiringTrials = await prisma.subscription.findMany({
      where: {
        status: "trialing",
        trialEnd: {
          gte: new Date(twoDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // Start of day
          lt: new Date(twoDaysFromNow.getTime() + 24 * 60 * 60 * 1000), // End of day
        },
      },
      include: {
        user: true,
      },
    });

    const remindersSent = [];

    for (const subscription of usersWithExpiringTrials) {
      try {
        // Here you would integrate with your email service (SendGrid, Resend, etc.)
        // For now, we'll just log the reminder
        console.log(`Trial reminder for user ${subscription.user.email}: Trial ends in 2 days`);

        // In a real implementation, you would:
        // 1. Send an email to the user
        // 2. Track that the reminder was sent
        // 3. Maybe show an in-app notification

        remindersSent.push({
          userId: subscription.userId,
          email: subscription.user.email,
          trialEnd: subscription.trialEnd,
        });
      } catch (error) {
        console.error(`Failed to send trial reminder to ${subscription.user.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: remindersSent.length,
      users: remindersSent,
    });
  } catch (error) {
    console.error("Trial reminder error:", error);
    return NextResponse.json({ error: "Failed to process trial reminders" }, { status: 500 });
  }
}

/**
 * GET /api/trial-reminders
 * Check if current user needs a trial reminder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.status !== "trialing" || !subscription.trialEnd) {
      return NextResponse.json({ needsReminder: false });
    }

    const today = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    const daysUntilTrialEnd = Math.ceil(
      (trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      needsReminder: daysUntilTrialEnd <= 2 && daysUntilTrialEnd > 0,
      daysUntilTrialEnd,
      trialEnd: subscription.trialEnd,
    });
  } catch (error) {
    console.error("Trial reminder check error:", error);
    return NextResponse.json({ error: "Failed to check trial reminder" }, { status: 500 });
  }
}
