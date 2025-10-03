import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * Get or create a promo code coupon in Stripe
 */
async function getOrCreatePromoCoupon(promoCode: string, isFree: boolean = false): Promise<string> {
  try {
    // Try to find existing coupon
    const coupons = await stripe.coupons.list({ limit: 100 });
    const existingCoupon = coupons.data.find((coupon) => coupon.id === promoCode.toLowerCase());

    if (existingCoupon) {
      return existingCoupon.id;
    }

    // Create new coupon
    const coupon = await stripe.coupons.create({
      id: promoCode.toLowerCase(),
      percent_off: isFree ? 100 : 50, // 100% off for free codes, 50% for regular promo codes
      duration: isFree ? "forever" : "once", // Free codes are forever, others are one-time
      name: isFree ? `Free Membership - ${promoCode}` : `Promo Code - ${promoCode}`,
      metadata: {
        isFree: isFree.toString(),
        createdBy: "system",
      },
    });

    return coupon.id;
  } catch (error) {
    console.error("Error creating promo coupon:", error);
    throw error;
  }
}

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "STRIPE_AUTH_001",
          message: "User not authenticated",
          details: "Please sign in to continue with subscription",
        },
        { status: 401 }
      );
    }

    const { planKey, isYearly, promoCode } = await request.json();

    if (!planKey || planKey === "free") {
      return NextResponse.json(
        {
          error: "STRIPE_PLAN_002",
          message: "Invalid subscription plan selected",
          details: "Please select a valid paid plan (homeschool or school)",
        },
        { status: 400 }
      );
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
          error: "STRIPE_CONFIG_003",
          message: "Payment system not configured",
          details:
            "The subscription system is not yet configured. Please contact support for assistance.",
        },
        { status: 503 }
      );
    }

    const plan = STRIPE_CONFIG.plans[planKey as keyof typeof STRIPE_CONFIG.plans];
    if (!plan) {
      return NextResponse.json(
        {
          error: "STRIPE_PLAN_004",
          message: "Subscription plan not found",
          details: `The plan '${planKey}' does not exist. Available plans: homeschool, school`,
        },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const priceId = isYearly ? (plan as any).yearlyPriceId : plan.priceId;
    if (!priceId) {
      return NextResponse.json(
        {
          error: "STRIPE_PRICE_005",
          message: "Pricing not configured for this plan",
          details: `No price ID found for plan '${planKey}' ${isYearly ? "yearly" : "monthly"} billing`,
        },
        { status: 400 }
      );
    }

    // Check if user has already used a free trial
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: { subscription: true },
      });

      // Check if user has already used a free trial
      if (dbUser?.subscription?.trialEnd && new Date() < dbUser.subscription.trialEnd) {
        return NextResponse.json(
          {
            error: "STRIPE_TRIAL_013",
            message: "Free trial already used",
            details: "You have already used your free trial. Please subscribe to continue.",
          },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error("Database error checking trial:", dbError);
      return NextResponse.json(
        {
          error: "STRIPE_DB_006",
          message: "Database connection error",
          details: "Unable to process subscription request. Please try again.",
        },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;

    try {
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
        const updatedUser = await prisma.user.upsert({
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
          where: { userId: updatedUser.id },
          update: { stripeCustomerId: customerId },
          create: {
            userId: updatedUser.id,
            stripeCustomerId: customerId,
            plan: "free",
            status: "active",
          },
        });
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "STRIPE_DB_006",
          message: "Database connection error",
          details: "Unable to process subscription request. Please try again.",
        },
        { status: 500 }
      );
    }

    // Check for special promo codes
    const isFreePromoCode =
      promoCode &&
      (promoCode.toLowerCase() === "testfree" ||
        promoCode.toLowerCase() === "freetest" ||
        promoCode.toLowerCase() === "astra100" ||
        promoCode.toLowerCase() === "beta");

    // Create checkout session with trial period
    try {
      const sessionConfig = {
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          trial_period_days: plan.trialDays || 14, // Default to 14 days if not specified
          metadata: {
            clerkUserId: user.id,
            planKey,
            isYearly: isYearly.toString(),
            promoCode: promoCode || "",
          },
        },
        success_url: STRIPE_CONFIG.successUrl,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata: {
          clerkUserId: user.id,
          planKey,
          isYearly: isYearly.toString(),
          promoCode: promoCode || "",
        },
      };

      // Add promo code if provided
      if (promoCode) {
        sessionConfig.discounts = [
          {
            coupon: await getOrCreatePromoCoupon(promoCode, isFreePromoCode),
          },
        ];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (stripeError: unknown) {
      console.error("Stripe API error:", stripeError);

      // Handle specific Stripe errors
      const error = stripeError as { type?: string; message?: string };
      if (error.type === "StripeInvalidRequestError") {
        return NextResponse.json(
          {
            error: "STRIPE_API_007",
            message: "Invalid payment request",
            details: error.message || "The payment request contains invalid data",
          },
          { status: 400 }
        );
      } else if (error.type === "StripeCardError") {
        return NextResponse.json(
          {
            error: "STRIPE_CARD_008",
            message: "Payment method error",
            details: error.message || "There was an issue with the payment method",
          },
          { status: 400 }
        );
      } else if (error.type === "StripeRateLimitError") {
        return NextResponse.json(
          {
            error: "STRIPE_RATE_009",
            message: "Too many requests",
            details: "Please wait a moment and try again",
          },
          { status: 429 }
        );
      } else if (error.type === "StripeAPIError") {
        return NextResponse.json(
          {
            error: "STRIPE_API_010",
            message: "Payment service error",
            details: "The payment service is temporarily unavailable. Please try again.",
          },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          {
            error: "STRIPE_UNKNOWN_011",
            message: "Payment processing error",
            details: "An unexpected error occurred. Please try again or contact support.",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("General checkout error:", error);
    return NextResponse.json(
      {
        error: "STRIPE_GENERAL_012",
        message: "Failed to create checkout session",
        details: "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
