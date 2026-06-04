"use server";

import { buildFlowPaymentRequest } from "@/lib/payments/flow/build-payment-request";
import { isFlowConfigured } from "@/lib/payments/flow/config";
import { getFlowClient } from "@/lib/payments/flow/client";
import { formatFlowError } from "@/lib/payments/flow/errors";
import prisma from "@/lib/prisma";
import { requireStoreUser } from "@/lib/store/auth";
import {
  checkoutBillingSchema,
  sanitizeCheckoutBilling,
  type CheckoutBillingInput,
} from "@/lib/store/checkout/billing";
import { upsertCheckoutBillingAddress } from "@/lib/store/checkout/addresses";
import {
  createOrderFromCart,
  type CheckoutOrderBillingMeta,
} from "@/lib/store/checkout/create-order";
import { persistCheckoutBillingToUser } from "@/lib/store/checkout/persist-billing";
import { storeRoutes } from "@/lib/store/navigation";
import type { StoreActionResult } from "@/lib/store/types";

export async function startFlowCheckoutAction(
  rawBilling: CheckoutBillingInput,
): Promise<StoreActionResult<{ redirectUrl: string; orderId: string }>> {
  const session = await requireStoreUser(storeRoutes.checkout);

  const parsed = checkoutBillingSchema.safeParse(rawBilling);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Revisa los datos de facturación.",
    };
  }

  const billing = sanitizeCheckoutBilling(parsed.data);

  if (!isFlowConfigured()) {
    return {
      success: false,
      error:
        "El pago en línea no está disponible todavía. Contáctanos en contacto@nicodigos.cl.",
    };
  }

  let billingMeta: CheckoutOrderBillingMeta;

  try {
    await persistCheckoutBillingToUser(session.user.id, billing);

    const saved = await upsertCheckoutBillingAddress({
      userId: session.user.id,
      billing,
      addressSelection: billing.addressSelection,
    });
    billingMeta = {
      addressId: saved.addressId,
      addressLabel: saved.label,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo guardar la dirección de facturación.";
    return { success: false, error: message };
  }

  const draft = await createOrderFromCart(
    session.user.id,
    billing,
    billingMeta,
  );

  if ("error" in draft) {
    return { success: false, error: draft.error };
  }

  try {
    const flow = getFlowClient();
    const payment = await flow.payments.create(
      buildFlowPaymentRequest({
        commerceOrder: draft.orderId,
        subject: draft.subject,
        amount: draft.amount,
        email: draft.email,
      }),
    );

    const redirectUrl =
      payment.redirectUrl ||
      `${payment.url}?token=${encodeURIComponent(payment.token)}`;

    return {
      success: true,
      data: {
        redirectUrl,
        orderId: draft.orderId,
      },
    };
  } catch (error) {
    await prisma.order.update({
      where: { id: draft.orderId },
      data: { status: "CANCELED" },
    });

    const message = formatFlowError(error);

    return {
      success: false,
      error: `Flow: ${message}`,
    };
  }
}
