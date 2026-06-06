import type { OrderStatus } from "@/lib/generated/prisma/client";

export type OrderKinguinRetryCandidate = {
  status: OrderStatus;
  pendingKeyCount: number;
  needsManualFulfillment: boolean;
};

/** Pedido elegible para reintentar la compra automática en Kinguin. */
export function canRetryKinguinPurchase(
  order: OrderKinguinRetryCandidate,
): boolean {
  if (order.status !== "PROCESSING" && order.status !== "COMPLETED") {
    return false;
  }

  if (order.pendingKeyCount > 0) {
    return true;
  }

  return order.needsManualFulfillment;
}
