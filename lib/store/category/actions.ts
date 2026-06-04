"use server";

import { getStorefrontCategoryProductsPage } from "@/lib/store/categories/queries";
import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
} from "@/lib/store/catalog/types";
import type { StorefrontProductCardsPage } from "@/lib/store/home/types";
import type { CategoryProductsFilters } from "@/lib/store/category/types";

function sanitizeFilters(
  input: CategoryProductsFilters,
): CategoryProductsFilters {
  return {
    sort: CATALOG_SORT_OPTIONS.some((option) => option.value === input.sort)
      ? input.sort
      : "newest",
    page: Math.max(1, Math.floor(input.page) || 1),
    pageSize: CATALOG_PAGE_SIZE_OPTIONS.includes(input.pageSize)
      ? input.pageSize
      : 24,
  };
}

export async function fetchCategoryProductsAction(
  categorySlug: string,
  filters: CategoryProductsFilters,
): Promise<StorefrontProductCardsPage | null> {
  const safe = sanitizeFilters(filters);
  return getStorefrontCategoryProductsPage(categorySlug, safe);
}
