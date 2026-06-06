import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconCreditCard,
  IconUser,
} from "@tabler/icons-react";

import { OrderDetailWorkspace } from "@/components/admin/order-detail-workspace";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderTransactionsCard } from "@/components/admin/order-transactions-card";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type AdminOrderDetailViewProps = {
  order: AdminOrderDetail;
};

function MetaItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function AdminOrderDetailView({ order }: AdminOrderDetailViewProps) {
  const shortId = order.id.slice(0, 8);
  const extraKeyCount = order.items.reduce(
    (sum, item) => sum + Math.max(item.deliveredKeyCount - item.quantity, 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/admin/orders">
          <IconArrowLeft className="size-4" />
          Pedidos
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {order.needsManualFulfillment ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 text-amber-700 dark:text-amber-400"
                  >
                    Entrega manual
                  </Badge>
                ) : null}
                {order.isPreorder ? (
                  <Badge variant="outline">Preventa</Badge>
                ) : null}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight">
                  Pedido #{shortId}
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {order.id}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {formatMoney(order.total, order.currency)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Subtotal {formatMoney(order.subtotal, order.currency)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {order.deliveredKeyCount}/{order.expectedKeyCount} keys
                {extraKeyCount > 0 ? ` (+${extraKeyCount} extra)` : ""}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetaItem icon={IconUser} label="Cliente">
              <Link
                href={`/admin/users/${order.customer.id}`}
                className="font-medium hover:text-primary hover:underline"
              >
                {order.customer.name}
              </Link>
              <p className="truncate text-muted-foreground">
                {order.customer.email}
              </p>
            </MetaItem>

            <MetaItem icon={IconCreditCard} label="Facturación">
              <p>{order.billing.fullName || "—"}</p>
              <p className="truncate text-muted-foreground">
                {order.billing.email || order.customer.email}
              </p>
            </MetaItem>

            <MetaItem icon={IconCalendar} label="Creado">
              <p>{formatDate(order.createdAt)}</p>
              <p className="text-muted-foreground">
                Actualizado {formatDate(order.updatedAt)}
              </p>
            </MetaItem>

            {(order.kinguinOrderId || order.kinguinStatus) && (
              <MetaItem icon={IconCreditCard} label="Kinguin">
                {order.kinguinOrderId ? (
                  <p className="truncate font-mono text-xs">
                    {order.kinguinOrderId}
                  </p>
                ) : null}
                {order.kinguinStatus ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {order.kinguinStatus}
                  </p>
                ) : null}
              </MetaItem>
            )}
          </div>
        </CardContent>
      </Card>

      <OrderDetailWorkspace order={order} />

      <OrderTransactionsCard transactions={order.transactions} />
    </div>
  );
}
