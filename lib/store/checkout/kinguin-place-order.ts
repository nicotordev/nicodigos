import type { Prisma } from "@/lib/generated/prisma/client";
import { getOfferTextQty } from "@/lib/catalog/kinguin-stock";
import type { KinguinSdk } from "@/lib/kinguin/sdk";
import { formatKinguinError } from "@/lib/kinguin/errors";
import { findKinguinOrderByExternalId } from "@/lib/store/checkout/find-kinguin-order";
import type { KinguinOffer, KinguinOrder, KinguinPlaceOrderProductInput } from "@/types/kinguin";
import axios from "axios";

export type OrderItemForKinguin = {
  kinguinProductId: string;
  kinguinOfferId: string;
  quantity: number;
  offer: {
    sourceCostPrice: Prisma.Decimal | null;
  } | null;
};

function pickLiveKinguinOffer(
  offers: KinguinOffer[] | undefined,
  preferredOfferId: string,
  quantity: number,
): KinguinOffer | null {
  if (!offers?.length) return null;

  const hasTextStock = (offer: KinguinOffer) =>
    getOfferTextQty(offer) >= quantity;

  const preferred = offers.find(
    (offer) => offer.offerId === preferredOfferId && hasTextStock(offer),
  );
  if (preferred) return preferred;

  const available = offers
    .filter((offer) => hasTextStock(offer) && offer.price > 0)
    .sort((a, b) => a.price - b.price);

  return available[0] ?? null;
}

/** Kinguin espera precio en EUR; en BD `costPrice` del pedido está en CLP. */
export async function resolveKinguinLineForPlaceOrder(
  item: OrderItemForKinguin & { quantity: number },
  kinguin: KinguinSdk,
): Promise<KinguinPlaceOrderProductInput> {
  try {
    const product = await kinguin.getProduct(item.kinguinProductId);
    const liveOffer = pickLiveKinguinOffer(
      product.offers,
      item.kinguinOfferId,
      item.quantity,
    );

    if (!liveOffer) {
      throw new Error(
        `Sin stock de keys en el proveedor para "${product.name}". Tu pago quedó registrado; te avisaremos cuando haya unidades o gestionamos el reembolso.`,
      );
    }

    return {
      productId: item.kinguinProductId,
      qty: item.quantity,
      price: liveOffer.price,
      offerId: liveOffer.offerId,
      keyType: "text",
    };
  } catch (error) {
    throw new Error(formatKinguinError(error));
  }
}

export async function buildKinguinPlaceOrderProducts(
  items: Array<OrderItemForKinguin & { quantity: number }>,
  kinguin: KinguinSdk,
): Promise<KinguinPlaceOrderProductInput[]> {
  const products: KinguinPlaceOrderProductInput[] = [];

  for (const item of items) {
    products.push(await resolveKinguinLineForPlaceOrder(item, kinguin));
  }

  return products;
}

function isDuplicateExternalIdError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 409) return false;

  const detail = String(
    (error.response.data as { detail?: string })?.detail ?? "",
  ).toLowerCase();

  return detail.includes("already in use") || detail.includes("ya está");
}

/**
 * Crea el pedido en Kinguin. Si la referencia externa ya existe (409), recupera el
 * pedido existente — nunca crea uno nuevo sin referencia (evita cobros duplicados).
 */
export async function placeKinguinOrderWithFallback(
  orderExternalId: string,
  products: KinguinPlaceOrderProductInput[],
  kinguin: KinguinSdk,
  orderCreatedAt?: Date,
): Promise<KinguinOrder> {
  try {
    return await kinguin.placeOrder({ orderExternalId, products });
  } catch (error) {
    if (status422OfferUnavailable(error)) {
      const withoutOfferId = products.map(({ offerId: _o, ...rest }) => rest);
      return kinguin.placeOrder({ orderExternalId, products: withoutOfferId });
    }

    if (isDuplicateExternalIdError(error)) {
      const existing = await findKinguinOrderByExternalId(
        kinguin,
        orderExternalId,
        orderCreatedAt,
      );

      if (existing) {
        return existing;
      }

      throw new Error(
        "El proveedor ya tiene un pedido con esta referencia, pero no pudimos recuperarlo. Revisa Mis pedidos o contacta a soporte con tu número de pedido (no recargues esta página).",
      );
    }

    throw error;
  }
}

function status422OfferUnavailable(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 422;
}
