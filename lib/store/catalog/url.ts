import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_PAGE_SIZE,
  type CatalogFilters,
  type CatalogPageSize,
  type CatalogSort,
} from "@/lib/store/catalog/types";

const SORT_VALUES = new Set<string>(
  CATALOG_SORT_OPTIONS.map((option) => option.value),
);

const PAGE_SIZE_VALUES = new Set<number>(CATALOG_PAGE_SIZE_OPTIONS);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePageSize(value: string | undefined): CatalogPageSize {
  const parsed = parsePositiveInt(value, DEFAULT_CATALOG_PAGE_SIZE);
  return PAGE_SIZE_VALUES.has(parsed as CatalogPageSize)
    ? (parsed as CatalogPageSize)
    : DEFAULT_CATALOG_PAGE_SIZE;
}

function parseSort(value: string | undefined): CatalogSort {
  if (value && SORT_VALUES.has(value)) {
    return value as CatalogSort;
  }
  return "newest";
}

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const raw = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    q: raw("q")?.trim() ?? "",
    category: raw("category")?.trim() ?? "",
    platform: raw("platform")?.trim() ?? "",
    genre: raw("genero")?.trim() ?? "",
    tag: raw("tag")?.trim() ?? "",
    minPrice: raw("min_precio")?.trim() ?? "",
    maxPrice: raw("max_precio")?.trim() ?? "",
    offersOnly: raw("ofertas") === "1",
    preordersOnly: raw("preventas") === "1",
    sort: parseSort(raw("orden")),
    page: parsePositiveInt(raw("page"), 1),
    pageSize: parsePageSize(raw("tamano")),
  };
}

export function catalogFiltersToQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.platform) {
    params.set("platform", filters.platform);
  }
  if (filters.genre) {
    params.set("genero", filters.genre);
  }
  if (filters.tag) {
    params.set("tag", filters.tag);
  }
  if (filters.minPrice) {
    params.set("min_precio", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.set("max_precio", filters.maxPrice);
  }
  if (filters.offersOnly) {
    params.set("ofertas", "1");
  }
  if (filters.preordersOnly) {
    params.set("preventas", "1");
  }
  if (filters.sort !== "newest") {
    params.set("orden", filters.sort);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize !== DEFAULT_CATALOG_PAGE_SIZE) {
    params.set("tamano", String(filters.pageSize));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function catalogFiltersKey(filters: CatalogFilters): string {
  return JSON.stringify(filters);
}

export function areCatalogFiltersEqual(
  a: CatalogFilters,
  b: CatalogFilters,
): boolean {
  return catalogFiltersKey(a) === catalogFiltersKey(b);
}
