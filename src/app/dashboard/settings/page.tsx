"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Settings,
  BarChart3,
  History,
  Clock,
  BookOpen,
  TrendingUp,
  Target,
  Star,
  Download,
  Users,
} from "lucide-react";
import { StudentManager } from "@/components/student-manager";

// Mock data - in a real app, this would come from an API
const mockHomeworkHistory = [
  {
    id: "hw-1",
    title: "Math Practice - Addition",
    subject: "Math",
    grade: "3-4",
    completedAt: new Date("2024-01-15T14:30:00"),
    timeSpent: 15, // minutes
    score: 95,
    totalProblems: 20,
    correctAnswers: 19,
    difficulty: "Medium",
  },
  {
    id: "hw-2",
    title: "Spelling Words - Week 1",
    subject: "Language Arts",
    grade: "1-2",
    completedAt: new Date("2024-01-14T10:15:00"),
    timeSpent: 8,
    score: 100,
    totalProblems: 10,
    correctAnswers: 10,
    difficulty: "Easy",
  },
  {
    id: "hw-3",
    title: "Science Quiz - Plants",
    subject: "Science",
    grade: "2-3",
    completedAt: new Date("2024-01-13T16:45:00"),
    timeSpent: 12,
    score: 85,
    totalProblems: 15,
    correctAnswers: 13,
    difficulty: "Medium",
  },
];

const mockAnalytics = {
  totalWorksheets: 47,
  totalTimeSpent: 342, // minutes
  averageScore: 91,
  favoriteSubject: "Math",
  streak: 12,
  weeklyProgress: [
    { week: "Week 1", completed: 8, averageScore: 88 },
    { week: "Week 2", completed: 12, averageScore: 92 },
    { week: "Week 3", completed: 15, averageScore: 94 },
    { week: "Week 4", completed: 12, averageScore: 90 },
  ],
  subjectBreakdown: [
    { subject: "Math", count: 28, averageScore: 93 },
    { subject: "Language Arts", count: 12, averageScore: 89 },
    { subject: "Science", count: 7, averageScore: 87 },
  ],
};

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUser();
  const [accountInfo, setAccountInfo] = useState({
    displayName: "",
    email: "",
    gradeLevel: "K",
  });

  useEffect(() => {
    if (user) {
      setAccountInfo({
        displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        email: user.emailAddresses[0]?.emailAddress || "",
        gradeLevel: "K", // Default for parent account
      });
    }
  }, [user]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account, view analytics, and track progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Worksheets</CardTitle>
                  <BookOpen className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.totalWorksheets}</div>
                  <p className="text-muted-foreground text-xs">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.averageScore}%</div>
                  <p className="text-muted-foreground text-xs">+3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(mockAnalytics.totalTimeSpent / 60)}h{" "}
                    {mockAnalytics.totalTimeSpent % 60}m
                  </div>
                  <p className="text-muted-foreground text-xs">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Star className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.streak}</div>
                  <p className="text-muted-foreground text-xs">Days in a row</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Subject</CardTitle>
                  <CardDescription>Your most practiced subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-2xl">📐</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{mockAnalytics.favoriteSubject}</h3>
                      <p className="text-muted-foreground text-sm">
                        {
                          mockAnalytics.subjectBreakdown.find(
                            (s) => s.subject === mockAnalytics.favoriteSubject
                          )?.count
                        }{" "}
                        worksheets completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest worksheet completions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockHomeworkHistory.slice(0, 3).map((homework) => (
                      <div key={homework.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{homework.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(homework.completedAt)}
                          </p>
                        </div>
                        <Badge className={getScoreColor(homework.score)}>{homework.score}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <StudentManager userId="current-user" />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Worksheets completed and average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.weeklyProgress.map((week, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{week.week}</p>
                          <p className="text-muted-foreground text-sm">
                            {week.completed} worksheets
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{week.averageScore}%</p>
                          <div className="h-2 w-20 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${week.averageScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Breakdown</CardTitle>
                  <CardDescription>Performance by subject area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.subjectBreakdown.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm">
                              {subject.subject === "Math"
                                ? "📐"
                                : subject.subject === "Language Arts"
                                  ? "📚"
                                  : "🔬"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{subject.subject}</p>
                            <p className="text-muted-foreground text-sm">
                              {subject.count} worksheets
                            </p>
                          </div>
                        </div>
                        <Badge className={getScoreColor(subject.averageScore)}>
                          {subject.averageScore}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download your progress and analytics data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homework History</CardTitle>
                <CardDescription>Complete record of all completed worksheets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHomeworkHistory.map((homework) => (
                    <div key={homework.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="font-semibold">{homework.title}</h3>
                            <Badge variant="outline">{homework.difficulty}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                              <p className="text-muted-foreground">Subject</p>
                              <p className="font-medium">{homework.subject}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Grade Level</p>
                              <p className="font-medium">{homework.grade}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time Spent</p>
                              <p className="font-medium">{homework.timeSpent} minutes</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Completed</p>
                              <p className="font-medium">{formatDate(homework.completedAt)}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Target className="text-muted-foreground h-4 w-4" />
                              <span className="text-sm">
                                {homework.correctAnswers}/{homework.totalProblems} correct
                              </span>
                            </div>
                            <Badge className={getScoreColor(homework.score)}>
                              {homework.score}% Score
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    value={accountInfo.displayName}
                    onChange={(e) =>
                      setAccountInfo({ ...accountInfo, displayName: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={accountInfo.email}
                    readOnly
                    className="mt-1 w-full rounded-md border bg-gray-50 px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email is managed by your Google account
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type</label>
                  <select className="mt-1 w-full rounded-md border px-3 py-2" disabled>
                    <option>Parent/Teacher Account</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Create student accounts in the Students tab
                  </p>
                </div>
                <Button className="homeschool-button">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-muted-foreground text-sm">
                      Get notified about progress and achievements
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-save Progress</p>
                    <p className="text-muted-foreground text-sm">Automatically save your work</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Hints</p>
                    <p className="text-muted-foreground text-sm">
                      Display helpful hints during exercises
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
