import prisma from "../lib/prisma";

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      kinguinOrderId: true,
      kinguinStatus: true,
      total: true,
      createdAt: true,
      items: {
        select: {
          name: true,
          quantity: true,
          kinguinProductId: true,
        }
      }
    }
  });

  console.log("ALL ORDERS IN DATABASE:");
  console.log(JSON.stringify(orders, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
