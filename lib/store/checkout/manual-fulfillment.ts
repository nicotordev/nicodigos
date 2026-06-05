import "server-only";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { storeRoutes } from "@/lib/store/navigation";
import { syncTransactionsForOrder } from "@/lib/transactions/on-order";

export const KINGUIN_MANUAL_PENDING_PREFIX = "kinguin:manual:pending:";

export const MANUAL_FULFILLMENT_CUSTOMER_MESSAGE =
  "Tu pago está confirmado. Entregaremos tu key dentro de las próximas 24 horas.";

export type ManualFulfillmentReason =
  | "insufficient_balance"
  | "kinguin_not_configured"
  | "kinguin_error";

const manualReasonLabels: Record<ManualFulfillmentReason, string> = {
  insufficient_balance:
    "Saldo insuficiente en Kinguin para comprar automáticamente.",
  kinguin_not_configured: "Kinguin no está configurado en el servidor.",
  kinguin_error: "Falló la compra automática en Kinguin.",
};

export function isManualFulfillmentPending(
  kinguinStatus: string | null | undefined,
): boolean {
  return kinguinStatus?.startsWith(KINGUIN_MANUAL_PENDING_PREFIX) ?? false;
}

export function buildManualPendingStatus(
  reason: ManualFulfillmentReason,
  detail?: string,
): string {
  const base = `${KINGUIN_MANUAL_PENDING_PREFIX}${reason}`;
  if (!detail?.trim()) {
    return base;
  }
  return `${base}|${detail.trim().slice(0, 220)}`;
}

export function getManualFulfillmentAdminNote(
  kinguinStatus: string | null | undefined,
): string | null {
  if (!isManualFulfillmentPending(kinguinStatus) || !kinguinStatus) {
    return null;
  }

  const payload = kinguinStatus.slice(KINGUIN_MANUAL_PENDING_PREFIX.length);
  const [reason, detail] = payload.split("|", 2);
  const label =
    manualReasonLabels[reason as ManualFulfillmentReason] ??
    "Pendiente de entrega manual.";

  return detail ? `${label} ${detail}` : label;
}

export async function markOrderForManualFulfillment(
  orderId: string,
  reason: ManualFulfillmentReason,
  detail?: string,
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      kinguinStatus: buildManualPendingStatus(reason, detail),
    },
  });
}

export async function clearManualFulfillmentPending(
  orderId: string,
): Promise<void> {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      kinguinStatus: { startsWith: KINGUIN_MANUAL_PENDING_PREFIX },
    },
    data: { kinguinStatus: null },
  });
}

export async function countDeliveredKeysForOrder(
  orderId: string,
): Promise<number> {
  return prisma.orderKey.count({
    where: {
      orderItem: { orderId },
      status: "DELIVERED",
      serial: { not: "" },
    },
  });
}

export async function countExpectedKeysForOrder(
  orderId: string,
): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { quantity: true },
  });

  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function completeOrderIfAllKeysDelivered(
  orderId: string,
): Promise<boolean> {
  const [expectedKeys, deliveredKeys, order] = await Promise.all([
    countExpectedKeysForOrder(orderId),
    countDeliveredKeysForOrder(orderId),
    prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        total: true,
        currency: true,
        kinguinOrderId: true,
        isPreorder: true,
        updatedAt: true,
      },
    }),
  ]);

  if (
    !order ||
    expectedKeys === 0 ||
    deliveredKeys < expectedKeys ||
    order.status !== "PROCESSING" ||
    order.isPreorder
  ) {
    return false;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      kinguinStatus: "kinguin:manual:fulfilled",
    },
  });

  await syncTransactionsForOrder({
    ...order,
    status: "COMPLETED",
  });

  revalidatePath(storeRoutes.orders);
  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return true;
}

export function buildManualKinguinKeyId(
  orderItemId: string,
  deliveredCount: number,
): string {
  return `manual:${orderItemId}:${deliveredCount + 1}:${Date.now()}`;
}
