"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Award,
  Clock,
  Star,
  Activity,
  Zap,
} from "lucide-react";
import { AnalyticsManager } from "@/lib/analytics-simple";

interface AnalyticsDashboardProps {
  userId: string;
  className?: string;
}

export function AnalyticsDashboard({ userId, className }: AnalyticsDashboardProps) {
  const [userAnalytics, setUserAnalytics] = useState<{
    userId: string;
    totalWorksheets: number;
    totalCompletions: number;
    averageScore: number;
    favoriteSubjects: string[];
    lastActive: Date;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadAnalytics = () => {
    const analytics = AnalyticsManager.getUserAnalytics(userId);
    setUserAnalytics(analytics);
  };

  useEffect(() => {
    loadAnalytics();
  }, [userId, loadAnalytics]);

  if (!userAnalytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{userAnalytics.totalWorksheets}</div>
                        <div className="text-sm text-gray-600">Worksheets</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{userAnalytics.totalCompletions}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{userAnalytics.averageScore}%</div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">7</div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Completed Math Worksheet</div>
                          <div className="text-sm text-gray-600">Grade 3 Addition</div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">95%</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Created Science Worksheet</div>
                          <div className="text-sm text-gray-600">Biology - Cells</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">New</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Joined Collaboration</div>
                          <div className="text-sm text-gray-600">Language Arts Project</div>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userAnalytics.favoriteSubjects.map((subject: string, index: number) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{subject}</span>
                          <span className="text-sm text-gray-600">85%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: "85%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="mb-1 text-xs text-gray-600">{day}</div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                          {index < 5 ? "✓" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <h4 className="mb-2 font-medium text-green-800">Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-800">Mathematics</Badge>
                        <Badge className="bg-green-100 text-green-800">Problem Solving</Badge>
                      </div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-2 font-medium text-yellow-800">Areas for Improvement</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Reading Comprehension
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">Writing Skills</Badge>
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 font-medium text-blue-800">Recommendations</h4>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li>• Practice reading comprehension exercises</li>
                        <li>• Try more challenging math problems</li>
                        <li>• Focus on writing practice</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">First Worksheet</div>
                      <div className="text-xs text-gray-600">Completed your first worksheet</div>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">Perfect Score</div>
                      <div className="text-xs text-gray-600">Got 100% on a worksheet</div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">Speed Demon</div>
                      <div className="text-xs text-gray-600">
                        Completed worksheet in under 5 minutes
                      </div>
                    </div>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">Collaborator</div>
                      <div className="text-xs text-gray-600">Joined your first collaboration</div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center opacity-50">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">Master Learner</div>
                      <div className="text-xs text-gray-600">Complete 100 worksheets</div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center opacity-50">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium">Streak Master</div>
                      <div className="text-xs text-gray-600">Maintain a 30-day streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
