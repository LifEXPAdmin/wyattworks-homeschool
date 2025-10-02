import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { MobileLayout } from "@/components/mobile-layout";

export default function AnalyticsPage() {
  return (
    <MobileLayout>
      <AnalyticsDashboard userId="current-student" />
    </MobileLayout>
  );
}
