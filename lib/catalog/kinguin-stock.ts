import type { KinguinOffer, KinguinProduct } from "@/types/kinguin";

export function getOfferQty(offer: KinguinOffer): number {
  return offer.qty ?? offer.availableQty ?? 0;
}

export function getOfferTextQty(offer: KinguinOffer): number {
  return offer.textQty ?? offer.availableTextQty ?? 0;
}

/** Oferta vendible: stock numérico, texto o preorder. */
export function offerHasStock(offer: KinguinOffer): boolean {
  return (
    getOfferQty(offer) > 0 || getOfferTextQty(offer) > 0 || offer.isPreorder
  );
}

export function pickPrimaryOffer(
  product: KinguinProduct,
): KinguinOffer | undefined {
  const offers = product.offers ?? [];
  if (offers.length === 0) {
    return undefined;
  }

  const cheapestIds = new Set(product.cheapestOfferId ?? []);
  const stockable = offers.filter(offerHasStock);
  const pool = stockable.length > 0 ? stockable : offers;

  return pool.find((offer) => cheapestIds.has(offer.offerId)) ?? pool[0];
}

/** Cantidad del producto según ofertas Kinguin (0 = agotado). */
export function resolveCatalogQty(product: KinguinProduct): number {
  const offers = product.offers ?? [];
  if (offers.length === 0) {
    return 0;
  }

  if (!offers.some(offerHasStock)) {
    return 0;
  }

  const primary = pickPrimaryOffer(product);
  if (!primary) {
    return 0;
  }

  return getOfferQty(primary) || product.totalQty || product.qty || 0;
}

export function productHasStockableOffers(product: KinguinProduct): boolean {
  return (product.offers ?? []).some(offerHasStock);
}
