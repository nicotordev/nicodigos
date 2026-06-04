import prisma from "@/lib/prisma";

export type CheckoutReturnKeyItem = {
  id: string;
  productName: string;
  serial: string;
  contentType: string;
  activationDetails?: string | null;
};

export async function loadCheckoutReturnKeys(
  orderId: string,
  userId: string,
): Promise<CheckoutReturnKeyItem[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      orderId,
      order: { userId },
    },
    select: {
      name: true,
      product: {
        select: {
          activationDetails: true,
        },
      },
      keys: {
        where: {
          status: "DELIVERED",
          serial: { not: "" },
        },
        select: {
          id: true,
          serial: true,
          contentType: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const keys: CheckoutReturnKeyItem[] = [];

  for (const item of items) {
    for (const key of item.keys) {
      keys.push({
        id: key.id,
        productName: item.name,
        serial: key.serial,
        contentType: key.contentType,
        activationDetails: item.product?.activationDetails ?? null,
      });
    }
  }

  return keys;
}
