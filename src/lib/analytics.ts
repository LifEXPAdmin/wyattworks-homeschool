// Analytics and reporting system for Astra Academy
// Handles data collection, reporting, and parent dashboards

export interface AnalyticsEvent {
  id: string;
  userId: string;
  studentId: string;
  eventType: AnalyticsEventType;
  timestamp: Date;
  data: Record<string, unknown>;
  sessionId?: string;
  worksheetId?: string;
}

export type AnalyticsEventType = 
  | 'worksheet_created'
  | 'worksheet_exported'
  | 'problem_attempted'
  | 'problem_completed'
  | 'session_started'
  | 'session_completed'
  | 'theme_changed'
  | 'font_changed'
  | 'difficulty_changed'
  | 'subject_changed'
  | 'time_spent'
  | 'error_occurred'
  | 'help_requested'
  | 'feature_used';

export interface LearningMetrics {
  totalWorksheets: number;
  totalProblems: number;
  totalTimeSpent: number; // in minutes
  averageAccuracy: number;
  averageTimePerProblem: number;
  favoriteSubject: string;
  favoriteDifficulty: string;
  improvementRate: number;
  consistencyScore: number;
  engagementScore: number;
}

export interface SubjectAnalytics {
  subject: string;
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  difficultyBreakdown: Record<string, number>;
  timeSpent: number;
  lastActivity: Date;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export interface TimeAnalytics {
  dailyActivity: Record<string, number>; // date -> minutes
  weeklyActivity: Record<string, number>; // week -> minutes
  monthlyActivity: Record<string, number>; // month -> minutes
  peakHours: number[]; // hours of day with most activity
  averageSessionLength: number;
  longestStreak: number; // consecutive days
  currentStreak: number;
}

export interface DifficultyAnalytics {
  difficulty: string;
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  masteryLevel: 'beginner' | 'developing' | 'proficient' | 'advanced';
  recommendedNext: string;
  practiceNeeded: boolean;
}

export interface ParentReport {
  studentId: string;
  reportPeriod: 'daily' | 'weekly' | 'monthly';
  generatedAt: Date;
  summary: {
    totalTimeSpent: number;
    worksheetsCompleted: number;
    problemsSolved: number;
    averageAccuracy: number;
    improvementAreas: string[];
    strengths: string[];
    recommendations: string[];
  };
  subjectBreakdown: SubjectAnalytics[];
  timeBreakdown: TimeAnalytics;
  difficultyProgress: DifficultyAnalytics[];
  insights: string[];
  goals: {
    current: string[];
    achieved: string[];
    next: string[];
  };
}

export interface ExportData {
  studentId: string;
  exportType: 'full_data' | 'progress_only' | 'worksheets_only' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'csv' | 'json' | 'pdf';
  includeCharts: boolean;
  includeRecommendations: boolean;
}

// Analytics data storage
class AnalyticsStorage {
  private static instance: AnalyticsStorage;
  private events: AnalyticsEvent[] = [];
  private metrics: Map<string, LearningMetrics> = new Map();
  private reports: ParentReport[] = [];

  static getInstance(): AnalyticsStorage {
    if (!AnalyticsStorage.instance) {
      AnalyticsStorage.instance = new AnalyticsStorage();
    }
    return AnalyticsStorage.instance;
  }

