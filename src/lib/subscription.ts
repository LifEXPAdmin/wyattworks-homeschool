// Subscription and monetization system for Astra Academy
// Handles subscription tiers, payment processing, and usage limits

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  yearlyPrice: number; // Yearly price in cents (with discount)
  features: SubscriptionFeature[];
  limits: UsageLimits;
  popular?: boolean;
  color: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  icon: string;
}

export interface UsageLimits {
  worksheetsPerMonth: number;
  problemsPerWorksheet: number;
  customFonts: number;
  templates: number;
  students: number;
  exportsPerMonth: number;
  storageGB: number;
  prioritySupport: boolean;
  analytics: boolean;
  customBranding: boolean;
}

export interface UserSubscription {
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate: Date;
  nextPaymentDate: Date;
  amountPaid: number;
  currency: string;
}

export interface PaymentIntent {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  tierId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret: string;
  createdAt: Date;
}

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Astra Academy',
    price: 0,
    yearlyPrice: 0,
    color: 'gray',
    features: [
      { id: 'basic-worksheets', name: 'Basic Worksheets', description: 'Math, Language Arts, Science', included: true, icon: '📚' },
      { id: 'limited-exports', name: 'Limited Exports', description: '15 worksheets per month', included: true, icon: '📄' },
      { id: 'basic-templates', name: 'Basic Templates', description: '5 built-in templates', included: true, icon: '🎨' },
      { id: 'community-support', name: 'Community Support', description: 'Help from other users', included: true, icon: '💬' },
      { id: 'custom-fonts', name: 'Custom Fonts', description: 'Upload your own fonts', included: false, icon: '🔤' },
      { id: 'analytics', name: 'Progress Analytics', description: 'Detailed learning insights', included: false, icon: '📊' },
    ],
    limits: {
      worksheetsPerMonth: 15,
      problemsPerWorksheet: 50,
      customFonts: 0,
      templates: 5,
      students: 1,
      exportsPerMonth: 15,
      storageGB: 1,
      prioritySupport: false,
      analytics: false,
      customBranding: false,
    },
  },
  {
    id: 'homeschool',
    name: 'Homeschool',
    description: 'Everything you need for homeschooling',
    price: 999, // $9.99/month
    yearlyPrice: 9999, // $99.99/year (17% discount)
    color: 'blue',
    popular: true,
    features: [
      { id: 'unlimited-worksheets', name: 'Unlimited Worksheets', description: 'Create as many as you need', included: true, icon: '♾️' },
      { id: 'all-subjects', name: 'All Subjects', description: 'Math, Science, Language Arts, Social Studies', included: true, icon: '📚' },
      { id: 'custom-fonts', name: 'Custom Fonts', description: 'Upload handwriting fonts', included: true, icon: '🔤' },
      { id: 'premium-templates', name: 'Premium Templates', description: '50+ beautiful templates', included: true, icon: '🎨' },
      { id: 'progress-tracking', name: 'Progress Tracking', description: 'Track student progress', included: true, icon: '📊' },
      { id: 'multiple-students', name: 'Multiple Students', description: 'Up to 5 students', included: true, icon: '👥' },
      { id: 'priority-support', name: 'Priority Support', description: 'Email support within 24 hours', included: true, icon: '⚡' },
      { id: 'custom-branding', name: 'Custom Branding', description: 'Add your school logo', included: false, icon: '🏫' },
    ],
    limits: {
      worksheetsPerMonth: -1, // Unlimited
      problemsPerWorksheet: 200,
      customFonts: 10,
      templates: 50,
      students: 5,
      exportsPerMonth: -1, // Unlimited
      storageGB: 10,
      prioritySupport: true,
      analytics: true,
      customBranding: false,
    },
  },
  {
    id: 'school',
    name: 'School',
    description: 'Perfect for schools and tutoring centers',
    price: 2999, // $29.99/month
    yearlyPrice: 29999, // $299.99/year (17% discount)
    color: 'purple',
    features: [
      { id: 'everything-homeschool', name: 'Everything in Homeschool', description: 'All Homeschool features', included: true, icon: '✅' },
      { id: 'unlimited-students', name: 'Unlimited Students', description: 'No student limit', included: true, icon: '👥' },
      { id: 'custom-branding', name: 'Custom Branding', description: 'Add your school logo and colors', included: true, icon: '🏫' },
      { id: 'advanced-analytics', name: 'Advanced Analytics', description: 'Detailed reports and insights', included: true, icon: '📈' },
      { id: 'bulk-operations', name: 'Bulk Operations', description: 'Create multiple worksheets at once', included: true, icon: '⚡' },
      { id: 'api-access', name: 'API Access', description: 'Integrate with your systems', included: true, icon: '🔌' },
      { id: 'white-label', name: 'White Label', description: 'Remove Astra Academy branding', included: true, icon: '🎭' },
      { id: 'phone-support', name: 'Phone Support', description: 'Direct phone support', included: true, icon: '📞' },
    ],
    limits: {
      worksheetsPerMonth: -1, // Unlimited
      problemsPerWorksheet: 500,
      customFonts: 50,
      templates: 200,
      students: -1, // Unlimited
      exportsPerMonth: -1, // Unlimited
      storageGB: 100,
      prioritySupport: true,
      analytics: true,
      customBranding: true,
    },
  },
];

