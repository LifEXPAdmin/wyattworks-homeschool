// Progress tracking and analytics system for Astra Academy
// Tracks student performance, learning patterns, and provides insights

export interface StudentProgress {
  studentId: string;
  studentName: string;
  subject: string;
  gradeLevel: string;
  totalWorksheets: number;
  totalProblems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageAccuracy: number;
  averageTimePerProblem: number; // in seconds
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorksheetSession {
  id: string;
  studentId: string;
  worksheetId: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  problemCount: number;
  correctCount: number;
  incorrectCount: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  problems: ProblemAttempt[];
}

export interface ProblemAttempt {
  problemId: string;
  problemText: string;
  correctAnswer: string | number;
  studentAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  attempts: number; // how many tries before getting it right
  hintsUsed: number;
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'improvement' | 'recommendation';
  category: string; // e.g., 'addition', 'spelling', 'biology'
  message: string;
  confidence: number; // 0-1, how confident we are in this insight
  actionable: boolean; // whether this insight suggests an action
  priority: 'low' | 'medium' | 'high';
}

export interface DifficultyRecommendation {
  currentDifficulty: string;
  recommendedDifficulty: string;
  reason: string;
  confidence: number;
  basedOn: string[]; // what data this recommendation is based on
}

export interface SpacedRepetitionItem {
  id: string;
  studentId: string;
  problemType: string;
  subject: string;
  difficulty: string;
  lastReviewed: Date;
  nextReview: Date;
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number; // how easy this item is for the student
  quality: number; // 0-5, how well they performed last time
}

// Progress tracking utilities
export class ProgressTracker {
  private storageKey = 'astra-academy-progress';

  // Record a worksheet session
  recordSession(session: WorksheetSession): void {
    const progress = this.getStudentProgress(session.studentId);
    
    // Update overall progress
    progress.totalWorksheets += 1;
    progress.totalProblems += session.problemCount;
    progress.correctAnswers += session.correctCount;
    progress.incorrectAnswers += session.incorrectCount;
    progress.averageAccuracy = progress.correctAnswers / progress.totalProblems;
    progress.averageTimePerProblem = this.calculateAverageTime(progress, session);
    progress.lastActivity = new Date();
    progress.updatedAt = new Date();

    // Save updated progress
    this.saveStudentProgress(progress);
    
    // Save session details
    this.saveSession(session);
  }

