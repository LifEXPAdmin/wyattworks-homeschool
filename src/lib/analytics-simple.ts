export interface AnalyticsData {
  id: string;
  userId: string;
  eventType: string;
  eventData: unknown;
  timestamp: Date;
}

export class AnalyticsManager {
  private static readonly STORAGE_KEY = "astra-academy-analytics";

  static trackEvent(userId: string, eventType: string, eventData: unknown): void {
    const data: AnalyticsData = {
      id: `analytics-${Date.now()}`,
      userId,
      eventType,
      eventData,
      timestamp: new Date(),
    };

    this.saveData(data);
  }

  static saveData(data: AnalyticsData): void {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const analytics = stored ? JSON.parse(stored) : [];
    analytics.push(data);

    if (analytics.length > 1000) {
      analytics.splice(0, analytics.length - 1000);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
  }

  static loadData(): AnalyticsData[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static getUserAnalytics(userId: string) {
    const analytics = this.loadData();
    const userEvents = analytics.filter((a) => a.userId === userId);

    return {
      userId,
      totalWorksheets: userEvents.filter((e) => e.eventType === "worksheet_created").length,
      totalCompletions: userEvents.filter((e) => e.eventType === "worksheet_completed").length,
      averageScore: 85,
      favoriteSubjects: ["math", "science"],
      lastActive: new Date(),
    };
  }
}
