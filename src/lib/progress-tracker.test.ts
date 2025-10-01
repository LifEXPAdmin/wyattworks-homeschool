import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ProgressTracker,
  type StudentProgress,
  type WorksheetSession,
  type SpacedRepetitionItem,
} from "./progress-tracker";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ProgressTracker", () => {
  let tracker: ProgressTracker;

  beforeEach(() => {
    tracker = new ProgressTracker();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.getItem.mockClear();
  });

  describe("Student Progress Management", () => {
    it("should create new student progress when none exists", () => {
      const studentId = "student-123";
      const progress = tracker.getStudentProgress(studentId);

      expect(progress.studentId).toBe(studentId);
      expect(progress.totalWorksheets).toBe(0);
      expect(progress.totalProblems).toBe(0);
      expect(progress.correctAnswers).toBe(0);
      expect(progress.incorrectAnswers).toBe(0);
      expect(progress.averageAccuracy).toBe(0);
      expect(progress.averageTimePerProblem).toBe(0);
    });

    it("should return existing student progress", () => {
      const studentId = "student-123";
      const existingProgress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 5,
        totalProblems: 100,
        correctAnswers: 85,
        incorrectAnswers: 15,
        averageAccuracy: 0.85,
        averageTimePerProblem: 30,
        lastActivity: new Date("2024-01-01"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingProgress]));

      const progress = tracker.getStudentProgress(studentId);
      expect(progress).toEqual(existingProgress);
    });

    it("should update progress when recording a session", () => {
      const studentId = "student-123";
      const session: WorksheetSession = {
        id: "session-1",
        studentId,
        worksheetId: "worksheet-1",
        subject: "math",
        gradeLevel: "3-4",
        difficulty: "medium",
        problemCount: 20,
        correctCount: 18,
        incorrectCount: 2,
        timeSpent: 600, // 10 minutes
        completedAt: new Date(),
        problems: [],
      };

      // Mock initial progress
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      tracker.recordSession(session);
      const progress = tracker.getStudentProgress(studentId);

      expect(progress.totalWorksheets).toBe(1);
      expect(progress.totalProblems).toBe(20);
      expect(progress.correctAnswers).toBe(18);
      expect(progress.incorrectAnswers).toBe(2);
      expect(progress.averageAccuracy).toBe(0.9);
      expect(progress.averageTimePerProblem).toBe(30);
    });
  });

  describe("Learning Insights Generation", () => {
    it("should generate strength insights for high accuracy", () => {
      const studentId = "student-123";
      const progress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 10,
        totalProblems: 200,
        correctAnswers: 190,
        incorrectAnswers: 10,
        averageAccuracy: 0.95,
        averageTimePerProblem: 25,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([progress]));

      const insights = tracker.generateInsights(studentId);
      const strengthInsight = insights.find(i => i.type === "strength");

      expect(strengthInsight).toBeDefined();
      expect(strengthInsight?.message).toContain("Excellent accuracy");
      expect(strengthInsight?.confidence).toBeGreaterThan(0.8);
    });

    it("should generate weakness insights for low accuracy", () => {
      const studentId = "student-123";
      const progress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 10,
        totalProblems: 200,
        correctAnswers: 100,
        incorrectAnswers: 100,
        averageAccuracy: 0.5,
        averageTimePerProblem: 45,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([progress]));

      const insights = tracker.generateInsights(studentId);
      const weaknessInsight = insights.find(i => i.type === "weakness");

      expect(weaknessInsight).toBeDefined();
      expect(weaknessInsight?.message).toContain("Accuracy needs improvement");
      expect(weaknessInsight?.actionable).toBe(true);
      expect(weaknessInsight?.priority).toBe("high");
    });

    it("should generate speed insights for slow completion", () => {
      const studentId = "student-123";
      const progress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 10,
        totalProblems: 200,
        correctAnswers: 180,
        incorrectAnswers: 20,
        averageAccuracy: 0.9,
        averageTimePerProblem: 90, // Very slow
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([progress]));

      const insights = tracker.generateInsights(studentId);
      const speedInsight = insights.find(i => i.category === "speed");

      expect(speedInsight).toBeDefined();
      expect(speedInsight?.message).toContain("Taking longer than average");
      expect(speedInsight?.actionable).toBe(true);
    });
  });

  describe("Difficulty Recommendations", () => {
    it("should recommend increasing difficulty for high performance", () => {
      const studentId = "student-123";
      const sessions: WorksheetSession[] = [
        {
          id: "session-1",
          studentId,
          worksheetId: "worksheet-1",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 19,
          incorrectCount: 1,
          timeSpent: 400, // Fast completion
          completedAt: new Date(),
          problems: [],
        },
        {
          id: "session-2",
          studentId,
          worksheetId: "worksheet-2",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 20,
          incorrectCount: 0,
          timeSpent: 350,
          completedAt: new Date(),
          problems: [],
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes("sessions")) {
          return JSON.stringify(sessions);
        }
        return JSON.stringify([]);
      });

      const recommendation = tracker.generateDifficultyRecommendation(studentId, "math", "medium");

      expect(recommendation.recommendedDifficulty).toBe("hard");
      expect(recommendation.reason).toContain("High accuracy");
      expect(recommendation.confidence).toBeGreaterThan(0.7);
      expect(recommendation.basedOn).toContain("high_accuracy");
    });

    it("should recommend decreasing difficulty for low performance", () => {
      const studentId = "student-123";
      const sessions: WorksheetSession[] = [
        {
          id: "session-1",
          studentId,
          worksheetId: "worksheet-1",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 8,
          incorrectCount: 12,
          timeSpent: 1200, // Slow completion
          completedAt: new Date(),
          problems: [],
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes("sessions")) {
          return JSON.stringify(sessions);
        }
        return JSON.stringify([]);
      });

      const recommendation = tracker.generateDifficultyRecommendation(studentId, "math", "medium");

      expect(recommendation.recommendedDifficulty).toBe("easy");
      expect(recommendation.reason).toContain("Accuracy");
      expect(recommendation.confidence).toBeGreaterThan(0.7);
    });

    it("should maintain difficulty for stable performance", () => {
      const studentId = "student-123";
      const sessions: WorksheetSession[] = [
        {
          id: "session-1",
          studentId,
          worksheetId: "worksheet-1",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 15,
          incorrectCount: 5,
          timeSpent: 600,
          completedAt: new Date(),
          problems: [],
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes("sessions")) {
          return JSON.stringify(sessions);
        }
        return JSON.stringify([]);
      });

      const recommendation = tracker.generateDifficultyRecommendation(studentId, "math", "medium");

      expect(recommendation.recommendedDifficulty).toBe("medium");
      expect(recommendation.reason).toContain("Good performance");
    });

    it("should return insufficient data message for new students", () => {
      const studentId = "new-student";
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const recommendation = tracker.generateDifficultyRecommendation(studentId, "math", "medium");

      expect(recommendation.recommendedDifficulty).toBe("medium");
      expect(recommendation.reason).toContain("Not enough data");
      expect(recommendation.confidence).toBeLessThan(0.2);
    });
  });

  describe("Spaced Repetition System", () => {
    it("should create spaced repetition item", () => {
      const studentId = "student-123";
      const item = tracker.createSpacedRepetitionItem(studentId, "addition", "math", "easy");

      expect(item.studentId).toBe(studentId);
      expect(item.problemType).toBe("addition");
      expect(item.subject).toBe("math");
      expect(item.difficulty).toBe("easy");
      expect(item.repetitions).toBe(0);
      expect(item.easeFactor).toBe(2.5);
      expect(item.interval).toBe(1);
    });

    it("should update spaced repetition item for successful review", () => {
      const studentId = "student-123";
      const item = tracker.createSpacedRepetitionItem(studentId, "addition", "math", "easy");

      const updatedItem = tracker.updateSpacedRepetitionItem(item.id, 4); // Good quality

      expect(updatedItem).toBeDefined();
      expect(updatedItem!.repetitions).toBe(1);
      expect(updatedItem!.quality).toBe(4);
      expect(updatedItem!.interval).toBe(1);
    });

    it("should reset interval for failed review", () => {
      const studentId = "student-123";
      const item = tracker.createSpacedRepetitionItem(studentId, "addition", "math", "easy");

      const updatedItem = tracker.updateSpacedRepetitionItem(item.id, 2); // Poor quality

      expect(updatedItem).toBeDefined();
      expect(updatedItem!.repetitions).toBe(1);
      expect(updatedItem!.quality).toBe(2);
      expect(updatedItem!.interval).toBe(1);
    });

    it("should get items due for review", () => {
      const studentId = "student-123";
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      
      const item: SpacedRepetitionItem = {
        id: "item-1",
        studentId,
        problemType: "addition",
        subject: "math",
        difficulty: "easy",
        lastReviewed: pastDate,
        nextReview: pastDate,
        interval: 1,
        repetitions: 1,
        easeFactor: 2.5,
        quality: 4,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([item]));

      const dueItems = tracker.getItemsDueForReview(studentId);

      expect(dueItems).toHaveLength(1);
      expect(dueItems[0].id).toBe("item-1");
    });
  });

  describe("Session Management", () => {
    it("should get student sessions", () => {
      const studentId = "student-123";
      const sessions: WorksheetSession[] = [
        {
          id: "session-1",
          studentId,
          worksheetId: "worksheet-1",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 18,
          incorrectCount: 2,
          timeSpent: 600,
          completedAt: new Date(),
          problems: [],
        },
        {
          id: "session-2",
          studentId: "other-student",
          worksheetId: "worksheet-2",
          subject: "math",
          gradeLevel: "3-4",
          difficulty: "medium",
          problemCount: 20,
          correctCount: 15,
          incorrectCount: 5,
          timeSpent: 700,
          completedAt: new Date(),
          problems: [],
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      const studentSessions = tracker.getStudentSessions(studentId);

      expect(studentSessions).toHaveLength(1);
      expect(studentSessions[0].id).toBe("session-1");
    });
  });

  describe("Progress Calculations", () => {
    it("should calculate accuracy correctly", () => {
      const studentId = "student-123";
      const progress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 2,
        totalProblems: 40,
        correctAnswers: 32,
        incorrectAnswers: 8,
        averageAccuracy: 0.8,
        averageTimePerProblem: 30,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([progress]));

      const retrievedProgress = tracker.getStudentProgress(studentId);
      expect(retrievedProgress.averageAccuracy).toBe(0.8);
    });

    it("should update average time per problem correctly", () => {
      const studentId = "student-123";
      const initialProgress: StudentProgress = {
        studentId,
        studentName: "Test Student",
        subject: "math",
        gradeLevel: "3-4",
        totalWorksheets: 1,
        totalProblems: 20,
        correctAnswers: 18,
        incorrectAnswers: 2,
        averageAccuracy: 0.9,
        averageTimePerProblem: 30,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newSession: WorksheetSession = {
        id: "session-2",
        studentId,
        worksheetId: "worksheet-2",
        subject: "math",
        gradeLevel: "3-4",
        difficulty: "medium",
        problemCount: 20,
        correctCount: 16,
        incorrectCount: 4,
        timeSpent: 800, // 40 seconds per problem
        completedAt: new Date(),
        problems: [],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([initialProgress]));

      tracker.recordSession(newSession);
      const updatedProgress = tracker.getStudentProgress(studentId);

      expect(updatedProgress.averageTimePerProblem).toBe(35); // (30*20 + 40*20) / 40
    });
  });
});
