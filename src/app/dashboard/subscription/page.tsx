import { currentUser } from "@clerk/nextjs/server";
import { SubscriptionDashboard } from "@/components/subscription-dashboard";
import { MobileLayout } from "@/components/mobile-layout";

export default async function SubscriptionPage() {
  const user = await currentUser();
  
  return (
    <MobileLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription and billing preferences
          </p>
        </div>
        
        <SubscriptionDashboard userId={user?.id || "default-user"} />
      </div>
    </MobileLayout>
  );
}
