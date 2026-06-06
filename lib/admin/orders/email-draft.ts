import { formatMoney, formatOrderStatus } from "@/lib/admin/format";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getAppBaseUrlForEmail(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function buildOrderEmailDraft(order: AdminOrderDetail): {
  to: string;
  subject: string;
  htmlBody: string;
} {
  const shortId = order.id.slice(0, 8);
  const ordersUrl = `${getAppBaseUrlForEmail()}/dashboard/orders`;
  const recipient = order.billing.email.trim() || order.customer.email;
  const itemList =
    order.items.length > 0
      ? `<ul>${order.items.map((item) => `<li>${escapeHtml(item.name)} × ${item.quantity}</li>`).join("")}</ul>`
      : "<p>Sin ítems registrados.</p>";

  return {
    to: recipient,
    subject: `Actualización de tu pedido #${shortId} — nicodigos`,
    htmlBody: `
      <p>Hola ${escapeHtml(order.customer.name)},</p>
      <p>Te escribimos respecto a tu pedido <strong>#${escapeHtml(shortId)}</strong>.</p>
      <p><strong>Estado actual:</strong> ${escapeHtml(formatOrderStatus(order.status))}</p>
      <p><strong>Total:</strong> ${escapeHtml(formatMoney(order.total, order.currency))}</p>
      <p><strong>Productos:</strong></p>
      ${itemList}
      <p>Puedes revisar el detalle y descargar tus keys en tu cuenta:</p>
      <p><a href="${ordersUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c2410c;color:#fff;text-decoration:none;font-weight:600;">Ver mis pedidos</a></p>
      <p>Saludos,<br />El equipo de nicodigos</p>
    `.trim(),
  };
}

export function buildKeyDeliveredEmailDraft(
  order: AdminOrderDetail,
  itemName: string,
): { subject: string; htmlBody: string } {
  const shortId = order.id.slice(0, 8);
  const keysUrl = `${getAppBaseUrlForEmail()}/dashboard/keys`;

  return {
    subject: `Tu key de ${itemName} está lista — nicodigos`,
    htmlBody: `
      <p>Hola ${escapeHtml(order.customer.name)},</p>
      <p>Ya entregamos la key de <strong>${escapeHtml(itemName)}</strong> en tu pedido <strong>#${escapeHtml(shortId)}</strong>.</p>
      <p>Puedes verla y copiarla desde tu biblioteca de keys:</p>
      <p><a href="${keysUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c2410c;color:#fff;text-decoration:none;font-weight:600;">Ver mis keys</a></p>
      <p>Saludos,<br />El equipo de nicodigos</p>
    `.trim(),
  };
}
