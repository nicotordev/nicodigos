import "dotenv/config";

import { fulfillKinguinOrder } from "../lib/store/checkout/fulfill-kinguin-order";
import { getKinguinSdk } from "../lib/kinguin/client";
import prisma from "../lib/prisma";

const orderId = process.argv[2] ?? "cmpzd6xld0001moujyb0gkh3t";

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  console.log("Order:", order?.id, order?.status, order?.kinguinOrderId);

  if (!order?.items[0]) {
    process.exit(1);
  }

  const item = order.items[0];
  console.log("Item cost/sell:", item.unitCostPrice, item.unitSellPrice);
  console.log("Kinguin IDs:", item.kinguinProductId, item.kinguinOfferId);

  const kinguin = getKinguinSdk();

  try {
    const balance = await kinguin.getBalance();
    console.log("Balance:", balance);
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error("Balance error:", err.response?.data ?? err.message);
  }

  try {
    const product = await kinguin.getProduct(item.kinguinProductId);
    const offer = product.offers?.find((o) => o.offerId === item.kinguinOfferId);
    console.log("Live offer price/qty:", offer?.price, offer?.qty);
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error("Product error:", err.response?.data ?? err.message);
  }

  try {
    const placed = await kinguin.placeOrder({
      orderExternalId: `${order.id}-debug-${Date.now()}`,
      products: [
        {
          productId: item.kinguinProductId,
          qty: item.quantity,
          price: Number(item.unitCostPrice.toString()),
          offerId: item.kinguinOfferId,
          keyType: "text",
        },
      ],
    });
    console.log("placeOrder OK:", placed.orderId, placed.status);
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("placeOrder error:", err.response?.status, JSON.stringify(err.response?.data, null, 2) ?? err.message);
  }

  const result = await fulfillKinguinOrder(orderId);
  console.log("fulfillKinguinOrder:", result);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
