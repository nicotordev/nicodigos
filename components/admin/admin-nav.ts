import type { TablerIcon } from "@tabler/icons-react";
import {
  IconAlertTriangle,
  IconCategory,
  IconLayoutDashboard,
  IconPackage,
  IconReceipt,
  IconShoppingCart,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

export type AdminNavGroup = "overview" | "catalog" | "operations" | "account";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: TablerIcon;
  group: AdminNavGroup;
};

export const adminNavGroupLabels: Record<AdminNavGroup, string> = {
  overview: "Resumen",
  catalog: "Catálogo",
  operations: "Operación",
  account: "Cuenta",
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: IconLayoutDashboard,
    group: "overview",
  },
  {
    href: "/admin/orders",
    label: "Pedidos",
    icon: IconShoppingCart,
    group: "operations",
  },
  {
    href: "/admin/users",
    label: "Clientes",
    icon: IconUsers,
    group: "operations",
  },
  {
    href: "/admin/transactions",
    label: "Transacciones",
    icon: IconReceipt,
    group: "operations",
  },
  {
    href: "/admin/products",
    label: "Productos",
    icon: IconPackage,
    group: "catalog",
  },
  {
    href: "/admin/categories",
    label: "Categorías",
    icon: IconCategory,
    group: "catalog",
  },
  {
    href: "/admin/inventory",
    label: "Inventario",
    icon: IconAlertTriangle,
    group: "catalog",
  },
  {
    href: "/admin/settings",
    label: "Mi cuenta",
    icon: IconUser,
    group: "account",
  },
];

const adminNavGroups: AdminNavGroup[] = [
  "overview",
  "catalog",
  "operations",
  "account",
];

export function getAdminNavByGroup(): {
  group: AdminNavGroup;
  label: string;
  items: AdminNavItem[];
}[] {
  return adminNavGroups.map((group) => ({
    group,
    label: adminNavGroupLabels[group],
    items: adminNavItems.filter((item) => item.group === group),
  }));
}

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
