import "dotenv/config";
import { fulfillKinguinOrder } from "../lib/store/checkout/fulfill-kinguin-order";
import prisma from "../lib/prisma";

async function main() {
  const orderId = "cmpzig324000fpoujcw91w0gn";
  console.log("Running fulfillKinguinOrder for:", orderId);
  const result = await fulfillKinguinOrder(orderId);
  console.log("Result:", result);

  const orderAfter = await prisma.order.findUnique({
    where: { id: orderId },
  });
  console.log("Order state after run:", {
    status: orderAfter?.status,
    kinguinOrderId: orderAfter?.kinguinOrderId,
    kinguinStatus: orderAfter?.kinguinStatus,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
