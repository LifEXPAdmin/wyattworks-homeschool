import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  analyticsStorage, 
  AnalyticsEvent, 
  LearningMetrics, 
  ParentReport,
  ExportData 
} from './analytics';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Analytics System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset analytics storage
    analyticsStorage.clearData();
  });

  describe('Event Tracking', () => {
    it('should track events correctly', () => {
      const eventData = {
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created' as const,
        data: { subject: 'math', difficulty: 'medium' },
      };

      analyticsStorage.trackEvent(eventData);

      const events = analyticsStorage.getEvents('student-1');
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('worksheet_created');
      expect(events[0].data.subject).toBe('math');
      expect(events[0].studentId).toBe('student-1');
    });

    it('should filter events by type', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { correct: true },
      });

      const worksheetEvents = analyticsStorage.getEvents('student-1', 'worksheet_created');
      expect(worksheetEvents).toHaveLength(1);
      expect(worksheetEvents[0].eventType).toBe('worksheet_created');
    });

    it('should limit events when requested', () => {
      // Add multiple events
      for (let i = 0; i < 5; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'worksheet_created',
          data: { subject: 'math' },
        });
      }

      const limitedEvents = analyticsStorage.getEvents('student-1', undefined, 3);
      expect(limitedEvents).toHaveLength(3);
    });

    it('should sort events by timestamp descending', () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      // Mock timestamps
      vi.spyOn(Date, 'now').mockReturnValueOnce(earlier.getTime());
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      vi.spyOn(Date, 'now').mockReturnValueOnce(now.getTime());
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { correct: true },
      });

      const events = analyticsStorage.getEvents('student-1');
      expect(events[0].eventType).toBe('problem_completed');
      expect(events[1].eventType).toBe('worksheet_created');
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate basic learning metrics', () => {
      // Add worksheet events
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_exported',
        data: { subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_exported',
        data: { subject: 'science' },
      });

      // Add problem events
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { correct: true, subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { correct: false, subject: 'math' },
      });

      // Add time events
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'time_spent',
        data: { duration: 30 },
      });

      const metrics = analyticsStorage.getMetrics('student-1');
      expect(metrics).toBeDefined();
      expect(metrics!.totalWorksheets).toBe(2);
      expect(metrics!.totalProblems).toBe(2);
      expect(metrics!.totalTimeSpent).toBe(30);
      expect(metrics!.averageAccuracy).toBe(50); // 1 out of 2 correct
      expect(metrics!.averageTimePerProblem).toBe(15); // 30 minutes / 2 problems
    });

    it('should identify favorite subject and difficulty', () => {
      // Add more math events than science
      for (let i = 0; i < 3; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'worksheet_created',
          data: { subject: 'math', difficulty: 'medium' },
        });
      }

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'science', difficulty: 'easy' },
      });

      const metrics = analyticsStorage.getMetrics('student-1');
      expect(metrics!.favoriteSubject).toBe('math');
      expect(metrics!.favoriteDifficulty).toBe('medium');
    });

    it('should calculate improvement rate', () => {
      // Add older events with lower accuracy
      for (let i = 0; i < 10; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'problem_completed',
          data: { correct: i < 5 }, // 50% accuracy
        });
      }

      // Add recent events with higher accuracy
      for (let i = 0; i < 10; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'problem_completed',
          data: { correct: i < 8 }, // 80% accuracy
        });
      }

      const metrics = analyticsStorage.getMetrics('student-1');
      expect(metrics!.improvementRate).toBeGreaterThan(0);
    });
  });

  describe('Subject Analytics', () => {
    it('should generate subject analytics', () => {
      // Add math events
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'math', correct: true },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'math', correct: false },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'time_spent',
        data: { subject: 'math', duration: 20 },
      });

      // Add science events
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'science', correct: true },
      });

      const subjectAnalytics = analyticsStorage.getSubjectAnalytics('student-1');
      expect(subjectAnalytics).toHaveLength(2);

      const mathAnalytics = subjectAnalytics.find(s => s.subject === 'math');
      expect(mathAnalytics).toBeDefined();
      expect(mathAnalytics!.totalProblems).toBe(2);
      expect(mathAnalytics!.correctAnswers).toBe(1);
      expect(mathAnalytics!.timeSpent).toBe(20);
    });

    it('should calculate improvement trends', () => {
      // Add declining trend for math
      for (let i = 0; i < 10; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'problem_completed',
          data: { subject: 'math', correct: i < 8 }, // 80% accuracy
        });
      }

      for (let i = 0; i < 10; i++) {
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'problem_completed',
          data: { subject: 'math', correct: i < 5 }, // 50% accuracy (declining)
        });
      }

      const subjectAnalytics = analyticsStorage.getSubjectAnalytics('student-1');
      const mathAnalytics = subjectAnalytics.find(s => s.subject === 'math');
      expect(mathAnalytics!.improvementTrend).toBe('declining');
    });
  });

  describe('Time Analytics', () => {
    it('should calculate time analytics', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Mock different timestamps
      vi.spyOn(Date, 'now').mockReturnValueOnce(yesterday.getTime());
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'time_spent',
        data: { duration: 30 },
      });

      vi.spyOn(Date, 'now').mockReturnValueOnce(now.getTime());
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'time_spent',
        data: { duration: 45 },
      });

      const timeAnalytics = analyticsStorage.getTimeAnalytics('student-1');
      expect(timeAnalytics.dailyActivity).toBeDefined();
      expect(timeAnalytics.averageSessionLength).toBe(37.5); // (30 + 45) / 2
    });

    it('should calculate streaks correctly', () => {
      const baseDate = new Date('2024-01-01');
      
      // Create consecutive days
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
        vi.spyOn(Date, 'now').mockReturnValueOnce(date.getTime());
        
        analyticsStorage.trackEvent({
          userId: 'user-1',
          studentId: 'student-1',
          eventType: 'time_spent',
          data: { duration: 30 },
        });
      }

      const timeAnalytics = analyticsStorage.getTimeAnalytics('student-1');
      expect(timeAnalytics.currentStreak).toBe(5);
      expect(timeAnalytics.longestStreak).toBe(5);
    });
  });

  describe('Parent Reports', () => {
    it('should generate comprehensive parent reports', () => {
      // Add sample data
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_exported',
        data: { subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'math', correct: true },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'time_spent',
        data: { duration: 30 },
      });

      const report = analyticsStorage.generateParentReport('student-1', 'weekly');
      
      expect(report.studentId).toBe('student-1');
      expect(report.reportPeriod).toBe('weekly');
      expect(report.summary.totalWorksheets).toBe(1);
      expect(report.summary.problemsSolved).toBe(1);
      expect(report.summary.totalTimeSpent).toBe(30);
      expect(report.subjectBreakdown).toHaveLength(1);
      expect(report.insights).toBeDefined();
      expect(report.goals).toBeDefined();
    });

    it('should identify improvement areas and strengths', () => {
      // Add weak subject (science)
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'science', correct: false },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'science', correct: false },
      });

      // Add strong subject (math)
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'math', correct: true },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { subject: 'math', correct: true },
      });

      const report = analyticsStorage.generateParentReport('student-1', 'weekly');
      
      expect(report.summary.improvementAreas).toContain('science');
      expect(report.summary.strengths).toContain('math');
    });
  });

  describe('Data Export', () => {
    it('should export data in JSON format', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      const exportConfig: ExportData = {
        studentId: 'student-1',
        exportType: 'full_data',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'json',
        includeCharts: true,
        includeRecommendations: true,
      };

      const exportedData = analyticsStorage.exportData('student-1', exportConfig);
      const parsed = JSON.parse(exportedData);
      
      expect(parsed.studentId).toBe('student-1');
      expect(parsed.data.events).toHaveLength(1);
      expect(parsed.data.metrics).toBeDefined();
    });

    it('should export data in CSV format', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math', difficulty: 'medium' },
      });

      const exportConfig: ExportData = {
        studentId: 'student-1',
        exportType: 'full_data',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'csv',
        includeCharts: false,
        includeRecommendations: false,
      };

      const exportedData = analyticsStorage.exportData('student-1', exportConfig);
      expect(exportedData).toContain('timestamp,eventType,subject,difficulty');
      expect(exportedData).toContain('worksheet_created');
    });

    it('should filter export data by type', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'problem_completed',
        data: { correct: true },
      });

      const exportConfig: ExportData = {
        studentId: 'student-1',
        exportType: 'worksheets_only',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        format: 'json',
        includeCharts: false,
        includeRecommendations: false,
      };

      const exportedData = analyticsStorage.exportData('student-1', exportConfig);
      const parsed = JSON.parse(exportedData);
      
      expect(parsed.data.events).toHaveLength(1);
      expect(parsed.data.events[0].eventType).toBe('worksheet_created');
    });
  });

  describe('Data Management', () => {
    it('should clear data for specific student', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-2',
        eventType: 'worksheet_created',
        data: { subject: 'science' },
      });

      analyticsStorage.clearData('student-1');

      expect(analyticsStorage.getEvents('student-1')).toHaveLength(0);
      expect(analyticsStorage.getEvents('student-2')).toHaveLength(1);
    });

    it('should clear all data when no student specified', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      analyticsStorage.clearData();

      expect(analyticsStorage.getEvents('student-1')).toHaveLength(0);
    });

    it('should save and load data from localStorage', () => {
      analyticsStorage.trackEvent({
        userId: 'user-1',
        studentId: 'student-1',
        eventType: 'worksheet_created',
        data: { subject: 'math' },
      });

      // Simulate saving
      analyticsStorage['saveToStorage']();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'astra-academy-analytics',
        expect.stringContaining('worksheet_created')
      );
    });
  });
});
