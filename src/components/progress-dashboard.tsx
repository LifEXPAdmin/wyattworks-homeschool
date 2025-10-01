"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain, 
  BarChart3, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Zap
} from "lucide-react";
import { 
  progressTracker, 
  type StudentProgress, 
  type LearningInsight, 
  type DifficultyRecommendation,
  type SpacedRepetitionItem 
} from "@/lib/progress-tracker";

interface ProgressDashboardProps {
  studentId: string;
  className?: string;
}

export function ProgressDashboard({ studentId, className }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [recommendations, setRecommendations] = useState<DifficultyRecommendation[]>([]);
  const [spacedRepetitionItems, setSpacedRepetitionItems] = useState<SpacedRepetitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProgressData = React.useCallback(() => {
    setLoading(true);
    
    // Load progress data
    const studentProgress = progressTracker.getStudentProgress(studentId);
    const learningInsights = progressTracker.generateInsights(studentId);
    const dueItems = progressTracker.getItemsDueForReview(studentId);
    
    // Generate recommendations for different subjects
    const subjects = ["math", "language_arts", "science"];
    const subjectRecommendations = subjects.map(subject => 
      progressTracker.generateDifficultyRecommendation(studentId, subject, "medium")
    );

    setProgress(studentProgress);
    setInsights(learningInsights);
    setRecommendations(subjectRecommendations);
    setSpacedRepetitionItems(dueItems);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "weakness": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "improvement": return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "recommendation": return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "very_easy": return "bg-green-100 text-green-800";
      case "easy": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-orange-100 text-orange-800";
      case "very_hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Progress Data</h3>
        <p className="text-gray-500">Complete some worksheets to see your progress here!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Dashboard</h2>
          <p className="text-gray-600">Track your learning journey and get personalized insights</p>
        </div>
        <Button onClick={loadProgressData} variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Worksheets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.totalWorksheets}</div>
            <p className="text-xs text-muted-foreground">
              {progress.totalProblems} problems completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress.averageAccuracy * 100)}%</div>
            <Progress value={progress.averageAccuracy * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress.averageTimePerProblem)}s</div>
            <p className="text-xs text-muted-foreground">per problem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spacedRepetitionItems.length}</div>
            <p className="text-xs text-muted-foreground">spaced repetition items</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="spaced-repetition">Spaced Repetition</TabsTrigger>
        </TabsList>

        {/* Learning Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Learning Insights
              </CardTitle>
              <CardDescription>
                Personalized insights based on your performance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Complete more worksheets to get personalized insights!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                    >
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">{insight.message}</p>
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(insight.priority)}
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Category: {insight.category}</span>
                          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                          {insight.actionable && (
                            <Badge variant="secondary" className="text-xs">
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Difficulty Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions for optimal learning difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{rec.currentDifficulty} → {rec.recommendedDifficulty}</h4>
                      <Badge className={getDifficultyColor(rec.recommendedDifficulty)}>
                        {rec.recommendedDifficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{rec.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                      <span>Based on: {rec.basedOn.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spaced Repetition Tab */}
        <TabsContent value="spaced-repetition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Spaced Repetition
              </CardTitle>
              <CardDescription>
                Items scheduled for review based on spaced repetition algorithm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {spacedRepetitionItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items due for review right now!</p>
                  <p className="text-sm">Keep practicing to build your spaced repetition schedule.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {spacedRepetitionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium capitalize">{item.problemType}</p>
                          <p className="text-sm text-gray-600">
                            {item.subject} • {item.difficulty} • {item.repetitions} reviews
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Due: {item.nextReview.toLocaleDateString()}</p>
                        <p>Ease: {item.easeFactor.toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Accuracy Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Correct Answers</span>
                  <span className="font-medium text-green-600">{progress.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incorrect Answers</span>
                  <span className="font-medium text-red-600">{progress.incorrectAnswers}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Problems</span>
                  <span>{progress.totalProblems}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Learning Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Worksheets Completed</span>
                  <span className="font-medium">{progress.totalWorksheets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Accuracy</span>
                  <span className="font-medium">{Math.round(progress.averageAccuracy * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Activity</span>
                  <span className="font-medium">{progress.lastActivity.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Session Recorder Component for tracking worksheet completion
interface SessionRecorderProps {
  studentId: string;
  worksheetId: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  onSessionComplete: (sessionId: string) => void;
  className?: string;
}

export function SessionRecorder({ 
  studentId, 
  worksheetId, 
  subject, 
  gradeLevel, 
  difficulty, 
  onSessionComplete,
  className 
}: SessionRecorderProps) {
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [problemAttempts, setProblemAttempts] = useState<Record<string, unknown>[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startSession = () => {
    setSessionStartTime(new Date());
    setIsRecording(true);
  };

  const recordProblemAttempt = (
    problemId: string, 
    problemText: string, 
    correctAnswer: string | number, 
    studentAnswer: string | number, 
    isCorrect: boolean, 
    timeSpent: number, 
    attempts: number = 1, 
    hintsUsed: number = 0
  ) => {
    if (!isRecording) return;

    const attempt = {
      problemId,
      problemText,
      correctAnswer,
      studentAnswer,
      isCorrect,
      timeSpent,
      attempts,
      hintsUsed,
    };

    setProblemAttempts(prev => [...prev, attempt]);
  };

  const completeSession = () => {
    if (!sessionStartTime || problemAttempts.length === 0) return;

    const sessionEndTime = new Date();
    const totalTimeSpent = (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000;
    const correctCount = problemAttempts.filter(p => p.isCorrect).length;
    const incorrectCount = problemAttempts.length - correctCount;

    const session = {
      id: `session-${Date.now()}`,
      studentId,
      worksheetId,
      subject,
      gradeLevel,
      difficulty,
      problemCount: problemAttempts.length,
      correctCount,
      incorrectCount,
      timeSpent: totalTimeSpent,
      completedAt: sessionEndTime,
        problems: problemAttempts as Array<{ problemId: string; correct: boolean; timeSpent: number; attempts: number }>,
    };

    progressTracker.recordSession(session);
    onSessionComplete(session.id);
    
    // Reset session
    setSessionStartTime(null);
    setProblemAttempts([]);
    setIsRecording(false);
  };

  return (
    <div className={className}>
      {!isRecording ? (
        <Button onClick={startSession} className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Start Tracking Session
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Session Active</span>
            </div>
            <span className="text-sm text-gray-600">
              {problemAttempts.length} problems completed
            </span>
          </div>
          <Button onClick={completeSession} variant="outline" className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Session
          </Button>
        </div>
      )}
    </div>
  );
}
