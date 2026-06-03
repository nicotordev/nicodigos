"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { syncTransactionsFromOrders } from "@/lib/transactions/sync-from-orders";

export type TransactionActionResult =
  | {
      success: true;
      message: string;
      chargesCreated: number;
      refundsCreated: number;
    }
  | { success: false; error: string };

export async function syncTransactionsFromOrdersAction(): Promise<TransactionActionResult> {
  await requireAdmin();

  try {
    const result = await syncTransactionsFromOrders();

    revalidatePath("/admin/transactions");
    revalidatePath("/admin/orders");

    const parts: string[] = [];
    if (result.chargesCreated > 0) {
      parts.push(`${result.chargesCreated} cobro(s)`);
    }
    if (result.refundsCreated > 0) {
      parts.push(`${result.refundsCreated} reembolso(s)`);
    }
    const message =
      parts.length > 0
        ? `Sincronizado: ${parts.join(", ")}.`
        : "No había pedidos pendientes de registrar.";

    return {
      success: true,
      message,
      chargesCreated: result.chargesCreated,
      refundsCreated: result.refundsCreated,
    };
  } catch {
    return {
      success: false,
      error: "No se pudo sincronizar transacciones desde pedidos.",
    };
  }
}
