import { after } from "next/server";
import { NextResponse } from "next/server";

import { processKinguinWebhookEvent } from "@/lib/kinguin/webhook-process";
import {
  getKinguinWebhookSecret,
  normalizeKinguinWebhookEventName,
  parseKinguinWebhookBody,
  verifyKinguinWebhookRequest,
} from "@/lib/kinguin/webhook";
import type { KinguinWebhookEventName } from "@/lib/kinguin/webhook";

export const dynamic = "force-dynamic";

function webhookResponse(status: number): NextResponse {
  return new NextResponse(null, { status });
}

/**
 * Kinguin exige POST + 204 sin cuerpo (Kinguin-eCommerce-API/features/Webhooks.md).
 * El botón "TEST URL" del panel suele enviar solo el secret, sin JSON ni X-Event-Name.
 */
export async function POST(request: Request) {
  if (!getKinguinWebhookSecret()) {
    return webhookResponse(503);
  }

  if (!verifyKinguinWebhookRequest(request)) {
    return webhookResponse(401);
  }

  const eventHeader = request.headers.get("x-event-name");
  const normalized = normalizeKinguinWebhookEventName(eventHeader);
  const rawBody = await request.text();
  const body = parseKinguinWebhookBody(rawBody);

  if (normalized === "probe" || !body) {
    console.info("[kinguin-webhook] probe OK (test URL o cuerpo vacío)");
    return webhookResponse(204);
  }

  if (!normalized) {
    console.warn(
      "[kinguin-webhook] evento desconocido, respondiendo 204:",
      eventHeader,
    );
    return webhookResponse(204);
  }

  const event = normalized as KinguinWebhookEventName;

  after(async () => {
    try {
      await processKinguinWebhookEvent(event, body);
    } catch (error) {
      console.error("[kinguin-webhook] process", event, error);
    }
  });

  return webhookResponse(204);
}
