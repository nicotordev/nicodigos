import { syncProductFromKinguin } from "@/lib/catalog/sync-product-from-kinguin";
import { getEurToClpRate } from "@/lib/currency/exchange";
import { fulfillKinguinOrder } from "@/lib/store/checkout/fulfill-kinguin-order";
import prisma from "@/lib/prisma";
import type {
  KinguinOrderStatusWebhookPayload,
  KinguinProductUpdateWebhookPayload,
} from "@/lib/kinguin/webhook";

export async function handleKinguinOrderStatusWebhook(
  payload: KinguinOrderStatusWebhookPayload,
): Promise<void> {
  const order =
    (payload.orderExternalId
      ? await prisma.order.findUnique({
          where: { id: payload.orderExternalId },
          select: { id: true },
        })
      : null) ??
    (await prisma.order.findFirst({
      where: { kinguinOrderId: payload.orderId },
      select: { id: true },
    }));

  if (!order) {
    console.warn(
      "[kinguin-webhook] Pedido no encontrado:",
      payload.orderId,
      payload.orderExternalId,
    );
    return;
  }

  await prisma.order.updateMany({
    where: { id: order.id },
    data: {
      kinguinOrderId: payload.orderId,
      kinguinStatus: `kinguin:webhook:${payload.status}`,
    },
  });

  const status = String(payload.status).toLowerCase();

  if (status === "completed" || status === "processing") {
    const result = await fulfillKinguinOrder(order.id);
    console.info(
      `[kinguin-webhook] order.status=${payload.status} order=${order.id} → ${result.status} keys=${result.keysDelivered}`,
    );
  }
}

export async function handleKinguinProductUpdateWebhook(
  payload: KinguinProductUpdateWebhookPayload,
): Promise<void> {
  const products = await prisma.product.findMany({
    where: { kinguinProductId: payload.productId },
    select: { id: true },
  });

  if (products.length === 0) {
    return;
  }

  const fx = await getEurToClpRate();

  for (const { id } of products) {
    const result = await syncProductFromKinguin(id, fx.rate);
    if (!result.ok) {
      console.warn(
        `[kinguin-webhook] product.update ${payload.productId} → ${result.error}`,
      );
    }
  }
}
