import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { MobileLayout, MobileCard, MobileButton, MobileGrid } from "@/components/mobile-layout";
import { QuotaWarning } from "@/components/quota-warning";
import { TrialReminder } from "@/components/trial-reminder";

export default async function Dashboard() {
  const user = await currentUser();
  return (
    <MobileLayout>
      {/* Dashboard Content */}
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "there"}! Let&apos;s build some worksheets.
          </p>
        </div>

        {/* Quota Warning */}
        {user?.id && <QuotaWarning userId={user.id} className="mb-6" />}

        {/* Trial Reminder */}
        {user?.id && <TrialReminder userId={user.id} className="mb-6" />}

        {/* Quick Actions */}
        <MobileGrid columns={4} gap="md">
          <Link href="/dashboard/create">
            <MobileCard
              title="Create New Worksheet"
              description="Start building a custom worksheet"
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <MobileButton className="w-full">Get Started</MobileButton>
            </MobileCard>
          </Link>

          <Link href="/dashboard/templates">
            <MobileCard
              title="Browse Templates"
              description="Choose from pre-made templates"
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <MobileButton variant="outline" className="w-full">
                Browse
              </MobileButton>
            </MobileCard>
          </Link>

          <Link href="/dashboard/worksheets">
            <MobileCard
              title="My Worksheets"
              description="View and manage your worksheets"
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <MobileButton variant="outline" className="w-full">
                View All
              </MobileButton>
            </MobileCard>
          </Link>

          <Link href="/dashboard/progress">
            <MobileCard
              title="Progress Reports"
              description="Track learning progress"
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <MobileButton variant="outline" className="w-full">
                View Reports
              </MobileButton>
            </MobileCard>
          </Link>
        </MobileGrid>

        {/* Account & Subscription Management */}
        <MobileGrid columns={2} gap="md">
          <Link href="/dashboard/subscription">
            <MobileCard
              title="Subscription & Billing"
              description="Manage your plan and billing"
              className="cursor-pointer border-blue-200 bg-blue-50 transition-shadow hover:shadow-md"
            >
              <MobileButton variant="outline" className="w-full border-blue-300 text-blue-700">
                Manage Plan
              </MobileButton>
            </MobileCard>
          </Link>

          <Link href="/dashboard/settings">
            <MobileCard
              title="Account Settings"
              description="Update your profile and preferences"
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <MobileButton variant="outline" className="w-full">
                Settings
              </MobileButton>
            </MobileCard>
          </Link>
        </MobileGrid>

        {/* Progress Tracking Section */}
        <div>
          <ProgressDashboard studentId={user?.id || "default-student"} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Worksheets</CardTitle>
              <CardDescription>Your latest worksheet creations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Math Practice - Addition</p>
                    <p className="text-muted-foreground text-sm">Created 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Science Quiz - Plants</p>
                    <p className="text-muted-foreground text-sm">Created 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Reading Comprehension</p>
                    <p className="text-muted-foreground text-sm">Created 2 weeks ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your worksheet building activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Total Worksheets</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">This Month</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Templates Used</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Students</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
