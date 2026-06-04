import "dotenv/config";

import { resolveKinguinLineForPlaceOrder } from "../lib/store/checkout/kinguin-place-order";
import { getKinguinSdk } from "../lib/kinguin/client";
import { formatKinguinError } from "../lib/kinguin/errors";
import prisma from "../lib/prisma";
import type { KinguinKey } from "../types/kinguin";

const orderId = process.argv[2] ?? "cmpzd6xld0001moujyb0gkh3t";

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          id: true,
          kinguinProductId: true,
          kinguinOfferId: true,
          kinguinId: true,
          quantity: true,
          offer: { select: { sourceCostPrice: true } },
        },
      },
    },
  });

  if (!order) {
    console.error("Pedido no encontrado");
    process.exit(1);
  }

  console.log("Pedido", order.id, order.status, order.kinguinOrderId);

  const kinguin = getKinguinSdk();
  const items = order.items;

  try {
    const line = await resolveKinguinLineForPlaceOrder(
      { ...items[0]!, quantity: items[0]!.quantity },
      kinguin,
    );
    console.log("Línea EUR a Kinguin:", line);

    let kinguinOrder;

    try {
      kinguinOrder = await kinguin.placeOrder({
        orderExternalId: order.id,
        products: [line],
      });
    } catch (placeError: unknown) {
      const err = placeError as {
        response?: { status?: number; data?: { detail?: string } };
      };

      if (err.response?.status === 409) {
        console.log("orderExternalId en uso; reintentando sin referencia externa…");
        kinguinOrder = await kinguin.placeOrder({
          products: [line],
        });
      } else {
        throw placeError;
      }
    }

    console.log("Kinguin order:", kinguinOrder.orderId, kinguinOrder.status);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        kinguinOrderId: kinguinOrder.orderId,
        kinguinStatus: kinguinOrder.status,
      },
    });

    const keys = await kinguin.getOrderKeys(kinguinOrder.orderId);
    console.log("Keys recibidas:", keys.length);

    for (const key of keys.filter((k) => k.serial.trim())) {
      const item =
        items.find((i) => i.kinguinOfferId === key.offerId) ??
        items.find((i) => i.kinguinProductId === key.productId) ??
        items.find((i) => i.kinguinId === key.kinguinId);

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
      console.log("Key guardada para item", item.id);
    }

    if (keys.some((k) => k.serial.trim())) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });
      console.log("Pedido marcado COMPLETED");
    }
  } catch (error) {
    console.error("Error:", formatKinguinError(error));
    process.exit(1);
  }

  await prisma.$disconnect();
}

main();
