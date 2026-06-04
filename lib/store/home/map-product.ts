import type { StorefrontProductCard, StorefrontProductOffer } from "./types";
import { getConsumerPrice } from "@/lib/store/products/pricing";

type ProductOfferRow = {
  sellPrice: { toString(): string };
  qty: number;
  isPreorder: boolean;
};

type ProductCardRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  platform: string;
  genres: string[];
  coverImageUrl: string | null;
  sellPrice: { toString(): string };
  costPrice: { toString(): string };
  qty: number;
  isOffer: boolean;
  isPreorder: boolean;
  releaseDate: string | null;
  regionName: string | null;
  languages: string[];
  developers: string[];
  publishers: string[];
  offers: ProductOfferRow[];
};

function pickDefaultOffer(
  offers: ProductOfferRow[],
): StorefrontProductOffer | null {
  if (offers.length === 0) {
    return null;
  }

  const offer = offers[0];
  return {
    sellPrice: getConsumerPrice(offer.sellPrice),
    qty: offer.qty,
    isPreorder: offer.isPreorder,
  };
}

function computeDiscountPercent(
  listPrice: number,
  salePrice: number,
): number | null {
  if (!Number.isFinite(listPrice) || !Number.isFinite(salePrice)) {
    return null;
  }
  if (listPrice <= salePrice || listPrice <= 0) {
    return null;
  }
  return Math.round(((listPrice - salePrice) / listPrice) * 100);
}

export function mapStorefrontProductCard(
  product: ProductCardRow,
): StorefrontProductCard {
  const sellPrice = getConsumerPrice(product.sellPrice);
  const costPrice = Number(product.costPrice.toString());
  const sell = Number(sellPrice);
  const listPrice =
    product.isOffer && costPrice > Number(product.sellPrice.toString()) ? getConsumerPrice(product.costPrice) : null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    platform: product.platform,
    genres: product.genres,
    coverImageUrl: product.coverImageUrl,
    sellPrice,
    listPrice,
    discountPercent: listPrice ? computeDiscountPercent(costPrice, Number(product.sellPrice.toString())) : null,
    qty: product.qty,
    isOffer: product.isOffer,
    isPreorder: product.isPreorder,
    releaseDate: product.releaseDate,
    regionName: product.regionName,
    languages: product.languages,
    developers: product.developers,
    publishers: product.publishers,
    offer: pickDefaultOffer(product.offers),
  };
}
