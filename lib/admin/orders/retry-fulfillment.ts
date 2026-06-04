"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import {
  fulfillKinguinOrder,
  type FulfillKinguinOrderResult,
} from "@/lib/store/checkout/fulfill-kinguin-order";

export async function retryKinguinFulfillmentAction(
  orderId: string,
): Promise<FulfillKinguinOrderResult> {
  await requireAdmin();

  const result = await fulfillKinguinOrder(orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/orders");

  return result;
}
