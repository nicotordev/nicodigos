import prisma from "@/lib/prisma";

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  platform: string;
  coverImageUrl: string | null;
  sellPrice: string;
};

export async function getStorefrontProducts(
  limit = 16,
): Promise<StorefrontProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      qty: { gt: 0 },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      platform: true,
      coverImageUrl: true,
      sellPrice: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    platform: product.platform,
    coverImageUrl: product.coverImageUrl,
    sellPrice: product.sellPrice.toString(),
  }));
}
