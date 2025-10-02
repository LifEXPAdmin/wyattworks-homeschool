import Stripe from "stripe";

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-09-30.clover",
});

// Define plan interface
interface PlanConfig {
  name: string;
  priceId: string | null;
  yearlyPriceId?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays?: number;
  features: string[];
  limits: {
    worksheets: number;
    exports: number;
    students: number;
  };
}

// Stripe configuration
export const STRIPE_CONFIG = {
  // Subscription plans
  plans: {
    free: {
      name: "Free",
      priceId: null, // Free plan has no Stripe price ID
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Up to 15 worksheets per month",
        "Basic math and language arts",
        "PDF export",
        "Basic progress tracking",
      ],
      limits: {
        worksheets: 15,
        exports: 15,
        students: 1,
      },
    },
    homeschool: {
      name: "Homeschool",
      priceId: process.env.STRIPE_HOMESCHOOL_PRICE_ID || "price_1SDapB1S6TukLrEPIsC4YbGz",
      yearlyPriceId:
        process.env.STRIPE_HOMESCHOOL_YEARLY_PRICE_ID || "price_1SDasJ1S6TukLrEPIbt6y5MN",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      trialDays: 14, // 14-day free trial
      features: [
        "Unlimited worksheets",
        "All subjects (Math, Science, Language Arts)",
        "Advanced customization",
        "Progress tracking & analytics",
        "Multiple student profiles",
        "Custom fonts & themes",
        "Priority support",
      ],
      limits: {
        worksheets: -1, // unlimited
        exports: -1,
        students: 10,
      },
    },
    school: {
      name: "School",
      priceId: process.env.STRIPE_SCHOOL_PRICE_ID || "price_1SDauC1S6TukLrEPvos069EZ",
      yearlyPriceId: process.env.STRIPE_SCHOOL_YEARLY_PRICE_ID || "price_1SDavL1S6TukLrEPJI8DLuG6",
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      trialDays: 14, // 14-day free trial
      features: [
        "Everything in Homeschool",
        "Unlimited students",
        "Teacher collaboration",
        "Classroom management",
        "Bulk worksheet generation",
        "Advanced reporting",
        "API access",
        "White-label options",
      ],
      limits: {
        worksheets: -1,
        exports: -1,
        students: -1,
      },
    },
  } as Record<string, PlanConfig>,

  // Webhook endpoints
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Success/cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://wyatt-works.education"}/dashboard/subscription?success=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://wyatt-works.education"}/dashboard/subscription?canceled=true`,
};

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [planKey, plan] of Object.entries(STRIPE_CONFIG.plans)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (plan.priceId === priceId || (plan as any).yearlyPriceId === priceId) {
      return { key: planKey, ...plan };
    }
  }
  return null;
}

// Helper function to format price
export function formatPrice(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
