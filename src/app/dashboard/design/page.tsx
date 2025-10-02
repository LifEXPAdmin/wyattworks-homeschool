import { MobileLayout } from "@/components/mobile-layout";

export default function DesignSystemPage() {
  return (
    <MobileLayout>
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Design System</h1>
        <p className="text-muted-foreground">
          Design system dashboard is temporarily unavailable while we implement the new
          homeschool-focused theme.
        </p>
      </div>
    </MobileLayout>
  );
}
