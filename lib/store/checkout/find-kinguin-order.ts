import type { KinguinSdk } from "@/lib/kinguin/sdk";
import type { KinguinOrder } from "@/types/kinguin";

function formatKinguinSearchDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Busca un pedido Kinguin ya creado con nuestra referencia externa (evita recompras en 409). */
export async function findKinguinOrderByExternalId(
  kinguin: KinguinSdk,
  orderExternalId: string,
  orderCreatedAt?: Date,
): Promise<KinguinOrder | null> {
  const direct = await kinguin.searchOrders({
    orderExternalId,
    limit: 25,
  });

  const exact = direct.results?.find(
    (order) => order.orderExternalId === orderExternalId,
  );
  if (exact) return exact;

  if (!orderCreatedAt) {
    return null;
  }

  const from = new Date(orderCreatedAt);
  from.setDate(from.getDate() - 1);

  const windowSearch = await kinguin.searchOrders({
    orderExternalId,
    createdAtFrom: formatKinguinSearchDate(from),
    limit: 100,
  });

  return (
    windowSearch.results?.find(
      (order) => order.orderExternalId === orderExternalId,
    ) ?? null
  );
}
