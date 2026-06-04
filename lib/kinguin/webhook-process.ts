import {
  parseKinguinOrderStatusPayload,
  parseKinguinProductUpdatePayload,
  type KinguinWebhookEventName,
} from "@/lib/kinguin/webhook";
import {
  handleKinguinOrderStatusWebhook,
  handleKinguinProductUpdateWebhook,
} from "@/lib/kinguin/webhook-handlers";

export async function processKinguinWebhookEvent(
  event: KinguinWebhookEventName,
  body: unknown,
): Promise<void> {
  if (event === "order.status" || event === "order.complete") {
    const payload = parseKinguinOrderStatusPayload(body, event);
    if (!payload) {
      console.warn("[kinguin-webhook] payload order inválido:", event);
      return;
    }
    await handleKinguinOrderStatusWebhook(payload);
    return;
  }

  const payload = parseKinguinProductUpdatePayload(body);
  if (!payload) {
    console.warn("[kinguin-webhook] payload product.update inválido");
    return;
  }
  await handleKinguinProductUpdateWebhook(payload);
}
