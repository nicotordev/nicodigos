import prisma from "@/lib/prisma";
import type {
  AdminCategoryEditData,
  AdminCategoryListItem,
} from "@/lib/admin/categories/types";

export async function getAdminCategories(): Promise<AdminCategoryListItem[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    bannerUrl: category.bannerUrl,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
    createdAt: category.createdAt.toISOString(),
  }));
}

export async function getAdminCategoryForEdit(
  id: string,
): Promise<AdminCategoryEditData | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    bannerUrl: category.bannerUrl,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  };
}
