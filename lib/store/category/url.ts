import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
  DEFAULT_CATALOG_PAGE_SIZE,
  type CatalogPageSize,
  type CatalogSort,
} from "@/lib/store/catalog/types";
import type { CategoryProductsFilters } from "@/lib/store/category/types";

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

export function parseCategorySearchParams(
  params: Record<string, string | string[] | undefined>,
): CategoryProductsFilters {
  const raw = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    sort: parseSort(raw("orden")),
    page: parsePositiveInt(raw("page"), 1),
    pageSize: parsePageSize(raw("tamano")),
  };
}

export function categoryFiltersToQueryString(
  filters: CategoryProductsFilters,
): string {
  const params = new URLSearchParams();

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

export function categoryFiltersKey(filters: CategoryProductsFilters): string {
  return [filters.sort, filters.page, filters.pageSize].join("|");
}

export function areCategoryFiltersEqual(
  a: CategoryProductsFilters,
  b: CategoryProductsFilters,
): boolean {
  return categoryFiltersKey(a) === categoryFiltersKey(b);
}
