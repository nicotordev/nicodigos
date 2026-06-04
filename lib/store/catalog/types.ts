import type { StorefrontProductCard } from "@/lib/store/home/types";

export const CATALOG_PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export type CatalogPageSize = (typeof CATALOG_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_CATALOG_PAGE_SIZE: CatalogPageSize = 24;

export const CATALOG_SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre A–Z" },
] as const;

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number]["value"];

export type CatalogFilters = {
  q: string;
  category: string;
  platform: string;
  genre: string;
  tag: string;
  minPrice: string;
  maxPrice: string;
  offersOnly: boolean;
  preordersOnly: boolean;
  sort: CatalogSort;
  page: number;
  pageSize: CatalogPageSize;
};

export type CatalogFilterOptions = {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  platforms: string[];
  genres: string[];
  tags: string[];
};

export type CatalogPageResult = {
  products: StorefrontProductCard[];
  total: number;
  page: number;
  pageSize: CatalogPageSize;
  totalPages: number;
  filters: CatalogFilters;
};
