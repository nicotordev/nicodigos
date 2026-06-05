export type AdminProductStatusFilter = "all" | "active" | "draft";
export type AdminProductStockFilter = "all" | "low" | "out";
export type AdminProductFlagFilter = "all" | "offer" | "featured" | "preorder";

export type AdminProductFilters = {
  page: number;
  search: string;
  status: AdminProductStatusFilter;
  platform: string;
  stock: AdminProductStockFilter;
  flag: AdminProductFlagFilter;
  categoryId: string;
};

export type AdminProductFilterOptions = {
  platforms: string[];
  categories: { id: string; name: string }[];
};

const STATUS_VALUES = new Set<AdminProductStatusFilter>([
  "all",
  "active",
  "draft",
]);
const STOCK_VALUES = new Set<AdminProductStockFilter>(["all", "low", "out"]);
const FLAG_VALUES = new Set<AdminProductFlagFilter>([
  "all",
  "offer",
  "featured",
  "preorder",
]);

export function parseAdminProductFilters(
  params: Record<string, string | undefined>,
): AdminProductFilters {
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search?.trim() ?? "";

  const status = STATUS_VALUES.has(params.status as AdminProductStatusFilter)
    ? (params.status as AdminProductStatusFilter)
    : "all";

  const stock = STOCK_VALUES.has(params.stock as AdminProductStockFilter)
    ? (params.stock as AdminProductStockFilter)
    : "all";

  const flag = FLAG_VALUES.has(params.flag as AdminProductFlagFilter)
    ? (params.flag as AdminProductFlagFilter)
    : "all";

  return {
    page,
    search,
    status,
    platform: params.platform?.trim() ?? "",
    stock,
    flag,
    categoryId: params.category?.trim() ?? "",
  };
}

export function hasActiveAdminProductFilters(
  filters: AdminProductFilters,
): boolean {
  return (
    filters.search.length > 0 ||
    filters.status !== "all" ||
    filters.platform.length > 0 ||
    filters.stock !== "all" ||
    filters.flag !== "all" ||
    filters.categoryId.length > 0
  );
}

export function buildAdminProductsSearchParams(
  current: AdminProductFilters,
  patch: Partial<AdminProductFilters>,
): URLSearchParams {
  const next: AdminProductFilters = { ...current, ...patch };
  const params = new URLSearchParams();

  if (next.search) {
    params.set("search", next.search);
  }
  if (next.status !== "all") {
    params.set("status", next.status);
  }
  if (next.platform) {
    params.set("platform", next.platform);
  }
  if (next.stock !== "all") {
    params.set("stock", next.stock);
  }
  if (next.flag !== "all") {
    params.set("flag", next.flag);
  }
  if (next.categoryId) {
    params.set("category", next.categoryId);
  }
  if (next.page > 1) {
    params.set("page", next.page.toString());
  }

  return params;
}
