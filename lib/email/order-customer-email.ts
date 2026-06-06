import "server-only";

import { getResend } from "@/lib/resend";

export function wrapOrderCustomerEmailHtml(bodyHtml: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#171717;max-width:640px;margin:0 auto;padding:24px;">
      <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e5e5;">
        <strong style="font-size:18px;color:#c2410c;">nicodigos</strong>
      </div>
      ${bodyHtml}
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e5e5;" />
      <p style="color:#737373;font-size:13px;margin:0;">
        Este correo fue enviado por el equipo de nicodigos respecto a tu pedido.
        Si tienes dudas, responde a este mensaje o escríbenos por soporte.
      </p>
    </div>
  `.trim();
}

export async function sendOrderCustomerEmail(input: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const to = input.to.trim();
  const subject = input.subject.trim();
  const htmlBody = input.htmlBody.trim();

  if (!to || !subject || !htmlBody) {
    return {
      success: false,
      error: "Completa destinatario, asunto y mensaje.",
    };
  }

  try {
    await getResend().emails.send({
      from: process.env.EMAIL_FROM ?? "nicodigos <onboarding@resend.dev>",
      to,
      subject,
      html: wrapOrderCustomerEmailHtml(htmlBody),
      replyTo: process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1],
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar el correo.";
    return { success: false, error: message };
  }
}
