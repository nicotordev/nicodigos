import prisma from "../lib/prisma";

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
  });

  const matching = orders.find(o => o.id.endsWith("cw91w0gn") || o.id.toUpperCase().endsWith("CW91W0GN"));

  if (!matching) {
    console.error("Order not found. All orders list:", orders.map(o => o.id));
    return;
  }

  console.log("MATCHING ORDER DETAILED STATE:");
  console.log(JSON.stringify(matching, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
