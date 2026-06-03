import "server-only";

import { recordTransaction } from "@/lib/transactions/record";
import {
  orderChargeIdempotencyKey,
  orderRefundIdempotencyKey,
  transactionStatusFromOrderStatus,
} from "@/lib/transactions/order-status";
import prisma from "@/lib/prisma";

export type SyncTransactionsResult = {
  chargesCreated: number;
  refundsCreated: number;
  skipped: number;
};

export async function syncTransactionsFromOrders(): Promise<SyncTransactionsResult> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      status: true,
      total: true,
      currency: true,
      kinguinOrderId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  let chargesCreated = 0;
  let refundsCreated = 0;
  let skipped = 0;

  for (const order of orders) {
    const chargeKey = orderChargeIdempotencyKey(order.id);
    const charge = await recordTransaction({
      userId: order.userId,
      orderId: order.id,
      type: "CHARGE",
      status: transactionStatusFromOrderStatus(order.status),
      amount: order.total,
      currency: order.currency,
      provider: "internal",
      providerReference: order.kinguinOrderId,
      description: `Cobro pedido ${order.id}`,
      idempotencyKey: chargeKey,
      processedAt:
        order.status === "COMPLETED" || order.status === "REFUNDED"
          ? order.updatedAt
          : null,
    });
    if (charge.created) {
      chargesCreated += 1;
    } else {
      skipped += 1;
    }

    if (order.status === "REFUNDED") {
      const refund = await recordTransaction({
        userId: order.userId,
        orderId: order.id,
        type: "REFUND",
        status: "SUCCEEDED",
        amount: order.total,
        currency: order.currency,
        provider: "internal",
        description: `Reembolso pedido ${order.id}`,
        idempotencyKey: orderRefundIdempotencyKey(order.id),
        processedAt: order.updatedAt,
      });
      if (refund.created) {
        refundsCreated += 1;
      }
    }
  }

  return { chargesCreated, refundsCreated, skipped };
}
