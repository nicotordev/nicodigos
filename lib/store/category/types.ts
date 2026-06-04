import type { CatalogPageSize, CatalogSort } from "@/lib/store/catalog/types";

export type CategoryProductsFilters = {
  sort: CatalogSort;
  page: number;
  pageSize: CatalogPageSize;
};
