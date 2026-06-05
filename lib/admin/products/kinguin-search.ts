import { getCachedJson, setCachedJson } from "@/lib/redis/cache";
import {
  formatKinguinError,
  isKinguinSandbox,
  isRetryableKinguinNameSearchError,
} from "@/lib/kinguin/errors";
import { getKinguinSdk } from "@/lib/kinguin/client";
import type { KinguinSdk } from "@/lib/kinguin/sdk";
import type {
  KinguinProduct,
  KinguinProductSearchParams,
} from "@/types/kinguin";

/** Kinguin max per page (GET /v1/products — page & limit, item_count). */
export const KINGUIN_API_PAGE_SIZE_MAX = 100;
export const KINGUIN_SEARCH_DEFAULT_LIMIT = 25;
/** Cap in-memory catalog filter to avoid OOM on broad terms like "steam". */
export const KINGUIN_CATALOG_FILTER_MAX = 1000;
const CATALOG_FETCH_MAX_PAGES = 50;
const SEARCH_CACHE_TTL_SECONDS = 15 * 60;
const CATALOG_CACHE_TTL_SECONDS = 60 * 60;
const SEARCH_CACHE_KEY_PREFIX = "kinguin:search:v3:";
const CATALOG_FILTER_CACHE_PREFIX = "kinguin:search-filter:v1:";
const CATALOG_CACHE_KEY = "kinguin:catalog:v2";

export type KinguinSearchMode = "api" | "catalog";

export type KinguinSearchOptions = {
  page?: number;
  limit?: number;
};

