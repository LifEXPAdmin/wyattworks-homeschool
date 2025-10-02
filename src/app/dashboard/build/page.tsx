"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  FileText,
  Zap,
  Crown,
  CheckCircle,
  XCircle,
  Lock,
  Play,
  Eye,
  ArrowRight,
  Star,
  Target,
  Clock,
  Trophy,
  Download,
} from "lucide-react";

const FREE_FEATURES = [
  {
    icon: FileText,
    title: "PDF Worksheets",
    description: "Create unlimited math, language arts, and science worksheets",
    limit: "Unlimited",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download and print your worksheets",
    limit: "15 per month",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Eye,
    title: "Basic Templates",
    description: "Access to essential worksheet templates",
    limit: "5 templates",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description: "Timed quizzes with instant grading and progress tracking",
    preview: "Take a quick quiz to test your knowledge with drag-and-drop questions",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Zap,
    title: "Advanced Templates",
    description: "Access to premium templates and customization options",
    preview: "Professional-grade templates with advanced styling options",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Target,
    title: "Progress Analytics",
    description: "Detailed analytics and learning progress tracking",
    preview: "Track performance, identify strengths, and monitor improvement",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Crown,
    title: "Priority Support",
    description: "Get help when you need it with priority customer support",
    preview: "24/7 support with faster response times",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
];

export default function BuildPage() {
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-4">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Start Building</h1>
          <p className="text-lg text-gray-600">
            Choose what you'd like to create and see what's available in your plan
          </p>
        </div>

        {/* Usage Overview */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Your Plan Overview
              </CardTitle>
              <CardDescription>
                You're currently on the Free plan with access to core features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PDF Exports</span>
                    <Badge variant="outline">12/15 used</Badge>
                  </div>
                  <Progress value={80} className="mt-2" />
                  <p className="mt-1 text-xs text-gray-500">3 exports remaining this month</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Worksheets Created</span>
                    <Badge variant="outline">Unlimited</Badge>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-green-200">
                    <div className="h-2 w-full rounded-full bg-green-500"></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">No limits on creation</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Templates Used</span>
                    <Badge variant="outline">2/5 used</Badge>
                  </div>
                  <Progress value={40} className="mt-2" />
                  <p className="mt-1 text-xs text-gray-500">3 templates remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">What would you like to build?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* PDF Worksheets - Always Available */}
            <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500 p-2">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">PDF Worksheets</CardTitle>
                      <CardDescription>Create printable worksheets</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Free</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Create unlimited math, language arts, and science worksheets with our easy-to-use builder.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Unlimited worksheet creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>15 PDF exports per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Basic templates included</span>
                  </div>
                </div>
                <Link href="/dashboard/create" className="mt-4 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Create PDF Worksheet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Interactive Quizzes - Premium */}
            <Card className="border-2 border-orange-200 bg-orange-50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-500 p-2">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Interactive Quizzes</CardTitle>
                      <CardDescription>Timed knowledge tests</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Premium</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Take timed quizzes with instant grading, progress tracking, and interactive questions.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-orange-500" />
                    <span>Timed quizzes with countdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-orange-500" />
                    <span>Instant grading & feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-orange-500" />
                    <span>Progress tracking & analytics</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => setShowQuizPreview(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Quiz
                  </Button>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Access
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Templates - Premium */}
            <Card className="border-2 border-purple-200 bg-purple-50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-500 p-2">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Advanced Templates</CardTitle>
                      <CardDescription>Premium design options</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Access professional-grade templates with advanced styling and customization options.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-purple-500" />
                    <span>50+ premium templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-purple-500" />
                    <span>Advanced styling options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-purple-500" />
                    <span>Custom branding</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                    onClick={() => setShowTemplatePreview(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Templates
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Free vs Premium Features</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Free Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Free Plan
                </CardTitle>
                <CardDescription>Everything you need to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {FREE_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${feature.bgColor}`}>
                        <feature.icon className={`h-4 w-4 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{feature.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {feature.limit}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium Plan
                  <Badge className="bg-yellow-100 text-yellow-800">$9.99/month</Badge>
                </CardTitle>
                <CardDescription>Everything in Free + premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PREMIUM_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${feature.bgColor}`}>
                        <feature.icon className={`h-4 w-4 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{feature.title}</h4>
                          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quiz Preview Modal */}
        {showQuizPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-semibold">Interactive Quiz Preview</h3>
                <Button variant="outline" onClick={() => setShowQuizPreview(false)}>
                  Close
                </Button>
              </div>
              <div className="p-6">
                <div className="mb-4 rounded-lg bg-orange-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold">Math Quiz - Addition</h4>
                    <Badge variant="outline">Easy • 5 questions • 5 min</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Test your addition skills with this interactive quiz featuring drag-and-drop answers and instant feedback.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium">Question 1 of 5</span>
                      <div className="flex items-center gap-1 text-sm text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>4:23 remaining</span>
                      </div>
                    </div>
                    <p className="mb-4 text-lg">What is 7 + 5?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 11, 12, 13, 14, 15].map((num) => (
                        <div
                          key={num}
                          className={`rounded-lg border-2 border-dashed p-3 text-center ${
                            num === 12 ? 'border-green-300 bg-green-50' : 'border-gray-300'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        💡 Drag the correct answer to the box above
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Score: 0/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Best: --</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Take Quiz
                  </Button>
                  <Button variant="outline" onClick={() => setShowQuizPreview(false)}>
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Modal */}
        {showTemplatePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-4xl rounded-lg bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-semibold">Premium Template Preview</h3>
                <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
                  Close
                </Button>
              </div>
              <div className="p-6">
                <div className="mb-4 rounded-lg bg-purple-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Professional Templates</h4>
                    <Badge variant="outline">50+ templates</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Access to professionally designed templates with advanced styling, custom fonts, and branding options.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 h-32 rounded bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h5 className="font-medium">Math Master Template</h5>
                    <p className="text-sm text-gray-600 mb-2">Professional math worksheet with custom styling</p>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 h-32 rounded bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                    <h5 className="font-medium">Language Arts Pro</h5>
                    <p className="text-sm text-gray-600 mb-2">Advanced language arts template with custom fonts</p>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 h-32 rounded bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-orange-600" />
                    </div>
                    <h5 className="font-medium">Science Explorer</h5>
                    <p className="text-sm text-gray-600 mb-2">Interactive science template with diagrams</p>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 h-32 rounded bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-purple-600" />
                    </div>
                    <h5 className="font-medium">Custom Branded</h5>
                    <p className="text-sm text-gray-600 mb-2">Add your own logo and branding</p>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Access Templates
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
