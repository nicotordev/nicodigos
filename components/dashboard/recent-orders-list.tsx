import Link from "next/link";
import { IconReceipt, IconShoppingBag } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { formatOrderStatusEs } from "@/lib/dashboard/format";
import type { UserDashboardOrder } from "@/lib/dashboard/queries";
import type { OrderStatus } from "@/lib/generated/prisma/client";

const statusStyles: Record<
  OrderStatus,
  string
> = {
  PENDING: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  PROCESSING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10",
  CANCELED: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
  REFUNDED: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
};

type RecentOrdersListProps = {
  orders: UserDashboardOrder[];
};

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  if (orders.length === 0) {
    return (
      <Empty className="border border-dashed border-border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconReceipt />
          </EmptyMedia>
          <EmptyTitle>Sin pedidos todavía</EmptyTitle>
          <EmptyDescription>
            Cuando compres en la tienda, tus pedidos aparecerán aquí con su
            estado y detalle.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild className="rounded-xl">
            <Link href="/">Ir a la tienda</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Card size="sm" className="border border-border/40 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow bg-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <IconShoppingBag className="size-4.5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <CardTitle className="text-sm font-semibold text-foreground truncate">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-[11px] font-mono">
                    {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={statusStyles[order.status]}>
                {formatOrderStatusEs(order.status)}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 text-sm border-t border-border/20 pt-3">
              <span className="text-xs text-muted-foreground font-medium">
                {order.itemCount}{" "}
                {order.itemCount === 1 ? "artículo" : "artículos"}
              </span>
              <span className="font-semibold text-foreground font-mono">
                {formatMoney(order.total, order.currency)}
              </span>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
