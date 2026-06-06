export type SortValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "offers";

export type ProductCardImage = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  isCover: boolean;
};

export type CategoryProduct = {
  id: string;
  slug: string;
  name: string;
  originalName: string | null;
  platform: string;
  genres: string[];
  coverImageUrl: string | null;
  sellPrice: number;
  qty: number;
  isOffer: boolean;
  isFeatured: boolean;
  isPreorder: boolean;
  regionName: string | null;
  regionalLimitations: string | null;
  countryLimitations: string[];
  images: ProductCardImage[];
};

export type CategoryViewModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
};
