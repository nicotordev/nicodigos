"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentOrdersList } from "@/components/dashboard/recent-orders-list";
import { ProfileSummaryCard } from "@/components/dashboard/profile-summary-card";
import type { UserDashboardOrder } from "@/lib/dashboard/queries";

type DashboardActivityTabsProps = {
  orders: UserDashboardOrder[];
  profile: {
    name: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    role?: string | null;
    memberSince: Date | string;
  };
};

export function DashboardActivityTabs({
  orders,
  profile,
}: DashboardActivityTabsProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-base font-semibold tracking-tight">
          Actividad y cuenta
        </h2>
        <p className="text-sm text-muted-foreground">
          Pedidos recientes y datos de tu perfil
        </p>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="activity" className="flex-1 sm:flex-none">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 sm:flex-none">
            Cuenta
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-4">
          <RecentOrdersList orders={orders} />
        </TabsContent>
        <TabsContent value="account" className="mt-4">
          <ProfileSummaryCard {...profile} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