  // Get student progress
  getStudentProgress(studentId: string): StudentProgress {
    const allProgress = this.getAllProgress();
    const existing = allProgress.find(p => p.studentId === studentId);
    
    if (existing) {
      return existing;
    }

    // Create new progress record
    const newProgress: StudentProgress = {
      studentId,
      studentName: `Student ${studentId.slice(-4)}`, // Default name
      subject: 'general',
      gradeLevel: 'K',
      totalWorksheets: 0,
      totalProblems: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageAccuracy: 0,
      averageTimePerProblem: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveStudentProgress(newProgress);
    return newProgress;
  }

  // Get all sessions for a student
  getStudentSessions(studentId: string): WorksheetSession[] {
    const sessions = this.getAllSessions();
    return sessions.filter(s => s.studentId === studentId);
  }

  // Generate learning insights
  generateInsights(studentId: string): LearningInsight[] {
    const progress = this.getStudentProgress(studentId);
    const sessions = this.getStudentSessions(studentId);
    const insights: LearningInsight[] = [];

    // Accuracy insights
    if (progress.averageAccuracy > 0.9) {
      insights.push({
        type: 'strength',
        category: 'overall',
        message: `Excellent accuracy! ${Math.round(progress.averageAccuracy * 100)}% correct answers.`,
        confidence: 0.9,
        actionable: false,
        priority: 'medium',
      });
    } else if (progress.averageAccuracy < 0.6) {
      insights.push({
        type: 'weakness',
        category: 'overall',
        message: `Accuracy needs improvement. Currently ${Math.round(progress.averageAccuracy * 100)}%. Consider easier problems.`,
        confidence: 0.8,
        actionable: true,
        priority: 'high',
      });
    }

    // Speed insights
    if (progress.averageTimePerProblem > 60) {
      insights.push({
        type: 'weakness',
        category: 'speed',
        message: `Taking longer than average (${Math.round(progress.averageTimePerProblem)}s per problem). Practice with easier problems first.`,
        confidence: 0.7,
        actionable: true,
        priority: 'medium',
      });
    }

    // Consistency insights
    const recentSessions = sessions.slice(-5); // Last 5 sessions
    if (recentSessions.length >= 3) {
      const accuracyVariance = this.calculateAccuracyVariance(recentSessions);
      if (accuracyVariance > 0.3) {
        insights.push({
          type: 'improvement',
          category: 'consistency',
          message: 'Performance varies significantly between sessions. Try to maintain consistent practice schedule.',
          confidence: 0.8,
          actionable: true,
          priority: 'medium',
        });
      }
    }

    // Subject-specific insights
    const subjectSessions = this.groupSessionsBySubject(sessions);
    Object.entries(subjectSessions).forEach(([subject, subjectSessions]) => {
      const subjectAccuracy = this.calculateSubjectAccuracy(subjectSessions);
      if (subjectAccuracy < 0.7) {
        insights.push({
          type: 'weakness',
          category: subject,
          message: `${subject} accuracy is ${Math.round(subjectAccuracy * 100)}%. Consider reviewing fundamentals.`,
          confidence: 0.8,
          actionable: true,
          priority: 'high',
        });
      }
    });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Generate difficulty recommendations
  generateDifficultyRecommendation(studentId: string, subject: string, currentDifficulty: string): DifficultyRecommendation {
    const sessions = this.getStudentSessions(studentId);
    const recentSessions = sessions.filter(s => s.subject === subject).slice(-10);

    if (recentSessions.length < 3) {
      return {
        currentDifficulty,
        recommendedDifficulty: currentDifficulty,
        reason: 'Not enough data to make a recommendation. Complete more worksheets first.',
        confidence: 0.1,
        basedOn: ['insufficient_data'],
      };
    }

    const recentAccuracy = this.calculateRecentAccuracy(recentSessions);
    const averageTime = this.calculateAverageTimePerProblem(recentSessions);

    // Difficulty adjustment logic
    let recommendedDifficulty = currentDifficulty;
    let reason = '';
    let confidence = 0.5;
    const basedOn: string[] = [];

    if (recentAccuracy > 0.9 && averageTime < 30) {
      // High accuracy + fast = increase difficulty
      recommendedDifficulty = this.increaseDifficulty(currentDifficulty);
      reason = `High accuracy (${Math.round(recentAccuracy * 100)}%) and fast completion (${Math.round(averageTime)}s/problem). Ready for harder problems!`;
      confidence = 0.8;
      basedOn.push('high_accuracy', 'fast_completion');
    } else if (recentAccuracy < 0.6 || averageTime > 60) {
      // Low accuracy or slow = decrease difficulty
      recommendedDifficulty = this.decreaseDifficulty(currentDifficulty);
      reason = `Accuracy ${Math.round(recentAccuracy * 100)}% or slow completion (${Math.round(averageTime)}s/problem). Try easier problems to build confidence.`;
      confidence = 0.8;
      basedOn.push('low_accuracy', 'slow_completion');
    } else {
      // Maintain current difficulty
      reason = `Good performance (${Math.round(recentAccuracy * 100)}% accuracy, ${Math.round(averageTime)}s/problem). Current difficulty is appropriate.`;
      confidence = 0.6;
      basedOn.push('stable_performance');
    }

    return {
      currentDifficulty,
      recommendedDifficulty,
      reason,
      confidence,
      basedOn,
    };
  }

  // Spaced repetition system
  createSpacedRepetitionItem(studentId: string, problemType: string, subject: string, difficulty: string): SpacedRepetitionItem {
    const item: SpacedRepetitionItem = {
      id: `sr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      problemType,
      subject,
      difficulty,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5, // Default ease factor
      quality: 0,
    };

    this.saveSpacedRepetitionItem(item);
    return item;
  }

  // Update spaced repetition item based on performance
  updateSpacedRepetitionItem(itemId: string, quality: number): SpacedRepetitionItem | null {
    const item = this.getSpacedRepetitionItem(itemId);
    if (!item) return null;

    // Update item based on SM-2 algorithm
    item.repetitions += 1;
    item.quality = quality;
    item.lastReviewed = new Date();

    if (quality < 3) {
      // Failed - reset interval
      item.interval = 1;
      item.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Passed - update interval and ease factor
      if (item.repetitions === 1) {
        item.interval = 1;
      } else if (item.repetitions === 2) {
        item.interval = 6;
      } else {
        item.interval = Math.round(item.interval * item.easeFactor);
      }

      // Update ease factor
      item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      item.nextReview = new Date(Date.now() + item.interval * 24 * 60 * 60 * 1000);
    }

    this.saveSpacedRepetitionItem(item);
    return item;
  }

  // Get items due for review
  getItemsDueForReview(studentId: string): SpacedRepetitionItem[] {
    const items = this.getAllSpacedRepetitionItems();
    const now = new Date();
    return items.filter(item => 
      item.studentId === studentId && 
      item.nextReview <= now
    );
  }

  // Private helper methods
  private calculateAverageTime(progress: StudentProgress, session: WorksheetSession): number {
    const totalTime = progress.averageTimePerProblem * (progress.totalProblems - session.problemCount) + 
                     (session.timeSpent / session.problemCount) * session.problemCount;
    return totalTime / progress.totalProblems;
  }

  private calculateAccuracyVariance(sessions: WorksheetSession[]): number {
    const accuracies = sessions.map(s => s.correctCount / s.problemCount);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
    return Math.sqrt(variance);
  }

  private groupSessionsBySubject(sessions: WorksheetSession[]): Record<string, WorksheetSession[]> {
    return sessions.reduce((groups, session) => {
      if (!groups[session.subject]) {
        groups[session.subject] = [];
      }
      groups[session.subject].push(session);
      return groups;
    }, {} as Record<string, WorksheetSession[]>);
  }

  private calculateSubjectAccuracy(sessions: WorksheetSession[]): number {
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalProblems = sessions.reduce((sum, s) => sum + s.problemCount, 0);
    return totalProblems > 0 ? totalCorrect / totalProblems : 0;
  }

  private calculateRecentAccuracy(sessions: WorksheetSession[]): number {
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalProblems = sessions.reduce((sum, s) => sum + s.problemCount, 0);
    return totalProblems > 0 ? totalCorrect / totalProblems : 0;
  }

  private calculateAverageTimePerProblem(sessions: WorksheetSession[]): number {
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const totalProblems = sessions.reduce((sum, s) => sum + s.problemCount, 0);
    return totalProblems > 0 ? totalTime / totalProblems : 0;
  }

  private increaseDifficulty(current: string): string {
    const difficultyOrder = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    const currentIndex = difficultyOrder.indexOf(current);
    return currentIndex < difficultyOrder.length - 1 ? difficultyOrder[currentIndex + 1] : current;
  }

  private decreaseDifficulty(current: string): string {
    const difficultyOrder = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    const currentIndex = difficultyOrder.indexOf(current);
    return currentIndex > 0 ? difficultyOrder[currentIndex - 1] : current;
  }

  // Storage methods
  private getAllProgress(): StudentProgress[] {
    const stored = localStorage.getItem(`${this.storageKey}-progress`);
    return stored ? JSON.parse(stored) : [];
  }

  private saveStudentProgress(progress: StudentProgress): void {
    const allProgress = this.getAllProgress();
    const index = allProgress.findIndex(p => p.studentId === progress.studentId);
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    localStorage.setItem(`${this.storageKey}-progress`, JSON.stringify(allProgress));
  }

  private getAllSessions(): WorksheetSession[] {
    const stored = localStorage.getItem(`${this.storageKey}-sessions`);
    return stored ? JSON.parse(stored) : [];
  }

  private saveSession(session: WorksheetSession): void {
    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(`${this.storageKey}-sessions`, JSON.stringify(sessions));
  }

  private getAllSpacedRepetitionItems(): SpacedRepetitionItem[] {
    const stored = localStorage.getItem(`${this.storageKey}-spaced-repetition`);
    return stored ? JSON.parse(stored) : [];
  }

  private saveSpacedRepetitionItem(item: SpacedRepetitionItem): void {
    const items = this.getAllSpacedRepetitionItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(`${this.storageKey}-spaced-repetition`, JSON.stringify(items));
  }

  private getSpacedRepetitionItem(itemId: string): SpacedRepetitionItem | null {
    const items = this.getAllSpacedRepetitionItems();
    return items.find(i => i.id === itemId) || null;
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
