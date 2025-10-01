"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  X,
  Crown,
  Star,
  BarChart3,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { SUBSCRIPTION_TIERS, subscriptionManager, type UserSubscription } from "@/lib/subscription";
import { STRIPE_CONFIG, formatPrice } from "@/lib/stripe";

interface SubscriptionDashboardProps {
  userId: string;
  className?: string;
}

export function SubscriptionDashboard({ userId, className }: SubscriptionDashboardProps) {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [usageSummary, setUsageSummary] = useState<
    Record<string, { used: number; limit: number; unlimited: boolean }>
  >({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionData = useCallback(() => {
    const subscription = subscriptionManager.getUserSubscription(userId);
    const usage = subscriptionManager.getUserUsageSummary(userId);

    setCurrentSubscription(subscription);
    setUsageSummary(usage);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadSubscriptionData();
  }, [userId, loadSubscriptionData]);

  const handleUpgrade = async (tierId: string, yearly: boolean) => {
    setIsProcessingPayment(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: tierId, isYearly: yearly }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.open(url, "_blank");
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal. Please try again.");
    }
  };

  const handleCancelSubscription = () => {
    if (
      confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period."
      )
    ) {
      subscriptionManager.cancelSubscription(userId);
      loadSubscriptionData();
      alert("Subscription cancelled. You'll retain access until the end of your billing period.");
    }
  };

  const getTierColor = (tierId: string) => {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    switch (tier?.color) {
      case "blue":
        return "bg-blue-500";
      case "purple":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatPriceDisplay = (price: number) => {
    return formatPrice(price);
  };

  const getUsagePercentage = (used: number, limit: number, unlimited: boolean) => {
    if (unlimited) return 0;
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTier = currentSubscription
    ? SUBSCRIPTION_TIERS.find((t) => t.id === currentSubscription.tierId)
    : SUBSCRIPTION_TIERS.find((t) => t.id === "free");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription & Billing</h2>
          <p className="text-gray-600">Manage your subscription and view usage</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getTierColor(currentTier?.id || "free")} text-white`}>
            {currentTier?.name || "Free"}
          </Badge>
          {currentSubscription?.status === "active" && (
            <Badge variant="outline" className="border-green-600 text-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold">{currentTier?.name}</h3>
                <p className="mb-4 text-gray-600">{currentTier?.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next billing date:</span>
                    <span className="font-medium">
                      {currentSubscription.nextPaymentDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {formatPrice(currentSubscription.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Auto-renew:</span>
                    <span className="font-medium">
                      {currentSubscription.autoRenew ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleManageSubscription} variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleCancelSubscription} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </Button>
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>Your current usage for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(usageSummary).map(([key, usage]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {usage.unlimited ? "Unlimited" : `${usage.used}/${usage.limit}`}
                  </span>
                </div>
                {!usage.unlimited && (
                  <Progress
                    value={getUsagePercentage(usage.used, usage.limit, usage.unlimited)}
                    className="h-2"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Available Plans
          </CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Billing Toggle */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              <Button
                variant={!isYearly ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsYearly(false)}
                className="px-4"
              >
                Monthly
              </Button>
              <Button
                variant={isYearly ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsYearly(true)}
                className="px-4"
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 17%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrentTier = currentTier?.id === tier.id;
              const stripePlan = STRIPE_CONFIG.plans[tier.id as keyof typeof STRIPE_CONFIG.plans];
              const price = stripePlan
                ? isYearly
                  ? stripePlan.yearlyPrice
                  : stripePlan.monthlyPrice
                : isYearly
                  ? tier.yearlyPrice
                  : tier.price;
              const savings = subscriptionManager.calculateYearlySavings(tier.id);

              return (
                <Card
                  key={tier.id}
                  className={`relative ${tier.popular ? "ring-2 ring-blue-500" : ""} ${
                    isCurrentTier ? "border-blue-200 bg-blue-50" : ""
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                      <Badge className="bg-blue-500 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatPriceDisplay(price)}
                        <span className="text-sm font-normal text-gray-600">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </div>
                      {isYearly && savings > 0 && (
                        <div className="text-sm font-medium text-green-600">
                          Save {formatPriceDisplay(savings)}/year
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      {tier.features.map((feature) => (
                        <div key={feature.id} className="flex items-center gap-2">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${feature.included ? "text-gray-900" : "text-gray-500"}`}
                          >
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full ${tier.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      variant={isCurrentTier ? "outline" : "default"}
                      disabled={isCurrentTier || isProcessingPayment}
                      onClick={() => handleUpgrade(tier.id, isYearly)}
                    >
                      {isProcessingPayment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCurrentTier ? (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <Crown className="mr-2 h-4 w-4" />
                      )}
                      {isCurrentTier ? "Current Plan" : `Upgrade to ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentSubscription ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{currentTier?.name} Subscription</p>
                    <p className="text-sm text-gray-600">
                      {currentSubscription.lastPaymentDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(currentSubscription.amountPaid)}</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No billing history available</p>
                <p className="text-sm">Upgrade to a paid plan to see your billing history here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage Limit Warning Component
interface UsageLimitWarningProps {
  userId: string;
  action: string;
  className?: string;
}

export function UsageLimitWarning({ userId, action, className }: UsageLimitWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number; unlimited: boolean } | null>(
    null
  );

  useEffect(() => {
    const usageSummary = subscriptionManager.getUserUsageSummary(userId);
    const actionUsage = usageSummary[action];

    if (actionUsage && !actionUsage.unlimited) {
      const percentage = (actionUsage.used / actionUsage.limit) * 100;
      if (percentage >= 80) {
        setUsage(actionUsage);
        setShowWarning(true);
      }
    }
  }, [userId, action]);

  if (!showWarning || !usage) return null;

  const percentage = (usage.used / usage.limit) * 100;

  return (
    <div
      className={`rounded-lg border p-4 ${className} ${
        percentage >= 90 ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`mt-0.5 h-5 w-5 ${percentage >= 90 ? "text-red-500" : "text-yellow-500"}`}
        />
        <div className="flex-1">
          <h4 className={`font-medium ${percentage >= 90 ? "text-red-900" : "text-yellow-900"}`}>
            {percentage >= 90 ? "Usage Limit Reached" : "Approaching Usage Limit"}
          </h4>
          <p className={`mt-1 text-sm ${percentage >= 90 ? "text-red-700" : "text-yellow-700"}`}>
            You've used {usage.used} of {usage.limit}{" "}
            {action
              .replace(/([A-Z])/g, " $1")
              .trim()
              .toLowerCase()}{" "}
            this month.
            {percentage >= 90
              ? " Consider upgrading to continue."
              : " You're approaching your limit."}
          </p>
          <div className="mt-2">
            <Progress value={percentage} className="h-2" />
          </div>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => (window.location.href = "/dashboard/subscription")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
