"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  getVisibleNavItems,
  isDashboardNavActive,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-nav";
import type { DashboardUserMenuUser } from "@/components/dashboard/dashboard-user-menu";
import { getUserInitials } from "@/lib/dashboard/format";

function DashboardSidebarMenu({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  function closeMobileNav() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isDashboardNavActive(item.href, pathname);

        return (
          <SidebarMenuItem key={item.href + item.label}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              size="lg"
              tooltip={item.label}
              className="min-h-10"
            >
              <Link href={item.href} onClick={closeMobileNav}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

type DashboardAppSidebarProps = {
  user: DashboardUserMenuUser & { role?: string | null };
};

export function DashboardAppSidebar({ user }: DashboardAppSidebarProps) {
  const navItems = getVisibleNavItems(user.role);
  const initials = getUserInitials(user.name);

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="px-4 py-4">
        <Logo href="/dashboard" size="md" />
        <p className="text-xs text-muted-foreground">
          Tienda de keys digitales
        </p>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <DashboardSidebarMenu items={navItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Item size="sm" variant="muted" className="border-0 bg-transparent">
              <ItemMedia>
                <Avatar size="sm">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{user.name}</ItemTitle>
                <ItemDescription>{user.email}</ItemDescription>
              </ItemContent>
            </Item>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
