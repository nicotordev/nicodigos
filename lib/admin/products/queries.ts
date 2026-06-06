import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  AdminProductFilterOptions,
  AdminProductFilters,
} from "@/lib/admin/products/filters";
import type { AdminProductListItem } from "@/lib/admin/products/types";

export type AdminProductsResponse = {
  products: AdminProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    drafts: number;
    lowStock: number;
  };
};

function buildAdminProductWhere(
  filters: Pick<
    AdminProductFilters,
    "search" | "status" | "platform" | "stock" | "flag" | "categoryId"
  >,
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];
  const search = filters.search.trim().toLowerCase();

  if (search) {
    const or: Prisma.ProductWhereInput[] = [
      { name: { contains: search, mode: "insensitive" } },
      { platform: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
    const kinguinIdSearch = parseInt(search, 10);
    if (!Number.isNaN(kinguinIdSearch)) {
      or.push({ kinguinId: kinguinIdSearch });
    }
    and.push({ OR: or });
  }

  if (filters.status === "active") {
    and.push({ isActive: true });
  } else if (filters.status === "draft") {
    and.push({ isActive: false });
  }

  if (filters.platform) {
    and.push({
      platform: { equals: filters.platform, mode: "insensitive" },
    });
  }

  if (filters.stock === "low") {
    and.push({ qty: { lt: 5 } });
  } else if (filters.stock === "out") {
    and.push({ qty: 0 });
  }

  if (filters.flag === "offer") {
    and.push({ isOffer: true });
  } else if (filters.flag === "featured") {
    and.push({ isFeatured: true });
  } else if (filters.flag === "preorder") {
    and.push({ isPreorder: true });
  }

  if (filters.categoryId) {
    and.push({
      categories: { some: { id: filters.categoryId } },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function getAdminProductFilterOptions(): Promise<AdminProductFilterOptions> {
  const [platformRows, categories] = await Promise.all([
    prisma.product.findMany({
      distinct: ["platform"],
      select: { platform: true },
      orderBy: { platform: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    platforms: platformRows.map((row) => row.platform),
    categories,
  };
}

export async function getAdminProducts(
  filters: AdminProductFilters,
  options: { limit?: number } = {},
): Promise<AdminProductsResponse> {
  const page = Math.max(1, filters.page);
  const limit = Math.max(1, options.limit ?? 50);
  const where = buildAdminProductWhere(filters);

  // Get global counts (not filtered by search) for the board overview cards
  const [globalTotal, globalActive, globalLowStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { qty: { lt: 5 } } }),
  ]);
  const globalDrafts = globalTotal - globalActive;

  // Get total count matching search
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * limit;

  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip,
    include: {
      _count: { select: { offers: true } },
    },
  });

  const listItems = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    platform: product.platform,
    qty: product.qty,
    sellPrice: product.sellPrice.toString(),
    costPrice: product.costPrice.toString(),
    sourceCostPrice: product.sourceCostPrice?.toString() ?? null,
    sourceCurrency: product.sourceCurrency,
    isActive: product.isActive,
    isOffer: product.isOffer,
    isFeatured: product.isFeatured,
    isPreorder: product.isPreorder,
    kinguinId: product.kinguinId,
    coverImageUrl: product.coverImageUrl,
    offerCount: product._count.offers,
    updatedAt: product.updatedAt.toISOString(),
    countryLimitations: product.countryLimitations,
  }));

  return {
    products: listItems,
    total,
    page: safePage,
    totalPages,
    stats: {
      total: globalTotal,
      active: globalActive,
      drafts: globalDrafts,
      lowStock: globalLowStock,
    },
  };
}

export async function getImportedKinguinIds(
  kinguinIds: number[],
  productIds: string[],
): Promise<{
  kinguinIds: Set<number>;
  productIds: Set<string>;
  localIdByKinguinProductId: Map<string, string>;
  localIdByKinguinId: Map<number, string>;
}> {
  if (kinguinIds.length === 0 && productIds.length === 0) {
    return {
      kinguinIds: new Set(),
      productIds: new Set(),
      localIdByKinguinProductId: new Map(),
      localIdByKinguinId: new Map(),
    };
  }

  const existing = await prisma.product.findMany({
    where: {
      OR: [
        ...(kinguinIds.length > 0 ? [{ kinguinId: { in: kinguinIds } }] : []),
        ...(productIds.length > 0
          ? [{ kinguinProductId: { in: productIds } }]
          : []),
      ],
    },
    select: { id: true, kinguinId: true, kinguinProductId: true },
  });

  const localIdByKinguinProductId = new Map<string, string>();
  const localIdByKinguinId = new Map<number, string>();

  for (const row of existing) {
    localIdByKinguinProductId.set(row.kinguinProductId, row.id);
    localIdByKinguinId.set(row.kinguinId, row.id);
  }

  return {
    kinguinIds: new Set(existing.map((row) => row.kinguinId)),
    productIds: new Set(existing.map((row) => row.kinguinProductId)),
    localIdByKinguinProductId,
    localIdByKinguinId,
  };
}
