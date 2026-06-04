"use server";

import { searchCatalogProducts } from "@/lib/store/catalog/queries";
import type {
  CatalogFilters,
  CatalogPageResult,
} from "@/lib/store/catalog/types";
import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
} from "@/lib/store/catalog/types";

function sanitizeFilters(input: CatalogFilters): CatalogFilters {
  return {
    q: input.q?.slice(0, 120).trim() ?? "",
    category: input.category?.slice(0, 80).trim() ?? "",
    platform: input.platform?.slice(0, 80).trim() ?? "",
    genre: input.genre?.slice(0, 80).trim() ?? "",
    tag: input.tag?.slice(0, 80).trim() ?? "",
    minPrice: input.minPrice?.slice(0, 10).trim() ?? "",
    maxPrice: input.maxPrice?.slice(0, 10).trim() ?? "",
    offersOnly: Boolean(input.offersOnly),
    preordersOnly: Boolean(input.preordersOnly),
    sort: CATALOG_SORT_OPTIONS.some((option) => option.value === input.sort)
      ? input.sort
      : "newest",
    page: Math.max(1, Math.floor(input.page) || 1),
    pageSize: CATALOG_PAGE_SIZE_OPTIONS.includes(input.pageSize)
      ? input.pageSize
      : 24,
  };
}

export async function fetchCatalogAction(
  filters: CatalogFilters,
): Promise<CatalogPageResult> {
  return searchCatalogProducts(sanitizeFilters(filters));
}
