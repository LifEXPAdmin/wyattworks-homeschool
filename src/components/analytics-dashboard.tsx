'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Download,
  Calendar,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Star,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { 
  analyticsStorage, 
  LearningMetrics, 
  ParentReport, 
  SubjectAnalytics,
  TimeAnalytics,
  DifficultyAnalytics,
  ExportData
} from '@/lib/analytics';

interface AnalyticsDashboardProps {
  studentId: string;
  className?: string;
}

export function AnalyticsDashboard({ studentId, className }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics | null>(null);
  const [reports, setReports] = useState<ParentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadAnalyticsData = useCallback(() => {
    try {
      const currentMetrics = analyticsStorage.getMetrics(studentId);
      const currentSubjectAnalytics = analyticsStorage.getSubjectAnalytics(studentId);
      const currentTimeAnalytics = analyticsStorage.getTimeAnalytics(studentId);
      const currentReports = analyticsStorage.getReports(studentId);

      setMetrics(currentMetrics || null);
      setSubjectAnalytics(currentSubjectAnalytics);
      setTimeAnalytics(currentTimeAnalytics);
      setReports(currentReports);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const generateReport = async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      const report = analyticsStorage.generateParentReport(studentId, period);
      setReports(prev => [report, ...prev]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const exportData = (exportConfig: ExportData) => {
    try {
      const data = analyticsStorage.exportData(studentId, exportConfig);
      
      // Create download link
      const blob = new Blob([data], { 
        type: exportConfig.format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astra-academy-data-${studentId}-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading analytics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              No data available yet. Start creating worksheets to see analytics!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning progress and insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab 
              metrics={metrics} 
              subjectAnalytics={subjectAnalytics}
              timeAnalytics={timeAnalytics}
            />
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <SubjectsTab 
              subjectAnalytics={subjectAnalytics}
              metrics={metrics}
            />
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <TimeTab 
              timeAnalytics={timeAnalytics}
              metrics={metrics}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsTab 
              reports={reports}
              onGenerateReport={generateReport}
              onExportData={exportData}
              studentId={studentId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface OverviewTabProps {
  metrics: LearningMetrics;
  subjectAnalytics: SubjectAnalytics[];
  timeAnalytics: TimeAnalytics | null;
}

function OverviewTab({ metrics, subjectAnalytics, timeAnalytics }: OverviewTabProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Worksheets</p>
                <p className="text-2xl font-bold">{metrics.totalWorksheets}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">{metrics.totalProblems}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{Math.round(metrics.totalTimeSpent)}m</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(metrics.averageAccuracy)}`}>
                  {metrics.averageAccuracy.toFixed(1)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuracy</span>
                <span className={getAccuracyColor(metrics.averageAccuracy)}>
                  {metrics.averageAccuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.averageAccuracy} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Engagement</span>
                <span className={getEngagementColor(metrics.engagementScore)}>
                  {metrics.engagementScore.toFixed(0)}%
                </span>
              </div>
              <Progress value={metrics.engagementScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consistency</span>
                <span className={getEngagementColor(metrics.consistencyScore)}>
                  {metrics.consistencyScore.toFixed(0)}%
                </span>
              </div>
              <Progress value={metrics.consistencyScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Favorite Subject</span>
              <Badge variant="secondary">{metrics.favoriteSubject}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Preferred Difficulty</span>
              <Badge variant="secondary">{metrics.favoriteDifficulty}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg Time/Problem</span>
              <Badge variant="secondary">{metrics.averageTimePerProblem.toFixed(1)}m</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Rate */}
      {metrics.improvementRate !== 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Improvement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {metrics.improvementRate > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
              )}
              <span className={`text-lg font-semibold ${
                metrics.improvementRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.improvementRate > 0 ? '+' : ''}{metrics.improvementRate.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                accuracy change over time
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SubjectsTabProps {
  subjectAnalytics: SubjectAnalytics[];
  metrics: LearningMetrics;
}

function SubjectsTab({ subjectAnalytics, metrics }: SubjectsTabProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectAnalytics.map((subject) => {
          const accuracy = (subject.correctAnswers / subject.totalProblems) * 100;
          
          return (
            <Card key={subject.subject}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{subject.subject}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(subject.improvementTrend)}
                    <Badge variant="outline" className={getTrendColor(subject.improvementTrend)}>
                      {subject.improvementTrend}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Problems Solved</span>
                    <span>{subject.totalProblems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className={accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Spent</span>
                    <span>{Math.round(subject.timeSpent)}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Time/Problem</span>
                    <span>{subject.averageTime.toFixed(1)}m</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>

                <div className="text-xs text-muted-foreground">
                  Last activity: {subject.lastActivity.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subjectAnalytics.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No subject data available yet.</p>
            <p className="text-sm text-muted-foreground">Start creating worksheets to see subject analytics!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TimeTabProps {
  timeAnalytics: TimeAnalytics | null;
  metrics: LearningMetrics;
}

function TimeTab({ timeAnalytics, metrics }: TimeTabProps) {
  if (!timeAnalytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No time data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{timeAnalytics.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{timeAnalytics.longestStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{timeAnalytics.averageSessionLength.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">minutes</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Peak Activity Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {timeAnalytics.peakHours.map((hour) => (
              <Badge key={hour} variant="secondary">
                {hour}:00
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            These are the hours when you&apos;re most active
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReportsTabProps {
  reports: ParentReport[];
  onGenerateReport: (period: 'daily' | 'weekly' | 'monthly') => void;
  onExportData: (config: ExportData) => void;
  studentId: string;
}

function ReportsTab({ reports, onGenerateReport, onExportData, studentId }: ReportsTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateReport = async (period: 'daily' | 'weekly' | 'monthly') => {
    setIsGenerating(true);
    try {
      await onGenerateReport(period);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv', type: 'full_data' | 'progress_only' | 'worksheets_only') => {
    setIsExporting(true);
    try {
      await onExportData({
        studentId,
        exportType: type,
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date(),
        },
        format,
        includeCharts: true,
        includeRecommendations: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Generate Reports
          </CardTitle>
          <CardDescription>
            Create detailed reports for parents and educators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => handleGenerateReport('daily')}
              disabled={isGenerating}
              variant="outline"
            >
              Daily Report
            </Button>
            <Button 
              onClick={() => handleGenerateReport('weekly')}
              disabled={isGenerating}
              variant="outline"
            >
              Weekly Report
            </Button>
            <Button 
              onClick={() => handleGenerateReport('monthly')}
              disabled={isGenerating}
              variant="outline"
            >
              Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Format</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleExportData('json', 'full_data')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  JSON
                </Button>
                <Button 
                  onClick={() => handleExportData('csv', 'full_data')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  CSV
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Type</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleExportData('json', 'worksheets_only')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  Worksheets Only
                </Button>
                <Button 
                  onClick={() => handleExportData('json', 'progress_only')}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  Progress Only
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generated Reports</h3>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reports generated yet.</p>
              <p className="text-sm text-muted-foreground">Generate a report to see detailed insights!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{report.reportPeriod} Report</span>
                    <Badge variant="secondary">
                      {report.generatedAt.toLocaleDateString()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{report.summary.worksheetsCompleted}</p>
                      <p className="text-sm text-muted-foreground">Worksheets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{report.summary.problemsSolved}</p>
                      <p className="text-sm text-muted-foreground">Problems</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{Math.round(report.summary.totalTimeSpent)}</p>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{report.summary.averageAccuracy.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                  </div>

                  {report.summary.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Strengths
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {report.summary.strengths.map((strength, i) => (
                          <Badge key={i} variant="secondary" className="text-green-600">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.summary.improvementAreas.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Areas for Improvement
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {report.summary.improvementAreas.map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-yellow-600">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Insights</h4>
                      <ul className="space-y-1">
                        {report.insights.map((insight, i) => (
                          <li key={i} className="text-sm text-muted-foreground">
                            • {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
