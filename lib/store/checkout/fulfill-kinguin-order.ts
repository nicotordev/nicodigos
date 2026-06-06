import { revalidatePath } from "next/cache";

import { formatKinguinError } from "@/lib/kinguin/errors";
import { getKinguinSdk, isKinguinConfigured } from "@/lib/kinguin/client";
import { findKinguinOrderByExternalId } from "@/lib/store/checkout/find-kinguin-order";
import {
  buildKinguinPlaceOrderProducts,
  placeKinguinOrderWithFallback,
  type OrderItemForKinguin,
} from "@/lib/store/checkout/kinguin-place-order";
import prisma from "@/lib/prisma";
import type { KinguinKey, KinguinOrder } from "@/types/kinguin";
import { storeRoutes } from "@/lib/store/navigation";
import {
  completeOrderIfAllKeysDelivered,
  countDeliveredKeysForOrder,
  MANUAL_FULFILLMENT_CUSTOMER_MESSAGE,
  markOrderForManualFulfillment,
  isManualFulfillmentPending,
} from "@/lib/store/checkout/manual-fulfillment";
import {
  getKinguinBalanceCached,
  updateKinguinBalanceCached,
} from "@/lib/kinguin/balance";

export type FulfillKinguinOrderResult = {
  status: "completed" | "processing" | "failed" | "skipped";
  message: string;
  keysDelivered: number;
  kinguinOrderId?: string;
};

const KINGUIN_PLACING_PREFIX = "kinguin:placing:";
const KINGUIN_PLACED_PREFIX = "kinguin:placed:";
const KINGUIN_ERROR_PREFIX = "error:";
/** Tras este tiempo se libera el lock y se puede reintentar (Kinguin-eCommerce-API: pedido puede quedar en `processing`). */
const PLACING_STALE_MS = 45 * 1000;

function cachedFulfillmentError(kinguinStatus: string | null): string | null {
  if (!kinguinStatus?.startsWith(KINGUIN_ERROR_PREFIX)) {
    return null;
  }
  const message = kinguinStatus.slice(KINGUIN_ERROR_PREFIX.length).trim();
  return message.length > 0 ? message : null;
}

async function clearStalePlacingLock(orderId: string): Promise<void> {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      kinguinOrderId: null,
      kinguinStatus: { startsWith: KINGUIN_PLACING_PREFIX },
    },
    data: { kinguinStatus: null },
  });
}

function findOrderItemForKey(
  items: Array<{
    id: string;
    kinguinOfferId: string;
    kinguinProductId: string;
    kinguinId: number;
  }>,
  key: KinguinKey,
) {
  return (
    items.find((item) => item.kinguinOfferId === key.offerId) ??
    items.find((item) => item.kinguinProductId === key.productId) ??
    items.find((item) => item.kinguinId === key.kinguinId)
  );
}

async function countDeliveredKeys(orderId: string): Promise<number> {
  return countDeliveredKeysForOrder(orderId);
}

function isPlacingStatus(status: string | null): boolean {
  return status?.startsWith(KINGUIN_PLACING_PREFIX) ?? false;
}

function placingTimestamp(status: string | null): number | null {
  if (!status || !isPlacingStatus(status)) return null;
  const raw = status.slice(KINGUIN_PLACING_PREFIX.length);
  const ts = Number(raw);
  return Number.isFinite(ts) ? ts : null;
}

async function persistKinguinKeys(
  orderId: string,
  items: Array<{
    id: string;
    kinguinOfferId: string;
    kinguinProductId: string;
    kinguinId: number;
  }>,
  keys: KinguinKey[],
): Promise<number> {
  let delivered = 0;

  for (const key of keys) {
    const item = findOrderItemForKey(items, key);
    if (!item) continue;

    await prisma.orderKey.upsert({
      where: { kinguinKeyId: key.id },
      create: {
        orderItemId: item.id,
        kinguinKeyId: key.id,
        serial: key.serial,
        contentType: key.type,
        status: "DELIVERED",
      },
      update: {
        serial: key.serial,
        contentType: key.type,
        status: "DELIVERED",
      },
    });

    delivered += 1;
  }

  if (delivered > 0) {
    await completeOrderIfAllKeysDelivered(orderId);
  }

  revalidatePath(storeRoutes.orders);
  revalidatePath("/dashboard/orders");

  return delivered;
}

async function syncKinguinOrderToDb(
  orderId: string,
  kinguinOrder: KinguinOrder,
  isPreorder: boolean,
  preorderReleaseAt: Date | null,
) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      kinguinOrderId: kinguinOrder.orderId,
      kinguinStatus: `${KINGUIN_PLACED_PREFIX}${kinguinOrder.status}`,
      isPreorder: kinguinOrder.isPreorder || isPreorder,
      preorderReleaseAt: kinguinOrder.preorderReleaseDate
        ? new Date(kinguinOrder.preorderReleaseDate)
        : preorderReleaseAt,
    },
  });
}

