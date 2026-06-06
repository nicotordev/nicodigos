import "server-only";

import { getAdminNotificationEmails } from "@/lib/admin/notifications/get-admin-emails";
import {
  getManualFulfillmentAdminNote,
  type ManualFulfillmentReason,
} from "@/lib/store/checkout/manual-fulfillment";
import { getResend } from "@/lib/resend";
import { formatMoney } from "@/lib/currency/format";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAppBaseUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export type ManualFulfillmentAdminAlertInput = {
  orderId: string;
  reason: ManualFulfillmentReason;
  detail?: string;
  customerName: string;
  customerEmail: string;
  total: string;
  currency: string;
  items: Array<{ name: string; quantity: number }>;
};

export async function sendManualFulfillmentAdminAlert(
  input: ManualFulfillmentAdminAlertInput,
): Promise<void> {
  const recipients = await getAdminNotificationEmails();
  if (recipients.length === 0) {
    console.warn(
      "[manual-fulfillment] No hay correos de admin configurados (ADMIN_EMAILS o usuarios ADMIN).",
    );
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[manual-fulfillment] RESEND_API_KEY no configurada; no se envió alerta al admin.",
    );
    return;
  }

  const shortId = input.orderId.slice(0, 8);
  const adminUrl = `${getAppBaseUrl()}/admin/orders/${input.orderId}`;
  const reasonNote = getManualFulfillmentAdminNote(
    `kinguin:manual:pending:${input.reason}${input.detail ? `|${input.detail}` : ""}`,
  );
  const itemList =
    input.items.length > 0
      ? `<ul>${input.items.map((item) => `<li>${escapeHtml(item.name)} × ${item.quantity}</li>`).join("")}</ul>`
      : "<p>Sin ítems.</p>";

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#171717;max-width:640px;margin:0 auto;padding:24px;">
      <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e5e5;">
        <strong style="font-size:18px;color:#c2410c;">nicodigos · Admin</strong>
      </div>
      <p><strong>Entrega manual requerida</strong></p>
      <p>El pedido <strong>#${escapeHtml(shortId)}</strong> no pudo auto-entregarse en Kinguin.</p>
      <p style="color:#92400e;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;">
        ${escapeHtml(reasonNote ?? "Pendiente de entrega manual.")}
      </p>
      <p><strong>Cliente:</strong> ${escapeHtml(input.customerName)} (${escapeHtml(input.customerEmail)})</p>
      <p><strong>Total:</strong> ${escapeHtml(formatMoney(input.total, input.currency))}</p>
      <p><strong>Productos:</strong></p>
      ${itemList}
      <p style="margin-top:24px;">
        <a href="${adminUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c2410c;color:#fff;text-decoration:none;font-weight:600;">
          Abrir pedido en admin
        </a>
      </p>
    </div>
  `.trim();

  await getResend().emails.send({
    from: process.env.EMAIL_FROM ?? "nicodigos <onboarding@resend.dev>",
    to: recipients,
    subject: `[Admin] Entrega manual · pedido #${shortId}`,
    html,
  });
}
