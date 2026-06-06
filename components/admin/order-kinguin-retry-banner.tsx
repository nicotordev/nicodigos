"use client";

import { AdminRetryKinguinButton } from "@/components/admin/admin-retry-kinguin-button";
import { canRetryKinguinPurchase } from "@/lib/admin/orders/kinguin-retry";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import { IconBolt } from "@tabler/icons-react";

type OrderKinguinRetryBannerProps = {
  order: AdminOrderDetail;
};

export function OrderKinguinRetryBanner({
  order,
}: OrderKinguinRetryBannerProps) {
  if (!canRetryKinguinPurchase(order)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IconBolt className="size-4 shrink-0 text-primary" />
          Compra automática en Kinguin
        </p>
        <p className="text-sm text-muted-foreground">
          Reintenta la compra con saldo Kinguin en lugar de pegar keys a mano.
          {order.needsManualFulfillment
            ? " Este pedido quedó en cola manual."
            : order.pendingKeyCount > 0
              ? ` Faltan ${order.pendingKeyCount} key${order.pendingKeyCount === 1 ? "" : "s"}.`
              : null}
        </p>
      </div>
      <AdminRetryKinguinButton
        orderId={order.id}
        variant="default"
        size="default"
        className="shrink-0"
        label="Reintentar compra en Kinguin"
        pendingLabel="Comprando en Kinguin…"
      />
    </div>
  );
}
