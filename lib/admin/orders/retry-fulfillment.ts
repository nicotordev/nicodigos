"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import { clearManualFulfillmentPending } from "@/lib/store/checkout/manual-fulfillment";
import {
  fulfillKinguinOrder,
  type FulfillKinguinOrderResult,
} from "@/lib/store/checkout/fulfill-kinguin-order";
import prisma from "@/lib/prisma";

export async function retryKinguinFulfillmentAction(
  orderId: string,
): Promise<FulfillKinguinOrderResult> {
  await requireAdmin();

  await clearManualFulfillmentPending(orderId);

  // Limpia errores / cola manual para permitir un nuevo intento de compra.
  await prisma.order.updateMany({
    where: { id: orderId, kinguinOrderId: null },
    data: { kinguinStatus: null },
  });

  const result = await fulfillKinguinOrder(orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/keys");

  return result;
}
