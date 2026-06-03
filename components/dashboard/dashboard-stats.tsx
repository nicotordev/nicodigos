import {
  IconReceipt,
  IconCircleCheck,
  IconCreditCard,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/admin/format";
import type { UserDashboardData } from "@/lib/dashboard/queries";

type DashboardStatsProps = {
  data: Pick<
    UserDashboardData,
    | "totalOrders"
    | "completedOrders"
    | "totalSpent"
    | "cartItemCount"
    | "pendingKeys"
  >;
};

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total pedidos",
      value: String(data.totalOrders),
      description: "Todos tus pedidos realizados",
      icon: IconReceipt,
      colorClass: "text-blue-500 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/20",
    },
    {
      title: "Pedidos completados",
      value: String(data.completedOrders),
      description: "Entregados con éxito",
      icon: IconCircleCheck,
      colorClass: "text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20",
    },
    {
      title: "Total gastado",
      value: formatMoney(data.totalSpent),
      description: "Pedidos aprobados y activos",
      icon: IconCreditCard,
      colorClass: "text-orange-500 bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/10 dark:border-orange-500/20",
    },
    {
      title: "En tu carrito",
      value: String(data.cartItemCount),
      description: data.pendingKeys > 0
        ? `${data.pendingKeys} clave(s) pendiente(s)`
        : "Artículos listos para comprar",
      icon: IconShoppingCart,
      colorClass: "text-primary bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20",
    },
  ] as const;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} size="sm" className="relative overflow-hidden border border-border/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/10 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardDescription>
              <div className={`flex size-8 items-center justify-center rounded-xl border ${stat.colorClass}`}>
                <Icon className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {stat.value}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
