import "server-only";

import { revalidatePath } from "next/cache";
import { FLOW_PAYMENT_TIMEOUT_SECONDS } from "@/lib/payments/flow/build-payment-request";
import prisma from "@/lib/prisma";
import { storeRoutes } from "@/lib/store/navigation";

const DEFAULT_BATCH_SIZE = 100;
const FLOW_EXPIRE_BUFFER_MINUTES = 15;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Minutos sin pago antes de cancelar pedidos PENDING (default: timeout Flow + margen). */
export function getOrderPendingExpireMinutes(): number {
  const flowMinutes = Math.ceil(FLOW_PAYMENT_TIMEOUT_SECONDS / 60);
  const defaultMinutes = flowMinutes + FLOW_EXPIRE_BUFFER_MINUTES;

  return parsePositiveInt(
    process.env.ORDER_PENDING_EXPIRE_MINUTES,
    defaultMinutes,
  );
}

export function getExpirePendingOrdersBatchSize(override?: number): number {
  if (override !== undefined && override > 0) {
    return override;
  }

  return parsePositiveInt(
    process.env.CRON_EXPIRE_ORDERS_BATCH_SIZE,
    DEFAULT_BATCH_SIZE,
  );
}

export type ExpirePendingOrdersResult = {
  expireMinutes: number;
  cutoff: string;
  expiredCount: number;
  orderIds: string[];
};

function revalidateExpiredOrderPaths() {
  revalidatePath(storeRoutes.checkoutReturn);
  revalidatePath(storeRoutes.orders);
  revalidatePath("/admin/orders");
}

export async function expirePendingOrders(options?: {
  expireMinutes?: number;
  batchSize?: number;
}): Promise<ExpirePendingOrdersResult> {
  const expireMinutes =
    options?.expireMinutes ?? getOrderPendingExpireMinutes();
  const batchSize = getExpirePendingOrdersBatchSize(options?.batchSize);
  const cutoff = new Date(Date.now() - expireMinutes * 60 * 1000);

  const staleOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  if (staleOrders.length === 0) {
    return {
      expireMinutes,
      cutoff: cutoff.toISOString(),
      expiredCount: 0,
      orderIds: [],
    };
  }

  const orderIds = staleOrders.map((order) => order.id);
  const now = new Date();

  await prisma.$transaction([
    prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        status: "PENDING",
      },
      data: { status: "CANCELED" },
    }),
    prisma.transaction.updateMany({
      where: {
        orderId: { in: orderIds },
        status: "PENDING",
      },
      data: {
        status: "CANCELED",
        processedAt: now,
      },
    }),
  ]);

  revalidateExpiredOrderPaths();

  return {
    expireMinutes,
    cutoff: cutoff.toISOString(),
    expiredCount: orderIds.length,
    orderIds,
  };
}
