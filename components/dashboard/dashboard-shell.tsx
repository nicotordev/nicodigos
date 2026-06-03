"use client";

import { DashboardAppSidebar } from "@/components/dashboard/dashboard-app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { DashboardUserMenuUser } from "@/components/dashboard/dashboard-user-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export type DashboardShellUser = DashboardUserMenuUser & {
  role?: string | null;
};

type DashboardShellProps = {
  user: DashboardShellUser;
  title?: string;
  children: React.ReactNode;
};

export function DashboardShell({
  user,
  title = "Mi cuenta",
  children,
}: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-dvh bg-muted/30">
        <DashboardAppSidebar user={user} />
        <SidebarInset className="min-h-dvh min-w-0">
          <DashboardHeader title={title} user={user} />
          <div className="flex-1 px-3 py-4 md:px-8 md:py-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
