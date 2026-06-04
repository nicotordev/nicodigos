import type { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { getStorefrontCategories } from "@/lib/store/categories/queries";
import { mapStorefrontProductCard } from "@/lib/store/home/map-product";
import { storefrontProductCardSelect } from "@/lib/store/product-card-query";
import {
  DEFAULT_CATALOG_PAGE_SIZE,
  type CatalogFilterOptions,
  type CatalogFilters,
  type CatalogPageResult,
  type CatalogSort,
} from "@/lib/store/catalog/types";

const productCardSelect = storefrontProductCardSelect;

function buildCatalogWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (filters.preordersOnly) {
    where.isPreorder = true;
  } else {
    where.qty = { gt: 0 };
  }

  if (filters.offersOnly) {
    where.isOffer = true;
  }

  if (filters.q) {
    where.name = { contains: filters.q, mode: "insensitive" };
  }

  if (filters.platform) {
    where.platform = { equals: filters.platform, mode: "insensitive" };
  }

  if (filters.category) {
    where.categories = { some: { slug: filters.category } };
  }

  if (filters.genre) {
    where.genres = { has: filters.genre };
  }

  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  if (filters.minPrice || filters.maxPrice) {
    const priceFilter: { gte?: number; lte?: number } = {};
    if (filters.minPrice) {
      priceFilter.gte = Number(filters.minPrice);
    }
    if (filters.maxPrice) {
      priceFilter.lte = Number(filters.maxPrice);
    }
    where.sellPrice = priceFilter;
  }

  return where;
}

export function buildCatalogOrderBy(
  sort: CatalogSort,
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ sellPrice: "asc" }];
    case "price_desc":
      return [{ sellPrice: "desc" }];
    case "name_asc":
      return [{ name: "asc" }];
    default:
      return [{ updatedAt: "desc" }];
  }
}

export async function getCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [{ qty: { gt: 0 } }, { isPreorder: true }],
      },
      select: {
        platform: true,
        genres: true,
        tags: true,
      },
    }),
  ]);

  const platforms = Array.from(new Set(products.map((p) => p.platform)))
    .filter(Boolean)
    .sort();
  const genres = Array.from(new Set(products.flatMap((p) => p.genres)))
    .filter(Boolean)
    .sort();
  const tags = Array.from(new Set(products.flatMap((p) => p.tags)))
    .filter(Boolean)
    .sort();

  return {
    categories: categories
      .filter((category) => category.productCount > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category.productCount,
      })),
    platforms,
    genres,
    tags,
  };
}

export async function searchCatalogProducts(
  filters: Partial<CatalogFilters> = {},
): Promise<CatalogPageResult> {
  const resolved: CatalogFilters = {
    q: filters.q ?? "",
    category: filters.category ?? "",
    platform: filters.platform ?? "",
    genre: filters.genre ?? "",
    tag: filters.tag ?? "",
    minPrice: filters.minPrice ?? "",
    maxPrice: filters.maxPrice ?? "",
    offersOnly: filters.offersOnly ?? false,
    preordersOnly: filters.preordersOnly ?? false,
    sort: filters.sort ?? "newest",
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? DEFAULT_CATALOG_PAGE_SIZE,
  };

  const where = buildCatalogWhere(resolved);
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / resolved.pageSize));
  const safePage = Math.min(Math.max(1, resolved.page), totalPages);
  const skip = (safePage - 1) * resolved.pageSize;

  const products = await prisma.product.findMany({
    where,
    orderBy: buildCatalogOrderBy(resolved.sort),
    take: resolved.pageSize,
    skip,
    select: productCardSelect,
  });

  return {
    products: products.map((row) =>
      mapStorefrontProductCard(
        row as Parameters<typeof mapStorefrontProductCard>[0],
      ),
    ),
    total,
    page: safePage,
    pageSize: resolved.pageSize,
    totalPages,
    filters: { ...resolved, page: safePage },
  };
}
