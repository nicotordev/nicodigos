export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  platform: string;
  qty: number;
  sellPrice: string;
  costPrice: string;
  sourceCostPrice: string | null;
  sourceCurrency: string;
  isActive: boolean;
  isOffer: boolean;
  isFeatured: boolean;
  isPreorder: boolean;
  kinguinId: number;
  coverImageUrl: string | null;
  offerCount: number;
  updatedAt: string;
};

export type KinguinSearchResultItem = {
  kinguinId: number;
  productId: string;
  name: string;
  platform: string;
  price: number;
  qty: number;
  coverImageUrl: string | null;
  isPreorder: boolean;
  alreadyImported: boolean;
  countryLimitations: string[];
};

export type KinguinSearchMode = "api" | "catalog";

export type KinguinSearchPayload = {
  items: KinguinSearchResultItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  fromCache: boolean;
  searchMode: KinguinSearchMode;
  truncated?: boolean;
};

export type BulkKinguinImportItem = {
  productId: string;
  name?: string;
  slug?: string;
};

export type BulkKinguinImportError = {
  id: string;
  name: string;
  error: string;
};

export type BulkKinguinImportSuccess = {
  kinguinProductId: string;
  productId: string;
  slug: string;
};

export type BulkKinguinImportPayload = {
  requestedCount: number;
  successCount: number;
  concurrency: number;
  batchSize: number;
  batchCount: number;
  batchConcurrency: number;
  imported: BulkKinguinImportSuccess[];
  errors: BulkKinguinImportError[];
};

export type AdminProductActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };
