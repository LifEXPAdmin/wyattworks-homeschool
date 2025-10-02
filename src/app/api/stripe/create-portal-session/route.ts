import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * POST /api/stripe/create-portal-session
 * Create a Stripe customer portal session for subscription management
 */
export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (!dbUser?.subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://wyatt-works.education"}/dashboard/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