async function syncKeysFromKinguin(
  orderId: string,
  kinguinOrderId: string,
  items: Array<{
    id: string;
    kinguinOfferId: string;
    kinguinProductId: string;
    kinguinId: number;
  }>,
  kinguin: ReturnType<typeof getKinguinSdk>,
  isPreorder: boolean,
): Promise<FulfillKinguinOrderResult> {
  const keys = await kinguin.getOrderKeys(kinguinOrderId);
  const keysDelivered = await persistKinguinKeys(
    orderId,
    items,
    keys.filter((key) => key.serial.trim().length > 0),
  );

  if (keysDelivered > 0) {
    return {
      status: isPreorder ? "processing" : "completed",
      message: isPreorder
        ? "Preventa confirmada. Te avisamos cuando esté la key."
        : "Tus keys están listas abajo.",
      keysDelivered,
      kinguinOrderId,
    };
  }

  return {
    status: "processing",
    message:
      "Tu pago con Flow ya está confirmado. Estamos esperando las keys del proveedor; aparecerán aquí en cuanto estén listas.",
    keysDelivered: 0,
    kinguinOrderId,
  };
}

type FulfillmentOrderItem = OrderItemForKinguin & {
  id: string;
  kinguinId: number;
};

type FulfillmentOrder = {
  id: string;
  status: string;
  kinguinOrderId: string | null;
  kinguinStatus: string | null;
  isPreorder: boolean;
  preorderReleaseAt: Date | null;
  createdAt: Date;
  items: FulfillmentOrderItem[];
};

async function claimKinguinPlacement(
  order: FulfillmentOrder,
): Promise<"claimed" | "busy" | "skip"> {
  if (order.kinguinOrderId) {
    return "skip";
  }

  const placingTs = placingTimestamp(order.kinguinStatus);
  if (placingTs && Date.now() - placingTs < PLACING_STALE_MS) {
    return "busy";
  }

  if (isPlacingStatus(order.kinguinStatus)) {
    await prisma.order.updateMany({
      where: {
        id: order.id,
        kinguinOrderId: null,
        kinguinStatus: { startsWith: KINGUIN_PLACING_PREFIX },
      },
      data: { kinguinStatus: null },
    });
  }

  const claim = await prisma.order.updateMany({
    where: {
      id: order.id,
      kinguinOrderId: null,
      OR: [
        { kinguinStatus: null },
        {
          NOT: { kinguinStatus: { startsWith: KINGUIN_PLACING_PREFIX } },
        },
      ],
    },
    data: {
      kinguinStatus: `${KINGUIN_PLACING_PREFIX}${Date.now()}`,
    },
  });

  return claim.count > 0 ? "claimed" : "busy";
}

async function buildAndPlaceKinguinOrder(
  order: FulfillmentOrder,
  items: FulfillmentOrderItem[],
  kinguin: ReturnType<typeof getKinguinSdk>,
): Promise<FulfillKinguinOrderResult> {
  const kinguinProducts = await buildKinguinPlaceOrderProducts(items, kinguin);

  const totalCostEur = kinguinProducts.reduce(
    (sum, p) => sum + p.price * p.qty,
    0,
  );
  const balance = await getKinguinBalanceCached();

  if (balance < totalCostEur) {
    await markOrderForManualFulfillment(
      order.id,
      "insufficient_balance",
      `(Costo: ${totalCostEur.toFixed(2)} EUR, saldo: ${balance.toFixed(2)} EUR)`,
    );

    return {
      status: "processing",
      message: MANUAL_FULFILLMENT_CUSTOMER_MESSAGE,
      keysDelivered: 0,
    };
  }

  const kinguinOrder = await placeKinguinOrderWithFallback(
    order.id,
    kinguinProducts,
    kinguin,
    order.createdAt,
  );

  // Refresh balance cache in background
  kinguin
    .getBalance()
    .then((balanceRes) => {
      updateKinguinBalanceCached(balanceRes.balance);
    })
    .catch((err) => {
      console.error(
        "Error refreshing balance cache after order placement:",
        err,
      );
    });

  await syncKinguinOrderToDb(
    order.id,
    kinguinOrder,
    order.isPreorder,
    order.preorderReleaseAt,
  );

  return syncKeysFromKinguin(
    order.id,
    kinguinOrder.orderId,
    items,
    kinguin,
    order.isPreorder,
  );
}

