"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Crown } from "lucide-react";
import Link from "next/link";

interface TrialReminderProps {
  userId: string;
  className?: string;
}

interface TrialInfo {
  needsReminder: boolean;
  daysUntilTrialEnd: number;
  trialEnd: string;
}

export function TrialReminder({ userId, className }: TrialReminderProps) {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkTrialReminder = async () => {
      try {
        const response = await fetch(`/api/trial-reminders?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setTrialInfo(data);
        }
      } catch (error) {
        console.error("Failed to check trial reminder:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTrialReminder();
  }, [userId]);

  if (loading || dismissed || !trialInfo?.needsReminder) {
    return null;
  }

  const getReminderType = () => {
    if (trialInfo.daysUntilTrialEnd === 1) {
      return {
        type: "critical",
        title: "Trial Ends Tomorrow!",
        message: "Your free trial ends tomorrow. Upgrade now to keep your premium features.",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-900",
        iconColor: "text-red-500",
      };
    } else if (trialInfo.daysUntilTrialEnd === 2) {
      return {
        type: "warning",
        title: "Trial Ending Soon",
        message:
          "Your free trial ends in 2 days. Consider upgrading to continue enjoying premium features.",
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-900",
        iconColor: "text-yellow-500",
      };
    }
    return null;
  };

  const reminder = getReminderType();
  if (!reminder) return null;

  return (
    <div className={`rounded-lg border p-4 ${reminder.bgColor} ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`mt-0.5 h-5 w-5 ${reminder.iconColor}`} />
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h4 className={`font-medium ${reminder.textColor}`}>{reminder.title}</h4>
            <Badge variant="outline" className={`${reminder.textColor} border-current`}>
              {trialInfo.daysUntilTrialEnd} day{trialInfo.daysUntilTrialEnd !== 1 ? "s" : ""} left
            </Badge>
          </div>
          <p className={`text-sm ${reminder.textColor} mb-3`}>{reminder.message}</p>
          <div className="flex gap-2">
            <Link href="/dashboard/subscription">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissed(true)}
              className={reminder.textColor}
            >
              Remind Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrialStatus({ userId, className }: TrialReminderProps) {
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await fetch(`/api/trial-reminders?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setTrialInfo(data);
        }
      } catch (error) {
        console.error("Failed to check trial status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTrialStatus();
  }, [userId]);

  if (loading || !trialInfo || trialInfo.daysUntilTrialEnd <= 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-blue-500" />
      <span className="text-sm text-gray-600">
        Free trial: {trialInfo.daysUntilTrialEnd} day{trialInfo.daysUntilTrialEnd !== 1 ? "s" : ""}{" "}
        remaining
      </span>
    </div>
  );
}
