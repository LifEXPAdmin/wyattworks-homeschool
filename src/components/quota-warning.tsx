"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Crown, TrendingUp, Zap, CheckCircle, X } from "lucide-react";
import { checkQuota } from "@/lib/quota";

interface QuotaWarningProps {
  userId: string;
  className?: string;
  showUpgradePrompt?: boolean;
}

export function QuotaWarning({ userId, className, showUpgradePrompt = true }: QuotaWarningProps) {
  const [quotaInfo, setQuotaInfo] = useState<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    currentMonth: string;
    paywall: boolean;
    plan: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadQuotaInfo();
  }, [userId]);

  const loadQuotaInfo = async () => {
    if (!userId) return;

    try {
      const quota = await checkQuota(userId);
      setQuotaInfo(quota);
    } catch (error) {
      console.error("Failed to load quota info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWarningLevel = () => {
    if (!quotaInfo || quotaInfo.limit === Infinity) return null;

    const percentage = (quotaInfo.used / quotaInfo.limit) * 100;
    if (percentage >= 90) return "critical";
    if (percentage >= 75) return "warning";
    if (percentage >= 50) return "info";
    return null;
  };

  const getWarningColor = (level: string) => {
    switch (level) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getIconColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getTextColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-900";
      case "warning":
        return "text-yellow-900";
      case "info":
        return "text-blue-900";
      default:
        return "text-gray-900";
    }
  };

  const getSubTextColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-700";
      case "warning":
        return "text-yellow-700";
      case "info":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  if (loading || !quotaInfo || dismissed) return null;

  const warningLevel = getWarningLevel();
  if (!warningLevel) return null;

  const percentage = (quotaInfo.used / quotaInfo.limit) * 100;

  return (
    <div className={`rounded-lg border p-4 ${getWarningColor(warningLevel)} ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`mt-0.5 h-5 w-5 ${getIconColor(warningLevel)}`} />
        <div className="flex-1">
          <h4 className={`font-medium ${getTextColor(warningLevel)}`}>
            {warningLevel === "critical"
              ? "Export Limit Reached!"
              : warningLevel === "warning"
                ? "Approaching Export Limit"
                : "Export Usage Update"}
          </h4>
          <p className={`mt-1 text-sm ${getSubTextColor(warningLevel)}`}>
            You've used {quotaInfo.used} of {quotaInfo.limit} exports this month.
            {warningLevel === "critical"
              ? " Upgrade to continue creating worksheets."
              : warningLevel === "warning"
                ? " You're approaching your monthly limit."
                : " Consider upgrading for unlimited exports."}
          </p>

          <div className="mt-3">
            <Progress value={percentage} className="h-2" />
            <div className="mt-1 flex justify-between text-xs text-gray-600">
              <span>{quotaInfo.used} used</span>
              <span>{quotaInfo.limit} limit</span>
            </div>
          </div>

          {showUpgradePrompt && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/dashboard/subscription">
                <Button
                  size="sm"
                  className={`${
                    warningLevel === "critical"
                      ? "bg-red-600 hover:bg-red-700"
                      : warningLevel === "warning"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setDismissed(true)}>
                <X className="mr-2 h-4 w-4" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UpgradePromptProps {
  userId: string;
  className?: string;
  variant?: "banner" | "card" | "inline";
}

export function UpgradePrompt({ userId, className, variant = "card" }: UpgradePromptProps) {
  const [quotaInfo, setQuotaInfo] = useState<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    currentMonth: string;
    paywall: boolean;
    plan: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotaInfo();
  }, [userId]);

  const loadQuotaInfo = async () => {
    if (!userId) return;

    try {
      const quota = await checkQuota(userId);
      setQuotaInfo(quota);
    } catch (error) {
      console.error("Failed to load quota info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quotaInfo || quotaInfo.limit === Infinity) return null;

  const benefits = [
    "Unlimited worksheet exports",
    "Premium templates and themes",
    "Advanced analytics and reports",
    "Priority customer support",
    "Multiple export formats",
  ];

  if (variant === "banner") {
    return (
      <div
        className={`rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Unlock Unlimited Exports</h3>
              <p className="text-sm opacity-90">
                Upgrade to Pro for unlimited worksheets and premium features
              </p>
            </div>
          </div>
          <Link href="/dashboard/subscription">
            <Button variant="secondary" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`rounded-lg border border-blue-200 bg-blue-50 p-3 ${className}`}>
        <div className="mb-2 flex items-center gap-2">
          <Crown className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Upgrade for More</span>
        </div>
        <p className="mb-2 text-xs text-blue-700">Get unlimited exports and premium features</p>
        <Link href="/dashboard/subscription">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Crown className="mr-1 h-3 w-3" />
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Crown className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl text-blue-900">Upgrade to Pro</CardTitle>
        <CardDescription className="text-blue-700">
          Unlock unlimited exports and premium features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-blue-900">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">$9</div>
            <div className="text-sm text-blue-700">per month</div>
          </div>

          <Link href="/dashboard/subscription" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </Link>

          <p className="text-center text-xs text-blue-600">14-day free trial • Cancel anytime</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuotaDisplayProps {
  userId: string;
  className?: string;
  showProgress?: boolean;
}

export function QuotaDisplay({ userId, className, showProgress = true }: QuotaDisplayProps) {
  const [quotaInfo, setQuotaInfo] = useState<{
    allowed: boolean;
    remaining: number;
    limit: number;
    used: number;
    currentMonth: string;
    paywall: boolean;
    plan: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotaInfo();
  }, [userId]);

  const loadQuotaInfo = async () => {
    if (!userId) return;

    try {
      const quota = await checkQuota(userId);
      setQuotaInfo(quota);
    } catch (error) {
      console.error("Failed to load quota info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !quotaInfo) return null;

  if (quotaInfo.limit === Infinity) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="mr-1 h-3 w-3" />
          Unlimited
        </Badge>
      </div>
    );
  }

  const percentage = (quotaInfo.used / quotaInfo.limit) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Monthly Exports</span>
        <span className="text-sm text-gray-900">
          {quotaInfo.used}/{quotaInfo.limit}
        </span>
      </div>

      {showProgress && <Progress value={percentage} className="h-2" />}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{quotaInfo.remaining} remaining</span>
        <span>{Math.round(percentage)}% used</span>
      </div>
    </div>
  );
}
