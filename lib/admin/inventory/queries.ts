import prisma from "@/lib/prisma";
import type { AdminInventoryItem } from "@/lib/admin/inventory/types";

const LOW_STOCK_THRESHOLD = 5;

export async function getAdminLowStockProducts(): Promise<AdminInventoryItem[]> {
  const products = await prisma.product.findMany({
    where: {
      qty: { lt: LOW_STOCK_THRESHOLD },
    },
    orderBy: [{ qty: "asc" }, { name: "asc" }],
    take: 100,
    select: {
      id: true,
      name: true,
      slug: true,
      platform: true,
      qty: true,
      isActive: true,
      sellPrice: true,
      kinguinId: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    platform: product.platform,
    qty: product.qty,
    isActive: product.isActive,
    sellPrice: product.sellPrice.toString(),
    kinguinId: product.kinguinId,
  }));
}

export function getLowStockThreshold(): number {
  return LOW_STOCK_THRESHOLD;
}
