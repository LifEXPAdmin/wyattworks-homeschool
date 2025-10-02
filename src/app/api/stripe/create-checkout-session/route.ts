import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planKey, isYearly } = await request.json();

    if (!planKey || planKey === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Check if Stripe is properly configured
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "sk_test_placeholder" ||
      process.env.STRIPE_SECRET_KEY === "sk_test_your_stripe_secret_key_here" ||
      process.env.STRIPE_SECRET_KEY.startsWith("sk_test_your_")
    ) {
      return NextResponse.json(
        {
          error: "Stripe not configured. Please contact support to set up billing.",
          details:
            "The subscription system is not yet configured. Please contact support for assistance.",
        },
        { status: 503 }
      );
    }

    const plan = STRIPE_CONFIG.plans[planKey as keyof typeof STRIPE_CONFIG.plans];
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceId = isYearly ? (plan as any).yearlyPriceId : plan.priceId;
    if (!priceId) {
      return NextResponse.json({ error: "Price ID not found" }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { subscription: true },
    });

    if (dbUser?.subscription?.stripeCustomerId) {
      customerId = dbUser.subscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: {
          clerkUserId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {},
        create: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });

      await prisma.subscription.upsert({
        where: { userId: dbUser?.id || "" },
        update: { stripeCustomerId: customerId },
        create: {
          userId: dbUser?.id || "",
          stripeCustomerId: customerId,
          plan: "free",
          status: "active",
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        clerkUserId: user.id,
        planKey,
        isYearly: isYearly.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
