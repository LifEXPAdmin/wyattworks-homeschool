"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileLayout } from "@/components/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Bell, Shield, Crown, AlertCircle, CheckCircle, Settings, Save } from "lucide-react";
import { getQuotaUsage } from "@/lib/quota";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";

export default function AccountSettingsPage() {
  const { user } = useUser();
  const [quotaInfo, setQuotaInfo] = useState<{
    currentMonth: string;
    used: number;
    limit: number;
    remaining: number;
    plan: string;
    history: Array<{ month: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    worksheetReminders: true,
    quotaWarnings: true,
    marketingEmails: false,
  });

  useEffect(() => {
    const loadQuotaInfo = async () => {
      if (!user?.id) return;

      try {
        const quota = await getQuotaUsage(user.id);
        setQuotaInfo(quota);
      } catch (error) {
        console.error("Failed to load quota info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.emailAddresses[0]?.emailAddress || "");

      loadQuotaInfo();
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user profile
      await user?.update({
        firstName,
        lastName,
      });

      // Here you would typically save other preferences to your database
      // For now, we'll just show a success message
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-500";
      case "basic":
        return "bg-blue-500";
      case "pro":
        return "bg-purple-500";
      case "premium":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPlanDisplayName = (plan: string) => {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === plan);
    return tier?.name || "Free";
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile, preferences, and account information
          </p>
        </div>

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Overview
            </CardTitle>
            <CardDescription>Your current account status and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Plan:</span>
                  <Badge className={`${getPlanColor(quotaInfo?.plan || "free")} text-white`}>
                    {getPlanDisplayName(quotaInfo?.plan || "free")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Member since:</span>
                  <span className="text-sm">{user?.createdAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Email verified:</span>
                  <div className="flex items-center gap-1">
                    {user?.emailAddresses[0]?.verification?.status === "verified" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {user?.emailAddresses[0]?.verification?.status === "verified" ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {quotaInfo && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Monthly Exports:</span>
                      <span className="text-sm">
                        {quotaInfo.limit === Infinity
                          ? "Unlimited"
                          : `${quotaInfo.used}/${quotaInfo.limit}`}
                      </span>
                    </div>
                    {quotaInfo.limit !== Infinity && (
                      <Progress value={(quotaInfo.used / quotaInfo.limit) * 100} className="h-2" />
                    )}
                  </div>

                  {quotaInfo.plan === "free" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Crown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Upgrade for More</span>
                      </div>
                      <p className="mb-2 text-xs text-blue-700">
                        Get unlimited exports and premium features
                      </p>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Crown className="mr-1 h-3 w-3" />
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} disabled placeholder="Email address" />
                <p className="text-xs text-gray-500">
                  Email changes must be made through your authentication provider
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what notifications you'd like to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Updates</Label>
                  <p className="text-xs text-gray-500">
                    Receive updates about new features and improvements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailUpdates}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, emailUpdates: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Worksheet Reminders</Label>
                  <p className="text-xs text-gray-500">Get reminders about incomplete worksheets</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.worksheetReminders}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, worksheetReminders: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Quota Warnings</Label>
                  <p className="text-xs text-gray-500">
                    Get notified when approaching your export limit
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.quotaWarnings}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, quotaWarnings: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Marketing Emails</Label>
                  <p className="text-xs text-gray-500">
                    Receive promotional content and special offers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketingEmails}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, marketingEmails: e.target.checked }))
                  }
                  className="rounded border-gray-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>Manage your account security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="mr-1 h-3 w-3" />
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Data Export</Label>
                  <p className="text-xs text-gray-500">
                    Download all your data in a portable format
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-3 w-3" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Delete Account</Label>
                  <p className="text-xs text-gray-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
            {saving ? (
              <>
                <Settings className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