// Subscription management utilities
export class SubscriptionManager {
  private storageKey = 'astra-academy-subscription';

  // Get user's current subscription
  getUserSubscription(userId: string): UserSubscription | null {
    const subscriptions = this.getAllSubscriptions();
    const subscription = subscriptions.find(sub => sub.userId === userId);
    
    if (subscription) {
      // Convert string dates back to Date objects
      return {
        ...subscription,
        lastPaymentDate: new Date(subscription.lastPaymentDate),
        nextPaymentDate: new Date(subscription.nextPaymentDate),
      };
    }
    
    return null;
  }

  // Create or update subscription
  updateSubscription(subscription: UserSubscription): void {
    const subscriptions = this.getAllSubscriptions();
    const index = subscriptions.findIndex(sub => sub.userId === subscription.userId);
    
    if (index >= 0) {
      subscriptions[index] = subscription;
    } else {
      subscriptions.push(subscription);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(subscriptions));
  }

  // Cancel subscription
  cancelSubscription(userId: string): void {
    const subscription = this.getUserSubscription(userId);
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      this.updateSubscription(subscription);
    }
  }

  // Check if user has active subscription
  hasActiveSubscription(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    return subscription?.status === 'active' && new Date(subscription.endDate) > new Date();
  }

  // Get subscription tier details
  getSubscriptionTier(tierId: string): SubscriptionTier | null {
    return SUBSCRIPTION_TIERS.find(tier => tier.id === tierId) || null;
  }

  // Check if user can perform action based on limits
  canPerformAction(userId: string, action: keyof UsageLimits): boolean {
    const subscription = this.getUserSubscription(userId);
    const tier = subscription ? this.getSubscriptionTier(subscription.tierId) : this.getSubscriptionTier('free');
    
    if (!tier) return false;
    
    const limit = tier.limits[action];
    
    // Unlimited
    if (limit === -1) return true;
    
    // Check usage against limit
    const usage = this.getUsageForAction(userId, action);
    return typeof limit === 'number' ? usage < limit : true;
  }

  // Get usage for specific action
  getUsageForAction(userId: string, action: keyof UsageLimits): number {
    const usageKey = `astra-academy-usage-${userId}`;
    const usage = JSON.parse(localStorage.getItem(usageKey) || '{}');
    return usage[action] || 0;
  }

  // Increment usage for specific action
  incrementUsage(userId: string, action: keyof UsageLimits): void {
    const usageKey = `astra-academy-usage-${userId}`;
    const usage = JSON.parse(localStorage.getItem(usageKey) || '{}');
    usage[action] = (usage[action] || 0) + 1;
    localStorage.setItem(usageKey, JSON.stringify(usage));
  }

  // Reset monthly usage (called on first day of month)
  resetMonthlyUsage(userId: string): void {
    const usageKey = `astra-academy-usage-${userId}`;
    const usage = JSON.parse(localStorage.getItem(usageKey) || '{}');
    
    // Reset monthly counters
    usage.worksheetsPerMonth = 0;
    usage.exportsPerMonth = 0;
    
    localStorage.setItem(usageKey, JSON.stringify(usage));
  }

  // Get usage summary for user
  getUserUsageSummary(userId: string): Record<string, { used: number; limit: number; unlimited: boolean }> {
    const subscription = this.getUserSubscription(userId);
    const tier = subscription ? this.getSubscriptionTier(subscription.tierId) : this.getSubscriptionTier('free');
    
    if (!tier) return {};
    
    const summary: Record<string, { used: number; limit: number; unlimited: boolean }> = {};
    
    Object.entries(tier.limits).forEach(([key, limit]) => {
      const used = this.getUsageForAction(userId, key as keyof UsageLimits);
      summary[key] = {
        used,
        limit: limit === -1 ? 0 : limit,
        unlimited: limit === -1,
      };
    });
    
    return summary;
  }

  // Calculate savings for yearly subscription
  calculateYearlySavings(tierId: string): number {
    const tier = this.getSubscriptionTier(tierId);
    if (!tier || tier.price === 0) return 0;
    
    const monthlyTotal = tier.price * 12;
    const yearlyPrice = tier.yearlyPrice;
    
    return monthlyTotal - yearlyPrice;
  }

  // Get recommended tier based on usage
  getRecommendedTier(userId: string): string {
    const usage = this.getUserUsageSummary(userId);
    
    // Check if user is hitting limits
    const isHittingLimits = Object.values(usage).some(item => 
      !item.unlimited && item.used >= item.limit * 0.8
    );
    
    if (isHittingLimits) {
      return 'homeschool';
    }
    
    // Check if user needs advanced features
    const needsAdvancedFeatures = usage.students?.used > 3 || usage.customFonts?.used > 5;
    
    if (needsAdvancedFeatures) {
      return 'school';
    }
    
    return 'free';
  }

  private getAllSubscriptions(): UserSubscription[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }
}