export type KinguinSearchResult = {
  products: KinguinProduct[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  fromCache: boolean;
  searchMode: KinguinSearchMode;
  truncated?: boolean;
};

function normalizeSearchQuery(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function searchPageCacheKey(
  name: string,
  page: number,
  limit: number,
  mode: KinguinSearchMode,
): string {
  return `${SEARCH_CACHE_KEY_PREFIX}${mode}:${normalizeSearchQuery(name)}:p${page}:l${limit}`;
}

function catalogFilterCacheKey(name: string): string {
  return `${CATALOG_FILTER_CACHE_PREFIX}${normalizeSearchQuery(name)}`;
}

/** Kinguin pagination can return the same productId more than once. */
function dedupeKinguinProducts(products: KinguinProduct[]): KinguinProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product.productId || String(product.kinguinId);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function matchesProductQuery(product: KinguinProduct, query: string): boolean {
  const haystack =
    `${product.name} ${product.originalName ?? ""}`.toLowerCase();
  const terms = normalizeSearchQuery(query).split(" ").filter(Boolean);

  return terms.every((term) => haystack.includes(term));
}

async function fetchCatalogPages(
  kinguin: KinguinSdk,
  params: Omit<KinguinProductSearchParams, "page" | "limit"> = {},
): Promise<KinguinProduct[]> {
  const all: KinguinProduct[] = [];
  let page = 1;

  while (page <= CATALOG_FETCH_MAX_PAGES) {
    const response = await kinguin.searchProducts({
      ...params,
      limit: KINGUIN_API_PAGE_SIZE_MAX,
      page,
    });

    const batch = response.results ?? [];
    all.push(...batch);

    if (batch.length === 0 || batch.length < KINGUIN_API_PAGE_SIZE_MAX) {
      break;
    }

    page += 1;
  }

  return dedupeKinguinProducts(all);
}

async function fetchFullCatalog(
  kinguin: KinguinSdk,
): Promise<KinguinProduct[]> {
  const cached = await getCachedJson<KinguinProduct[]>(CATALOG_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const catalog = await fetchCatalogPages(kinguin);
  await setCachedJson(CATALOG_CACHE_KEY, catalog, CATALOG_CACHE_TTL_SECONDS);

  return catalog;
}

type CatalogFilterCache = {
  products: KinguinProduct[];
  total: number;
  truncated: boolean;
};

async function getCatalogFilteredProducts(
  kinguin: KinguinSdk,
  name: string,
): Promise<CatalogFilterCache> {
  const cacheKey = catalogFilterCacheKey(name);
  const cached = await getCachedJson<CatalogFilterCache>(cacheKey);
  if (cached) {
    return cached;
  }

  const catalog = await fetchFullCatalog(kinguin);
  const filtered = catalog.filter((product) =>
    matchesProductQuery(product, name),
  );
  const truncated = filtered.length > KINGUIN_CATALOG_FILTER_MAX;
  const payload: CatalogFilterCache = {
    products: filtered.slice(0, KINGUIN_CATALOG_FILTER_MAX),
    total: filtered.length,
    truncated,
  };

  await setCachedJson(cacheKey, payload, SEARCH_CACHE_TTL_SECONDS);
  return payload;
}

/**
 * Kinguin sandbox returns HTTP 500 for any valid `name` query (verified with curl/fetch/axios).
 * Production supports `name` with `page` + `limit` and `item_count` for pagination.
 */
async function searchByNameViaApi(
  kinguin: KinguinSdk,
  name: string,
  page: number,
  limit: number,
): Promise<KinguinSearchResult | null> {
  if (isKinguinSandbox()) {
    return null;
  }

  const trimmed = name.trim();
  const cacheKey = searchPageCacheKey(trimmed, page, limit, "api");
  const cached = await getCachedJson<KinguinSearchResult>(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  try {
    const response = await kinguin.searchProducts({
      name: trimmed,
      page,
      limit,
    });

    const products = dedupeKinguinProducts(response.results ?? []);
    const total = response.item_count ?? products.length;
    const result: KinguinSearchResult = {
      products,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      limit,
      fromCache: false,
      searchMode: "api",
    };

    await setCachedJson(cacheKey, result, SEARCH_CACHE_TTL_SECONDS);
    return result;
  } catch (error) {
    if (isRetryableKinguinNameSearchError(error)) {
      return null;
    }
    throw error;
  }
}

async function searchByCatalogFilter(
  kinguin: KinguinSdk,
  name: string,
  page: number,
  limit: number,
): Promise<KinguinSearchResult> {
  const cacheKey = searchPageCacheKey(name, page, limit, "catalog");
  const cached = await getCachedJson<KinguinSearchResult>(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const {
    products: filtered,
    total,
    truncated,
  } = await getCatalogFilteredProducts(kinguin, name);
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit);

  const result: KinguinSearchResult = {
    products,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    limit,
    fromCache: false,
    searchMode: "catalog",
    truncated,
  };

  await setCachedJson(cacheKey, result, SEARCH_CACHE_TTL_SECONDS);
  return result;
}

export async function searchKinguinProductsByName(
  name: string,
  options: KinguinSearchOptions = {},
  kinguin: KinguinSdk = getKinguinSdk(),
): Promise<KinguinSearchResult> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(
    KINGUIN_API_PAGE_SIZE_MAX,
    Math.max(1, options.limit ?? KINGUIN_SEARCH_DEFAULT_LIMIT),
  );

  let apiResult = await searchByNameViaApi(kinguin, name, page, limit);

  if (apiResult !== null) {
    return apiResult;
  }

  return searchByCatalogFilter(kinguin, name, page, limit);
}

/** @deprecated Use searchKinguinProductsByName — kept for scripts. */
export async function fetchAllKinguinProductsByName(
  name: string,
  kinguin: KinguinSdk = getKinguinSdk(),
): Promise<{
  products: KinguinProduct[];
  fromCache: boolean;
  searchMode: KinguinSearchMode;
}> {
  const result = await searchKinguinProductsByName(
    name,
    { page: 1, limit: KINGUIN_API_PAGE_SIZE_MAX },
    kinguin,
  );

  return {
    products: result.products,
    fromCache: result.fromCache,
    searchMode: result.searchMode,
  };
}

export { formatKinguinError };