export async function fulfillKinguinOrder(
  orderId: string,
): Promise<FulfillKinguinOrderResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          kinguinId: true,
          kinguinProductId: true,
          kinguinOfferId: true,
          quantity: true,
          offer: {
            select: {
              sourceCostPrice: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return {
      status: "failed",
      message: "No encontramos el pedido para completar la entrega.",
      keysDelivered: 0,
    };
  }

  if (order.status !== "PROCESSING" && order.status !== "COMPLETED") {
    return {
      status: "skipped",
      message: "El pedido aún no está listo para la entrega digital.",
      keysDelivered: 0,
    };
  }

  const items = order.items;

  if (items.length === 0) {
    return {
      status: "failed",
      message: "El pedido no tiene productos para entregar.",
      keysDelivered: 0,
    };
  }

  const expectedKeyCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveredKeyCount = await countDeliveredKeys(orderId);

  if (expectedKeyCount > 0 && deliveredKeyCount >= expectedKeyCount) {
    return {
      status: order.isPreorder ? "processing" : "completed",
      message: "Todas las keys ya están entregadas.",
      keysDelivered: deliveredKeyCount,
      kinguinOrderId: order.kinguinOrderId ?? undefined,
    };
  }

  if (
    isManualFulfillmentPending(order.kinguinStatus) &&
    !order.kinguinOrderId
  ) {
    return {
      status: "processing",
      message: MANUAL_FULFILLMENT_CUSTOMER_MESSAGE,
      keysDelivered: 0,
    };
  }

  if (!isKinguinConfigured()) {
    await markOrderForManualFulfillment(order.id, "kinguin_not_configured");

    return {
      status: "processing",
      message: MANUAL_FULFILLMENT_CUSTOMER_MESSAGE,
      keysDelivered: 0,
    };
  }

  const cachedError = cachedFulfillmentError(order.kinguinStatus);
  if (cachedError && !order.kinguinOrderId) {
    return {
      status: "failed",
      message: cachedError,
      keysDelivered: 0,
    };
  }

  const kinguin = getKinguinSdk();

  try {
    if (order.kinguinOrderId) {
      return syncKeysFromKinguin(
        orderId,
        order.kinguinOrderId,
        items,
        kinguin,
        order.isPreorder,
      );
    }

    const claim = await claimKinguinPlacement(order);

    if (claim === "busy") {
      const refreshed = await prisma.order.findUnique({
        where: { id: order.id },
        select: { kinguinOrderId: true, kinguinStatus: true },
      });

      if (refreshed?.kinguinOrderId) {
        return syncKeysFromKinguin(
          orderId,
          refreshed.kinguinOrderId,
          items,
          kinguin,
          order.isPreorder,
        );
      }

      const recovered = await findKinguinOrderByExternalId(
        kinguin,
        order.id,
        order.createdAt,
      );

      if (recovered) {
        await syncKinguinOrderToDb(
          order.id,
          recovered,
          order.isPreorder,
          order.preorderReleaseAt,
        );
        return syncKeysFromKinguin(
          order.id,
          recovered.orderId,
          items,
          kinguin,
          order.isPreorder,
        );
      }

      const placingTs = placingTimestamp(
        refreshed?.kinguinStatus ?? order.kinguinStatus,
      );
      if (placingTs && Date.now() - placingTs >= PLACING_STALE_MS) {
        await clearStalePlacingLock(order.id);
        const retryClaim = await claimKinguinPlacement({
          ...order,
          kinguinStatus: null,
        });
        if (retryClaim === "claimed") {
          return buildAndPlaceKinguinOrder(order, items, kinguin);
        }
      }

      return {
        status: "processing",
        message:
          "Tu pago con Flow ya está confirmado. Estamos obteniendo tus keys del proveedor; aparecerán aquí en cuanto estén listas.",
        keysDelivered: 0,
        kinguinOrderId:
          refreshed?.kinguinOrderId ?? order.kinguinOrderId ?? undefined,
      };
    }

    if (claim === "skip") {
      if (order.kinguinOrderId) {
        return syncKeysFromKinguin(
          orderId,
          order.kinguinOrderId,
          items,
          kinguin,
          order.isPreorder,
        );
      }
    }

    return buildAndPlaceKinguinOrder(order, items, kinguin);
  } catch (error) {
    const message = formatKinguinError(error);

    const recovered = await findKinguinOrderByExternalId(
      kinguin,
      order.id,
      order.createdAt,
    ).catch(() => null);

    if (recovered) {
      await syncKinguinOrderToDb(
        order.id,
        recovered,
        order.isPreorder,
        order.preorderReleaseAt,
      );

      try {
        return await syncKeysFromKinguin(
          orderId,
          recovered.orderId,
          items,
          kinguin,
          order.isPreorder,
        );
      } catch {
        // fall through to error message
      }
    }

    await markOrderForManualFulfillment(
      orderId,
      "kinguin_error",
      message.slice(0, 180),
    );

    return {
      status: "processing",
      message: MANUAL_FULFILLMENT_CUSTOMER_MESSAGE,
      keysDelivered: 0,
      kinguinOrderId: order.kinguinOrderId ?? recovered?.orderId,
    };
  }
}
