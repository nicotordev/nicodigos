"use client";

import { useState, useTransition } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { sendOrderCustomerEmailAction } from "@/lib/admin/orders/actions";
import { buildOrderEmailDraft } from "@/lib/admin/orders/email-draft";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type OrderContactCustomerPanelProps = {
  order: AdminOrderDetail;
  embedded?: boolean;
};

export function OrderContactCustomerPanel({
  order,
  embedded = false,
}: OrderContactCustomerPanelProps) {
  const defaultDraft = buildOrderEmailDraft(order);
  const [to, setTo] = useState(defaultDraft.to);
  const [subject, setSubject] = useState(defaultDraft.subject);
  const [htmlBody, setHtmlBody] = useState(defaultDraft.htmlBody);
  const [isPending, startTransition] = useTransition();

  function resetDraft() {
    const draft = buildOrderEmailDraft(order);
    setTo(draft.to);
    setSubject(draft.subject);
    setHtmlBody(draft.htmlBody);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await sendOrderCustomerEmailAction({
        orderId: order.id,
        to,
        subject,
        htmlBody,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Correo enviado.");
    });
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="contact-to">Para</FieldLabel>
          <Input
            id="contact-to"
            type="email"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-subject">Asunto</FieldLabel>
          <Input
            id="contact-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            disabled={isPending}
            required
          />
        </Field>

        <Field>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <FieldLabel htmlFor="contact-body">Mensaje</FieldLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={resetDraft}
              disabled={isPending}
            >
              <IconRefresh className="size-3" />
              Plantilla
            </Button>
          </div>
          <RichTextEditor
            id="contact-body"
            value={htmlBody}
            onChange={setHtmlBody}
            placeholder="Mensaje para el cliente…"
            disabled={isPending}
            minHeight={embedded ? "10rem" : "14rem"}
          />
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Enviando…" : "Enviar correo"}
      </Button>
    </form>
  );
}
