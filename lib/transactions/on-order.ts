import "server-only";

import type { OrderStatus } from "@/lib/generated/prisma/client";
import { recordTransaction } from "@/lib/transactions/record";
import {
  orderChargeIdempotencyKey,
  orderRefundIdempotencyKey,
  transactionStatusFromOrderStatus,
} from "@/lib/transactions/order-status";

type OrderTransactionSnapshot = {
  id: string;
  userId: string;
  status: OrderStatus;
  total: { toString(): string } | number | string;
  currency: string;
  kinguinOrderId?: string | null;
  updatedAt?: Date;
};

/**
 * Registra cobro (y reembolso si aplica) al crear o actualizar un pedido.
 * Idempotente: seguro llamar varias veces.
 */
export async function syncTransactionsForOrder(
  order: OrderTransactionSnapshot,
): Promise<void> {
  const total =
    typeof order.total === "object" && "toString" in order.total
      ? order.total.toString()
      : String(order.total);

  await recordTransaction({
    userId: order.userId,
    orderId: order.id,
    type: "CHARGE",
    status: transactionStatusFromOrderStatus(order.status),
    amount: total,
    currency: order.currency,
    provider: "internal",
    providerReference: order.kinguinOrderId ?? null,
    description: `Cobro pedido ${order.id}`,
    idempotencyKey: orderChargeIdempotencyKey(order.id),
    processedAt:
      order.status === "COMPLETED" || order.status === "REFUNDED"
        ? (order.updatedAt ?? new Date())
        : null,
  });

  if (order.status === "REFUNDED") {
    await recordTransaction({
      userId: order.userId,
      orderId: order.id,
      type: "REFUND",
      status: "SUCCEEDED",
      amount: total,
      currency: order.currency,
      provider: "internal",
      description: `Reembolso pedido ${order.id}`,
      idempotencyKey: orderRefundIdempotencyKey(order.id),
      processedAt: order.updatedAt ?? new Date(),
    });
  }
}
