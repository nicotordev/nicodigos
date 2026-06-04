import type { KinguinOrderStatus } from "@/types/kinguin";

/** Valores de `X-Event-Name` (Kinguin-eCommerce-API/features/Webhooks.md + panel legacy). */
export type KinguinWebhookEventName =
  | "product.update"
  | "order.status"
  | "order.complete";

export type KinguinOrderStatusWebhookPayload = {
  orderId: string;
  orderExternalId?: string;
  status: KinguinOrderStatus | string;
  updatedAt?: string;
};

export type KinguinProductUpdateWebhookPayload = {
  kinguinId: number;
  productId: string;
  qty?: number;
  textQty?: number;
  cheapestOfferId?: string[];
  updatedAt?: string;
};

export function getKinguinWebhookSecret(): string | null {
  const secret = process.env.KINGUIN_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return null;
  }
  return secret.replace(/^["']|["']$/g, "");
}

export function verifyKinguinWebhookRequest(request: Request): boolean {
  const secret = getKinguinWebhookSecret();
  if (!secret) {
    return false;
  }

  const headerSecret = request.headers.get("x-event-secret")?.trim();
  return headerSecret === secret;
}

export function normalizeKinguinWebhookEventName(
  header: string | null,
): KinguinWebhookEventName | "probe" | null {
  const name = header?.trim().toLowerCase() ?? "";
  if (!name) {
    return "probe";
  }
  if (name === "product.update") {
    return "product.update";
  }
  if (name === "order.status" || name === "order.complete") {
    return name === "order.complete" ? "order.complete" : "order.status";
  }
  return null;
}

export function parseKinguinWebhookBody(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

export function parseKinguinOrderStatusPayload(
  body: unknown,
  event: KinguinWebhookEventName,
): KinguinOrderStatusWebhookPayload | null {
  if (!body || typeof body !== "object") {
    if (event === "order.complete") {
      return null;
    }
    return null;
  }

  const record = body as Record<string, unknown>;
  const orderId = String(record.orderId ?? "").trim();
  if (!orderId) {
    return null;
  }

  const status =
    event === "order.complete"
      ? "completed"
      : String(record.status ?? "").trim() || "processing";

  return {
    orderId,
    orderExternalId: String(record.orderExternalId ?? "").trim() || undefined,
    status,
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
}

export function parseKinguinProductUpdatePayload(
  body: unknown,
): KinguinProductUpdateWebhookPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const productId = String(record.productId ?? "").trim();
  const kinguinId = Number(record.kinguinId);

  if (!productId || !Number.isFinite(kinguinId)) {
    return null;
  }

  return {
    kinguinId,
    productId,
    qty: typeof record.qty === "number" ? record.qty : undefined,
    textQty: typeof record.textQty === "number" ? record.textQty : undefined,
    cheapestOfferId: Array.isArray(record.cheapestOfferId)
      ? record.cheapestOfferId.map(String)
      : undefined,
    updatedAt:
      typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
}
