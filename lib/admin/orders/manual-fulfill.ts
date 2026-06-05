"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import prisma from "@/lib/prisma";
import {
  completeOrderIfAllKeysDelivered,
  buildManualKinguinKeyId,
} from "@/lib/store/checkout/manual-fulfillment";

export type ManualFulfillmentActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  orderCompleted?: boolean;
  deliveredKeys?: number;
  pendingKeys?: number;
};

export async function deliverManualOrderKeyAction(input: {
  orderId: string;
  orderItemId: string;
  serial: string;
}): Promise<ManualFulfillmentActionResult> {
  await requireAdmin();

  const serial = input.serial.trim();
  if (!serial) {
    return { success: false, error: "Ingresa la key o serial a entregar." };
  }

  const item = await prisma.orderItem.findFirst({
    where: {
      id: input.orderItemId,
      orderId: input.orderId,
    },
    select: {
      id: true,
      quantity: true,
      keyType: true,
      order: {
        select: {
          id: true,
          status: true,
        },
      },
      keys: {
        where: {
          status: "DELIVERED",
          serial: { not: "" },
        },
        select: { id: true },
      },
    },
  });

  if (!item) {
    return { success: false, error: "No encontramos la línea del pedido." };
  }

  if (item.order.status !== "PROCESSING" && item.order.status !== "COMPLETED") {
    return {
      success: false,
      error:
        "Solo se pueden entregar keys en pedidos en proceso o completados.",
    };
  }

  if (item.keys.length >= item.quantity) {
    return {
      success: false,
      error: "Esta línea ya tiene todas sus keys entregadas.",
    };
  }

  await prisma.orderKey.create({
    data: {
      orderItemId: item.id,
      kinguinKeyId: buildManualKinguinKeyId(item.id, item.keys.length),
      serial,
      contentType: item.keyType?.trim() || "text",
      status: "DELIVERED",
    },
  });

  const orderCompleted = await completeOrderIfAllKeysDelivered(input.orderId);

  const [deliveredKeys, expectedKeys] = await Promise.all([
    prisma.orderKey.count({
      where: {
        orderItem: { orderId: input.orderId },
        status: "DELIVERED",
        serial: { not: "" },
      },
    }),
    prisma.orderItem
      .aggregate({
        where: { orderId: input.orderId },
        _sum: { quantity: true },
      })
      .then((result) => result._sum.quantity ?? 0),
  ]);
  const pendingKeys = Math.max(expectedKeys - deliveredKeys, 0);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${input.orderId}`);
  revalidatePath("/dashboard/orders");

  return {
    success: true,
    message: orderCompleted
      ? "Key entregada. El pedido quedó completado."
      : "Key entregada correctamente.",
    orderCompleted,
    deliveredKeys,
    pendingKeys,
  };
}
