import { AccountOverview } from "@/components/dashboard/account-overview";
import { DashboardActivityTabs } from "@/components/dashboard/dashboard-activity-tabs";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { requireUser } from "@/lib/dashboard/auth";
import { getUserDashboardData } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const session = await requireUser();
  const data = await getUserDashboardData(session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  const memberSince = data.memberSince;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 md:space-y-8">
      <AccountOverview
        name={session.user.name}
        emailVerified={session.user.emailVerified}
        memberSince={memberSince}
      />

      <DashboardStats data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardActivityTabs
            orders={data.recentOrders}
            profile={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              emailVerified: session.user.emailVerified,
              role: session.user.role,
              memberSince,
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <QuickActions isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
