import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !STRIPE_CONFIG.webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clerkUserId = session.metadata?.clerkUserId;
  const planKey = session.metadata?.planKey;
  const promoCode = session.metadata?.promoCode;

  if (!clerkUserId || !planKey) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Update user subscription
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (!dbUser) {
    console.error("User not found:", clerkUserId);
    return;
  }

  // Calculate trial end date (14 days from now)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  // Check if this is a free promo code
  const isFreePromoCode =
    promoCode &&
    (promoCode.toLowerCase() === "testfree" ||
      promoCode.toLowerCase() === "freetest" ||
      promoCode.toLowerCase() === "astra100" ||
      promoCode.toLowerCase() === "beta");

  await prisma.subscription.upsert({
    where: { userId: dbUser.id },
    update: {
      plan: planKey,
      status: "active",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      trialEnd: isFreePromoCode ? null : trialEnd, // No trial end for free promo codes
      promoCode: promoCode || null,
    },
    create: {
      userId: dbUser.id,
      plan: planKey,
      status: "active",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      trialEnd: isFreePromoCode ? null : trialEnd, // No trial end for free promo codes
      promoCode: promoCode || null,
    },
  });

  console.log(
    `Subscription created for user ${clerkUserId} with plan ${planKey}${promoCode ? ` and promo code ${promoCode}` : ""}`
  );
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: subscription.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "canceled",
      plan: "free",
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "active",
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error("Subscription not found for customer:", customerId);
    return;
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "past_due",
    },
  });
}