  // Event tracking
  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);
    this.updateMetrics(event.studentId);
    this.saveToStorage();
  }

  getEvents(studentId: string, eventType?: AnalyticsEventType, limit?: number): AnalyticsEvent[] {
    let filtered = this.events.filter(e => e.studentId === studentId);
    
    if (eventType) {
      filtered = filtered.filter(e => e.eventType === eventType);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Metrics calculation
  private updateMetrics(studentId: string): void {
    const events = this.getEvents(studentId);
    const metrics = this.calculateMetrics(events);
    this.metrics.set(studentId, metrics);
  }

  private calculateMetrics(events: AnalyticsEvent[]): LearningMetrics {
    const worksheetEvents = events.filter(e => e.eventType === 'worksheet_exported');
    const problemEvents = events.filter(e => e.eventType === 'problem_completed');
    const timeEvents = events.filter(e => e.eventType === 'time_spent');

    const totalTimeSpent = timeEvents.reduce((sum, e) => sum + (e.data.duration as number || 0), 0);
    const totalProblems = problemEvents.length;
    const correctAnswers = problemEvents.filter(e => e.data.correct === true).length;
    
    const subjectCounts = events.reduce((acc, e) => {
      const subject = e.data.subject as string;
      if (subject) {
        acc[subject] = (acc[subject] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const difficultyCounts = events.reduce((acc, e) => {
      const difficulty = e.data.difficulty as string;
      if (difficulty) {
        acc[difficulty] = (acc[difficulty] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWorksheets: worksheetEvents.length,
      totalProblems,
      totalTimeSpent,
      averageAccuracy: totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0,
      averageTimePerProblem: totalProblems > 0 ? totalTimeSpent / totalProblems : 0,
      favoriteSubject: Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b, 'math'),
      favoriteDifficulty: Object.keys(difficultyCounts).reduce((a, b) => difficultyCounts[a] > difficultyCounts[b] ? a : b, 'medium'),
      improvementRate: this.calculateImprovementRate(events),
      consistencyScore: this.calculateConsistencyScore(events),
      engagementScore: this.calculateEngagementScore(events),
    };
  }

  private calculateImprovementRate(events: AnalyticsEvent[]): number {
    const recentEvents = events.slice(-20); // Last 20 events
    const olderEvents = events.slice(-40, -20); // Previous 20 events

    if (recentEvents.length < 10 || olderEvents.length < 10) return 0;

    const recentAccuracy = this.calculateAccuracy(recentEvents);
    const olderAccuracy = this.calculateAccuracy(olderEvents);

    return recentAccuracy - olderAccuracy;
  }

  private calculateConsistencyScore(events: AnalyticsEvent[]): number {
    const dailyActivity = this.groupEventsByDay(events);
    const activeDays = Object.keys(dailyActivity).length;
    const totalDays = 30; // Last 30 days

    return (activeDays / totalDays) * 100;
  }

  private calculateEngagementScore(events: AnalyticsEvent[]): number {
    const timeSpent = events
      .filter(e => e.eventType === 'time_spent')
      .reduce((sum, e) => sum + (e.data.duration as number || 0), 0);

    const worksheets = events.filter(e => e.eventType === 'worksheet_exported').length;
    
    // Score based on time spent and worksheet completion
    return Math.min(100, (timeSpent / 60) * 2 + worksheets * 5); // Max 100
  }

  private calculateAccuracy(events: AnalyticsEvent[]): number {
    const problemEvents = events.filter(e => e.eventType === 'problem_completed');
    if (problemEvents.length === 0) return 0;

    const correctAnswers = problemEvents.filter(e => e.data.correct === true).length;
    return (correctAnswers / problemEvents.length) * 100;
  }

  private groupEventsByDay(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, e) => {
      const date = e.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Subject analytics
  getSubjectAnalytics(studentId: string): SubjectAnalytics[] {
    const events = this.getEvents(studentId);
    const subjects = [...new Set(events.map(e => e.data.subject as string).filter(Boolean))];

    return subjects.map(subject => {
      const subjectEvents = events.filter(e => e.data.subject === subject);
      const problemEvents = subjectEvents.filter(e => e.eventType === 'problem_completed');
      const correctAnswers = problemEvents.filter(e => e.data.correct === true).length;
      const timeSpent = subjectEvents
        .filter(e => e.eventType === 'time_spent')
        .reduce((sum, e) => sum + (e.data.duration as number || 0), 0);

      const difficultyBreakdown = subjectEvents.reduce((acc, e) => {
        const difficulty = e.data.difficulty as string;
        if (difficulty) {
          acc[difficulty] = (acc[difficulty] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        subject,
        totalProblems: problemEvents.length,
        correctAnswers,
        averageTime: problemEvents.length > 0 ? timeSpent / problemEvents.length : 0,
        difficultyBreakdown,
        timeSpent,
        lastActivity: subjectEvents[0]?.timestamp || new Date(),
        improvementTrend: this.calculateSubjectTrend(subjectEvents),
      };
    });
  }

  private calculateSubjectTrend(events: AnalyticsEvent[]): 'improving' | 'stable' | 'declining' {
    const recent = events.slice(-10);
    const older = events.slice(-20, -10);

    if (recent.length < 5 || older.length < 5) return 'stable';

    const recentAccuracy = this.calculateAccuracy(recent);
    const olderAccuracy = this.calculateAccuracy(older);

    if (recentAccuracy > olderAccuracy + 5) return 'improving';
    if (recentAccuracy < olderAccuracy - 5) return 'declining';
    return 'stable';
  }

  // Time analytics
  getTimeAnalytics(studentId: string): TimeAnalytics {
    const events = this.getEvents(studentId);
    const timeEvents = events.filter(e => e.eventType === 'time_spent');

    const dailyActivity = this.groupEventsByDay(timeEvents);
    const weeklyActivity = this.groupEventsByWeek(timeEvents);
    const monthlyActivity = this.groupEventsByMonth(timeEvents);

    const peakHours = this.calculatePeakHours(timeEvents);
    const streaks = this.calculateStreaks(dailyActivity);

    return {
      dailyActivity,
      weeklyActivity,
      monthlyActivity,
      peakHours,
      averageSessionLength: this.calculateAverageSessionLength(timeEvents),
      longestStreak: streaks.longest,
      currentStreak: streaks.current,
    };
  }

  private groupEventsByWeek(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, e) => {
      const week = this.getWeekKey(e.timestamp);
      acc[week] = (acc[week] || 0) + (e.data.duration as number || 0);
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEventsByMonth(events: AnalyticsEvent[]): Record<string, number> {
    return events.reduce((acc, e) => {
      const month = e.timestamp.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + (e.data.duration as number || 0);
      return acc;
    }, {} as Record<string, number>);
  }

  private calculatePeakHours(events: AnalyticsEvent[]): number[] {
    const hourCounts = events.reduce((acc, e) => {
      const hour = e.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.keys(hourCounts)
      .map(Number)
      .sort((a, b) => hourCounts[b] - hourCounts[a])
      .slice(0, 3);
  }

  private calculateStreaks(dailyActivity: Record<string, number>): { longest: number; current: number } {
    const dates = Object.keys(dailyActivity).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;

      tempStreak++;

      if (!nextDate || nextDate.getTime() - currentDate.getTime() > 24 * 60 * 60 * 1000) {
        longestStreak = Math.max(longestStreak, tempStreak);
        if (i === dates.length - 1) {
          currentStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    return { longest: longestStreak, current: currentStreak };
  }

  private calculateAverageSessionLength(timeEvents: AnalyticsEvent[]): number {
    if (timeEvents.length === 0) return 0;
    const totalTime = timeEvents.reduce((sum, e) => sum + (e.data.duration as number || 0), 0);
    return totalTime / timeEvents.length;
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Report generation
  generateParentReport(studentId: string, period: 'daily' | 'weekly' | 'monthly'): ParentReport {
    const metrics = this.metrics.get(studentId) || this.calculateMetrics(this.getEvents(studentId));
    const subjectAnalytics = this.getSubjectAnalytics(studentId);
    const timeAnalytics = this.getTimeAnalytics(studentId);
    const difficultyProgress = this.getDifficultyProgress(studentId);

    const report: ParentReport = {
      studentId,
      reportPeriod: period,
      generatedAt: new Date(),
      summary: {
        totalTimeSpent: metrics.totalTimeSpent,
        worksheetsCompleted: metrics.totalWorksheets,
        problemsSolved: metrics.totalProblems,
        averageAccuracy: metrics.averageAccuracy,
        improvementAreas: this.identifyImprovementAreas(subjectAnalytics),
        strengths: this.identifyStrengths(subjectAnalytics),
        recommendations: this.generateRecommendations(metrics, subjectAnalytics),
      },
      subjectBreakdown: subjectAnalytics,
      timeBreakdown: timeAnalytics,
      difficultyProgress,
      insights: this.generateInsights(metrics, subjectAnalytics, timeAnalytics),
      goals: this.generateGoals(metrics),
    };

    this.reports.push(report);
    this.saveToStorage();
    return report;
  }

  private getDifficultyProgress(studentId: string): DifficultyAnalytics[] {
    const events = this.getEvents(studentId);
    const difficulties = [...new Set(events.map(e => e.data.difficulty as string).filter(Boolean))];

    return difficulties.map(difficulty => {
      const difficultyEvents = events.filter(e => e.data.difficulty === difficulty);
      const problemEvents = difficultyEvents.filter(e => e.eventType === 'problem_completed');
      const correctAnswers = problemEvents.filter(e => e.data.correct === true).length;
      const accuracy = problemEvents.length > 0 ? (correctAnswers / problemEvents.length) * 100 : 0;

      return {
        difficulty,
        totalProblems: problemEvents.length,
        correctAnswers,
        averageTime: this.calculateAverageTime(difficultyEvents),
        masteryLevel: this.determineMasteryLevel(accuracy),
        recommendedNext: this.getRecommendedNextDifficulty(difficulty, accuracy),
        practiceNeeded: accuracy < 70,
      };
    });
  }

  private calculateAverageTime(events: AnalyticsEvent[]): number {
    const timeEvents = events.filter(e => e.eventType === 'time_spent');
    if (timeEvents.length === 0) return 0;
    const totalTime = timeEvents.reduce((sum, e) => sum + (e.data.duration as number || 0), 0);
    return totalTime / timeEvents.length;
  }

  private determineMasteryLevel(accuracy: number): 'beginner' | 'developing' | 'proficient' | 'advanced' {
    if (accuracy >= 90) return 'advanced';
    if (accuracy >= 80) return 'proficient';
    if (accuracy >= 60) return 'developing';
    return 'beginner';
  }

  private getRecommendedNextDifficulty(current: string, accuracy: number): string {
    const difficultyOrder = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    const currentIndex = difficultyOrder.indexOf(current);

    if (accuracy >= 85 && currentIndex < difficultyOrder.length - 1) {
      return difficultyOrder[currentIndex + 1];
    }
    if (accuracy < 60 && currentIndex > 0) {
      return difficultyOrder[currentIndex - 1];
    }
    return current;
  }

  private identifyImprovementAreas(subjectAnalytics: SubjectAnalytics[]): string[] {
    return subjectAnalytics
      .filter(s => s.improvementTrend === 'declining' || s.correctAnswers / s.totalProblems < 0.7)
      .map(s => s.subject);
  }

  private identifyStrengths(subjectAnalytics: SubjectAnalytics[]): string[] {
    return subjectAnalytics
      .filter(s => s.improvementTrend === 'improving' && s.correctAnswers / s.totalProblems >= 0.8)
      .map(s => s.subject);
  }

  private generateRecommendations(metrics: LearningMetrics, subjectAnalytics: SubjectAnalytics[]): string[] {
    const recommendations: string[] = [];

    if (metrics.averageAccuracy < 70) {
      recommendations.push('Focus on accuracy over speed - practice easier problems first');
    }

    if (metrics.totalTimeSpent < 30) {
      recommendations.push('Increase practice time to at least 30 minutes per week');
    }

    const weakSubjects = subjectAnalytics.filter(s => s.correctAnswers / s.totalProblems < 0.7);
    if (weakSubjects.length > 0) {
      recommendations.push(`Focus on ${weakSubjects.map(s => s.subject).join(', ')} - consider reviewing fundamentals`);
    }

    if (metrics.consistencyScore < 50) {
      recommendations.push('Establish a regular practice schedule for better consistency');
    }

    return recommendations;
  }

  private generateInsights(metrics: LearningMetrics, subjectAnalytics: SubjectAnalytics[], timeAnalytics: TimeAnalytics): string[] {
    const insights: string[] = [];

    if (metrics.improvementRate > 5) {
      insights.push(`Great progress! Accuracy improved by ${metrics.improvementRate.toFixed(1)}% recently`);
    }

    if (timeAnalytics.currentStreak > 7) {
      insights.push(`Excellent consistency! ${timeAnalytics.currentStreak} days in a row`);
    }

    const favoriteSubject = subjectAnalytics.find(s => s.subject === metrics.favoriteSubject);
    if (favoriteSubject) {
      insights.push(`${metrics.favoriteSubject} is your strongest subject with ${favoriteSubject.correctAnswers}/${favoriteSubject.totalProblems} correct`);
    }

    if (metrics.engagementScore > 80) {
      insights.push('High engagement level - keep up the great work!');
    }

    return insights;
  }

  private generateGoals(metrics: LearningMetrics): {
    current: string[];
    achieved: string[];
    next: string[];
  } {
    const current: string[] = [];
    const achieved: string[] = [];
    const next: string[] = [];

    // Current goals
    if (metrics.averageAccuracy < 80) {
      current.push('Achieve 80% accuracy across all subjects');
    }
    if (metrics.totalTimeSpent < 60) {
      current.push('Practice for at least 1 hour per week');
    }

    // Achieved goals
    if (metrics.totalWorksheets >= 10) {
      achieved.push('Complete 10 worksheets');
    }
    if (metrics.consistencyScore >= 70) {
      achieved.push('Maintain consistent practice schedule');
    }

    // Next goals
    if (metrics.averageAccuracy >= 80) {
      next.push('Achieve 90% accuracy');
    }
    if (metrics.totalTimeSpent >= 60) {
      next.push('Practice for 2 hours per week');
    }

    return { current, achieved, next };
  }

  // Export functionality
  exportData(studentId: string, exportConfig: ExportData): string {
    const events = this.getEvents(studentId);
    const metrics = this.metrics.get(studentId);
    const reports = this.reports.filter(r => r.studentId === studentId);

    const exportData = {
      studentId,
      exportConfig,
      exportedAt: new Date(),
      data: {
        events: exportConfig.exportType === 'worksheets_only' ? 
          events.filter(e => e.eventType === 'worksheet_exported') : events,
        metrics,
        reports: exportConfig.exportType === 'progress_only' ? reports : undefined,
      },
    };

    if (exportConfig.format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  private convertToCSV(data: { data: { events: AnalyticsEvent[] } }): string {
    // Simple CSV conversion for events
    const events = data.data.events || [];
    if (events.length === 0) return '';

    const headers = ['timestamp', 'eventType', 'subject', 'difficulty', 'correct', 'duration'];
    const csvRows = [headers.join(',')];

    events.forEach((event: AnalyticsEvent) => {
      const row = headers.map(header => {
        const value = event.data[header] || event[header as keyof AnalyticsEvent] || '';
        return `"${value}"`;
      });
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('astra-academy-analytics', JSON.stringify({
        events: this.events,
        metrics: Array.from(this.metrics.entries()),
        reports: this.reports,
      }));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = localStorage.getItem('astra-academy-analytics');
      if (data) {
        const parsed = JSON.parse(data);
        this.events = parsed.events || [];
        this.metrics = new Map(parsed.metrics || []);
        this.reports = parsed.reports || [];
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }

  // Public API
  getMetrics(studentId: string): LearningMetrics | undefined {
    return this.metrics.get(studentId);
  }

  getReports(studentId: string): ParentReport[] {
    return this.reports.filter(r => r.studentId === studentId);
  }

  clearData(studentId?: string): void {
    if (studentId) {
      this.events = this.events.filter(e => e.studentId !== studentId);
      this.metrics.delete(studentId);
      this.reports = this.reports.filter(r => r.studentId !== studentId);
    } else {
      this.events = [];
      this.metrics.clear();
      this.reports = [];
    }
    this.saveToStorage();
  }
}

// Export singleton instance
export const analyticsStorage = AnalyticsStorage.getInstance();

// Initialize storage on load
if (typeof window !== 'undefined') {
  analyticsStorage.loadFromStorage();
}