// Payment processing utilities (mock implementation)
export class PaymentProcessor {
  // Create payment intent
  async createPaymentIntent(
    userId: string, 
    tierId: string, 
    isYearly: boolean = false
  ): Promise<PaymentIntent> {
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) throw new Error('Invalid subscription tier');
    
    const amount = isYearly ? tier.yearlyPrice : tier.price;
    
    // In a real app, this would call Stripe API
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount,
      currency: 'usd',
      tierId,
      status: 'pending',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    
    // Store payment intent
    this.storePaymentIntent(paymentIntent);
    
    return paymentIntent;
  }

  // Confirm payment (mock)
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = this.getPaymentIntent(paymentIntentId);
    if (!paymentIntent) return false;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update payment intent status
    paymentIntent.status = 'succeeded';
    this.storePaymentIntent(paymentIntent);
    
    // Create subscription
    const subscriptionManager = new SubscriptionManager();
    const subscription: UserSubscription = {
      userId: paymentIntent.userId,
      tierId: paymentIntent.tierId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      autoRenew: true,
      paymentMethod: 'card',
      lastPaymentDate: new Date(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amountPaid: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
    
    subscriptionManager.updateSubscription(subscription);
    
    return true;
  }

  // Get payment intent
  getPaymentIntent(paymentIntentId: string): PaymentIntent | null {
    const stored = localStorage.getItem('astra-academy-payment-intents');
    const intents = stored ? JSON.parse(stored) : [];
    return intents.find((pi: PaymentIntent) => pi.id === paymentIntentId) || null;
  }

  private storePaymentIntent(paymentIntent: PaymentIntent): void {
    const stored = localStorage.getItem('astra-academy-payment-intents');
    const intents = stored ? JSON.parse(stored) : [];
    const index = intents.findIndex((pi: PaymentIntent) => pi.id === paymentIntent.id);
    
    if (index >= 0) {
      intents[index] = paymentIntent;
    } else {
      intents.push(paymentIntent);
    }
    
    localStorage.setItem('astra-academy-payment-intents', JSON.stringify(intents));
  }
}

// Export singleton instances
export const subscriptionManager = new SubscriptionManager();
export const paymentProcessor = new PaymentProcessor();
