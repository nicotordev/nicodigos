"use server";

import prisma from "@/lib/prisma";
import { getOptionalStoreSession } from "@/lib/store/auth";
import {
  confirmFlowPaymentByToken,
  type FlowPaymentConfirmation,
} from "@/lib/store/checkout/confirm-payment";
import {
  fulfillKinguinOrder,
  type FulfillKinguinOrderResult,
} from "@/lib/store/checkout/fulfill-kinguin-order";
import {
  loadCheckoutReturnKeys,
  type CheckoutReturnKeyItem,
} from "@/lib/store/checkout/return-keys";

export type CheckoutReturnFulfillment = FulfillKinguinOrderResult;

export type CheckoutReturnResult = FlowPaymentConfirmation & {
  fulfillment?: CheckoutReturnFulfillment;
  keys?: CheckoutReturnKeyItem[];
};

async function assertOrderOwned(
  orderId: string,
  userId: string,
): Promise<boolean> {
  const owned = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true },
  });
  return Boolean(owned);
}

/** Solo Flow + keys ya guardadas (rápido; no llama a Kinguin place order). */
export async function confirmCheckoutReturnAction(
  token: string,
): Promise<CheckoutReturnResult> {
  try {
    return await confirmCheckoutReturnActionInner(token);
  } catch (error) {
    console.error("[checkout-return] confirm", error);
    return {
      outcome: "not_found",
      message:
        "No pudimos validar el pago en este momento. Recarga la página en unos segundos.",
    };
  }
}

async function confirmCheckoutReturnActionInner(
  token: string,
): Promise<CheckoutReturnResult> {
  const session = await getOptionalStoreSession();

  if (!session?.user) {
    return {
      outcome: "not_found",
      message: "Inicia sesión para ver el estado de tu pago.",
    };
  }

  const payment = await confirmFlowPaymentByToken(token);

  if (payment.outcome !== "paid" || !payment.orderId) {
    return payment;
  }

  if (!(await assertOrderOwned(payment.orderId, session.user.id))) {
    return {
      outcome: "not_found",
      message: "No encontramos tu pedido.",
    };
  }

  const keys = await loadCheckoutReturnKeys(payment.orderId, session.user.id);

  if (keys.length > 0) {
    return {
      ...payment,
      keys,
      fulfillment: {
        status: "completed",
        message: "Tus keys están listas abajo.",
        keysDelivered: keys.length,
      },
      message:
        keys.length === 1
          ? "Copia tu key abajo y actívala en la plataforma indicada."
          : "Copia tus keys abajo y actívalas en las plataformas indicadas.",
    };
  }

  return {
    ...payment,
    keys: [],
    message: "Pago confirmado. Estamos obteniendo tus keys del proveedor…",
  };
}

/** Kinguin: place order + GET /v2/order/{id}/keys (ver Kinguin-eCommerce-API). */
export async function syncCheckoutReturnDeliveryAction(
  orderId: string,
): Promise<CheckoutReturnResult> {
  try {
    return await syncCheckoutReturnDeliveryActionInner(orderId);
  } catch (error) {
    console.error("[checkout-return] sync delivery", error);
    return {
      outcome: "paid",
      orderId,
      keys: [],
      message:
        "Tu pago está confirmado, pero hubo un problema al contactar al proveedor. Espera un momento o recarga esta página.",
      fulfillment: {
        status: "failed",
        message:
          "No pudimos contactar al proveedor en este momento. Si el problema continúa, escríbenos a soporte con tu número de pedido.",
        keysDelivered: 0,
      },
    };
  }
}

async function syncCheckoutReturnDeliveryActionInner(
  orderId: string,
): Promise<CheckoutReturnResult> {
  const session = await getOptionalStoreSession();

  if (!session?.user) {
    return {
      outcome: "not_found",
      message: "Inicia sesión para ver el estado de tu pago.",
    };
  }

  if (!(await assertOrderOwned(orderId, session.user.id))) {
    return {
      outcome: "not_found",
      message: "No encontramos tu pedido.",
    };
  }

  const fulfillment = await fulfillKinguinOrder(orderId);
  const keys = await loadCheckoutReturnKeys(orderId, session.user.id);

  return {
    outcome: "paid",
    orderId,
    message: buildPaidMessage(
      "Pago confirmado. Estamos obteniendo tus keys del proveedor…",
      fulfillment,
      keys.length,
    ),
    fulfillment,
    keys,
  };
}

/** Compat: confirma Flow y luego entrega Kinguin en una sola llamada. */
export async function processCheckoutReturnAction(
  token: string,
): Promise<CheckoutReturnResult> {
  const confirmed = await confirmCheckoutReturnAction(token);

  if (confirmed.outcome !== "paid" || !confirmed.orderId) {
    return confirmed;
  }

  if ((confirmed.keys?.length ?? 0) > 0) {
    return confirmed;
  }

  return syncCheckoutReturnDeliveryAction(confirmed.orderId);
}

function buildPaidMessage(
  paymentMessage: string,
  fulfillment: FulfillKinguinOrderResult,
  keyCount: number,
): string {
  if (keyCount > 0) {
    return keyCount === 1
      ? "Copia tu key abajo y actívala en la plataforma indicada."
      : "Copia tus keys abajo y actívalas en las plataformas indicadas.";
  }

  if (fulfillment.status === "completed") {
    return fulfillment.message;
  }

  if (fulfillment.status === "processing") {
    return fulfillment.message;
  }

  if (fulfillment.status === "failed") {
    return stripReturnNoise(fulfillment.message);
  }

  return paymentMessage;
}

function stripReturnNoise(message: string): string {
  return message
    .replace(/\s*No recargues esta página[^.]*\.?/gi, "")
    .replace(/\s*revisa Mis pedidos[^.]*\.?/gi, "")
    .replace(/\s*o escríbenos a soporte\.?/gi, "")
    .trim();
}
