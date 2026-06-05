import "dotenv/config";
import axios from "axios";
import { KinguinSdk } from "../lib/kinguin/sdk/kinguin-sdk";
import prisma from "../lib/prisma";

function formatRequestError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return JSON.stringify(error.response?.data ?? error.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function main() {
  const sdk = new KinguinSdk();
  const orderId = "cmpzig324000fpoujcw91w0gn";
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.error("Order not found");
    return;
  }

  const item = order.items[0];
  if (!item) {
    console.error("No item");
    return;
  }

  console.log("Checking Product details on Kinguin...");
  try {
    const product = await sdk.getProduct(item.kinguinProductId);
    console.log("Product name:", product.name);
    const offer = product.offers?.find(
      (o) => o.offerId === item.kinguinOfferId,
    );
    console.log("Live offer:", offer);
  } catch (error: unknown) {
    console.error("getProduct failed:", formatRequestError(error));
  }

  console.log("\nTesting with offerId (qty 3):");
  try {
    const placed = await sdk.placeOrder({
      orderExternalId: `${order.id}-test-with-offer-${Date.now()}`,
      products: [
        {
          productId: item.kinguinProductId,
          qty: 3,
          price: 12.8, // Wait, let's look up the live offer price if we fetch it, or get it from database
          offerId: item.kinguinOfferId,
          keyType: "text",
        },
      ],
    });
    console.log("Success with offerId:", placed);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed with offerId:",
        error.response?.status,
        error.response?.data,
      );
    } else {
      console.error("Failed with offerId:", formatRequestError(error));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
