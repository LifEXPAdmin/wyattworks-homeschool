import { PerformanceDashboard } from "@/components/performance-dashboard";
import { MobileLayout } from "@/components/mobile-layout";

export default function PerformancePage() {
  return (
    <MobileLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600 mt-2">
            Monitor app performance, caching, and offline capabilities
          </p>
        </div>
        
        <PerformanceDashboard />
      </div>
    </MobileLayout>
  );
}
