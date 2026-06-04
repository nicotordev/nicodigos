import type { FlowPaymentOutcome } from "@/lib/store/checkout/confirm-payment";
import type { CheckoutReturnResult } from "@/lib/store/checkout/return-actions";

export type CheckoutReturnPhase =
  | "missing_token"
  | "confirming_payment"
  | "fulfilling_order"
  | "done";

export const checkoutReturnPhaseLabels: Record<CheckoutReturnPhase, string> = {
  missing_token: "Revisando enlace de pago…",
  confirming_payment: "Confirmando tu pago con Flow…",
  fulfilling_order: "Preparando tus keys digitales…",
  done: "Listo",
};

export type CheckoutReturnAccent = "emerald" | "amber" | "rose";

export type CheckoutReturnVariant = "success" | "waiting" | "error";

export type CheckoutReturnDeliveryHint =
  | "keys_ready"
  | "in_progress"
  | "delivery_issue";

export type CheckoutReturnPresentation = {
  title: string;
  accent: CheckoutReturnAccent;
  variant: CheckoutReturnVariant;
  deliveryHint: CheckoutReturnDeliveryHint | null;
  showKeys: boolean;
  showOrdersLink: boolean;
  showSupportLink: boolean;
  pollForKeys: boolean;
};

export function formatCheckoutOrderRef(orderId: string): string {
  return `#${orderId.slice(-8).toUpperCase()}`;
}

export function hasCheckoutReturnKeys(result: CheckoutReturnResult): boolean {
  return (result.keys?.length ?? 0) > 0;
}

export function getOutcomeTitle(outcome: FlowPaymentOutcome): string {
  switch (outcome) {
    case "paid":
      return "¡Pago confirmado!";
    case "pending":
      return "Pago pendiente";
    case "rejected":
    case "canceled":
      return "Pago no completado";
    case "misconfigured":
      return "Pago no disponible";
    default:
      return "No pudimos verificar el pago";
  }
}

export function getCheckoutReturnPresentation(
  result: CheckoutReturnResult,
): CheckoutReturnPresentation {
  if (result.outcome !== "paid") {
    const isPending = result.outcome === "pending";

    return {
      title: getOutcomeTitle(result.outcome),
      accent: isPending ? "amber" : "rose",
      variant: isPending ? "waiting" : "error",
      deliveryHint: null,
      showKeys: false,
      showOrdersLink: false,
      showSupportLink: result.outcome === "not_found",
      pollForKeys: false,
    };
  }

  if (hasCheckoutReturnKeys(result)) {
    return {
      title: "¡Tus keys están listas!",
      accent: "emerald",
      variant: "success",
      deliveryHint: null,
      showKeys: true,
      showOrdersLink: true,
      showSupportLink: false,
      pollForKeys: false,
    };
  }

  const fulfillment = result.fulfillment;

  if (fulfillment?.status === "failed") {
    return {
      title: "Entrega no disponible",
      accent: "rose",
      variant: "error",
      deliveryHint: null,
      showKeys: false,
      showOrdersLink: false,
      showSupportLink: true,
      pollForKeys: false,
    };
  }

  if (fulfillment?.status === "processing") {
    return {
      title: "Preparando tus keys",
      accent: "amber",
      variant: "waiting",
      deliveryHint: "in_progress",
      showKeys: false,
      showOrdersLink: false,
      showSupportLink: false,
      pollForKeys: true,
    };
  }

  if (fulfillment?.status === "completed") {
    return {
      title: "Preparando tus keys",
      accent: "amber",
      variant: "waiting",
      deliveryHint: "in_progress",
      showKeys: false,
      showOrdersLink: false,
      showSupportLink: false,
      pollForKeys: true,
    };
  }

  return {
    title: "Preparando tu pedido",
    accent: "amber",
    variant: "waiting",
    deliveryHint: "in_progress",
    showKeys: false,
    showOrdersLink: false,
    showSupportLink: false,
    pollForKeys: true,
  };
}

export const checkoutReturnDeliveryCopy: Record<
  CheckoutReturnDeliveryHint,
  { heading: string; body: string }
> = {
  keys_ready: {
    heading: "Listo para activar",
    body: "Copia cada key abajo. Guárdalas en un lugar seguro; también quedarán en Mis pedidos cuando quieras revisarlas.",
  },
  in_progress: {
    heading: "Un momento más",
    body: "Tu pago en Flow ya está confirmado. En cuanto el proveedor libere las keys, aparecerán aquí mismo — no hace falta ir a otra página.",
  },
  delivery_issue: {
    heading: "Qué sigue",
    body: "Tu pago quedó registrado. Si el producto no tiene stock en el proveedor, te contactaremos para reembolso o alternativa. Escríbenos a Soporte con tu número de pedido.",
  },
};
