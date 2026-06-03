import type { TablerIcon } from "@tabler/icons-react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: TablerIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: IconLayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Productos",
    icon: IconPackage,
  },
  {
    href: "/admin/settings",
    label: "Mi cuenta",
    icon: IconUser,
  },
];

export function isAdminNavActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (href === "/admin/settings") {
    return (
      pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
