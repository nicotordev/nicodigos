"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import { retryKinguinFulfillmentAction } from "@/lib/admin/orders/retry-fulfillment";
import prisma from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { syncTransactionsForOrder } from "@/lib/transactions/on-order";

const MAX_BULK_ORDERS = 50;

const bulkOrderIdsSchema = z
  .array(z.string().trim().min(1))
  .min(1, "Selecciona al menos un pedido.")
  .max(MAX_BULK_ORDERS, `Máximo ${MAX_BULK_ORDERS} pedidos por acción.`);

const bulkStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
]);

export type BulkOrdersActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  processed?: number;
  failed?: number;
  details?: string[];
};

function revalidateOrdersList() {
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/keys");
}

export async function bulkUpdateOrdersStatusAction(
  orderIds: string[],
  status: OrderStatus,
): Promise<BulkOrdersActionResult> {
  await requireAdmin();

  const parsedIds = bulkOrderIdsSchema.safeParse(orderIds);
  if (!parsedIds.success) {
    return {
      success: false,
      error: parsedIds.error.issues[0]?.message ?? "Selección inválida.",
    };
  }

  const parsedStatus = bulkStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false, error: "Estado inválido." };
  }

  const uniqueIds = [...new Set(parsedIds.data)];
  let processed = 0;
  const details: string[] = [];

  for (const orderId of uniqueIds) {
    try {
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          status: true,
          total: true,
          currency: true,
          kinguinOrderId: true,
          updatedAt: true,
        },
      });

      if (!existing) {
        details.push(`${orderId.slice(0, 8)}…: no encontrado`);
        continue;
      }

      if (existing.status === parsedStatus.data) {
        processed += 1;
        continue;
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: parsedStatus.data },
        select: {
          id: true,
          userId: true,
          status: true,
          total: true,
          currency: true,
          kinguinOrderId: true,
          updatedAt: true,
        },
      });

      await syncTransactionsForOrder(updated);
      revalidatePath(`/admin/orders/${orderId}`);
      processed += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      details.push(`${orderId.slice(0, 8)}…: ${message}`);
    }
  }

  revalidateOrdersList();

  const failed = uniqueIds.length - processed;
  if (processed === 0) {
    return {
      success: false,
      error: "No se pudo actualizar ningún pedido.",
      processed: 0,
      failed: uniqueIds.length,
      details,
    };
  }

  return {
    success: true,
    message:
      failed > 0
        ? `${processed} pedido${processed === 1 ? "" : "s"} actualizado${processed === 1 ? "" : "s"}. ${failed} fallaron.`
        : `${processed} pedido${processed === 1 ? "" : "s"} marcado${processed === 1 ? "" : "s"} como ${parsedStatus.data}.`,
    processed,
    failed,
    details: details.length > 0 ? details : undefined,
  };
}

export async function bulkRetryKinguinFulfillmentAction(
  orderIds: string[],
): Promise<BulkOrdersActionResult> {
  await requireAdmin();

  const parsedIds = bulkOrderIdsSchema.safeParse(orderIds);
  if (!parsedIds.success) {
    return {
      success: false,
      error: parsedIds.error.issues[0]?.message ?? "Selección inválida.",
    };
  }

  const uniqueIds = [...new Set(parsedIds.data)];
  let processed = 0;
  let keysDelivered = 0;
  const details: string[] = [];

  for (const orderId of uniqueIds) {
    try {
      const result = await retryKinguinFulfillmentAction(orderId);
      if (
        result.status === "completed" ||
        result.status === "processing" ||
        result.keysDelivered > 0
      ) {
        processed += 1;
        keysDelivered += result.keysDelivered;
        if (result.status === "failed" || result.status === "skipped") {
          details.push(`${orderId.slice(0, 8)}…: ${result.message}`);
        }
      } else {
        details.push(`${orderId.slice(0, 8)}…: ${result.message}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      details.push(`${orderId.slice(0, 8)}…: ${message}`);
    }
  }

  revalidateOrdersList();

  const failed = uniqueIds.length - processed;
  if (processed === 0) {
    return {
      success: false,
      error: "Ningún pedido pudo comprarse en Kinguin.",
      processed: 0,
      failed: uniqueIds.length,
      details,
    };
  }

  return {
    success: true,
    message:
      keysDelivered > 0
        ? `Kinguin procesó ${processed} pedido${processed === 1 ? "" : "s"} (${keysDelivered} key${keysDelivered === 1 ? "" : "s"}).`
        : `Kinguin procesó ${processed} pedido${processed === 1 ? "" : "s"}.`,
    processed,
    failed,
    details: details.length > 0 ? details : undefined,
  };
}
