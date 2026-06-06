"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateOrderAction } from "@/lib/admin/orders/actions";
import { formatOrderStatus } from "@/lib/admin/format";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELED",
  "REFUNDED",
];

type OrderEditFormProps = {
  order: AdminOrderDetail;
  embedded?: boolean;
};

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function OrderEditForm({ order, embedded = false }: OrderEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    status: order.status,
    billingDocumentType: order.billing.documentType,
    billingFullName: order.billing.fullName,
    billingEmail: order.billing.email,
    billingPhone: order.billing.phone,
    billingRut: order.billing.rut,
    billingGiro: order.billing.giro,
    billingCompanyName: order.billing.companyName,
    billingRegion: order.billing.region,
    billingCommune: order.billing.commune,
    billingCity: order.billing.city,
    billingStreet: order.billing.street,
    billingUnit: order.billing.unit,
    kinguinOrderId: order.kinguinOrderId ?? "",
    kinguinStatus: order.kinguinStatus ?? "",
    isPreorder: order.isPreorder,
    preorderReleaseAt: toDatetimeLocalValue(order.preorderReleaseAt),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateOrderAction({
        orderId: order.id,
        ...form,
        kinguinOrderId: form.kinguinOrderId.trim() || null,
        kinguinStatus: form.kinguinStatus.trim() || null,
        preorderReleaseAt: form.isPreorder
          ? form.preorderReleaseAt.trim() || null
          : null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Pedido actualizado.");
      router.refresh();
    });
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="order-status">Estado</FieldLabel>
        <Select
          value={form.status}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              status: value as OrderStatus,
            }))
          }
          disabled={isPending}
        >
          <SelectTrigger id="order-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {formatOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Accordion type="multiple" defaultValue={[]} className="w-full">
        <AccordionItem value="billing" className="border-border/60">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            Facturación
          </AccordionTrigger>
          <AccordionContent>
            <FieldGroup className="gap-3 pt-1">
              <Field>
                <FieldLabel htmlFor="billing-full-name">Nombre</FieldLabel>
                <Input
                  id="billing-full-name"
                  value={form.billingFullName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      billingFullName: event.target.value,
                    }))
                  }
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="billing-email">Correo</FieldLabel>
                <Input
                  id="billing-email"
                  type="email"
                  value={form.billingEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      billingEmail: event.target.value,
                    }))
                  }
                  disabled={isPending}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="billing-phone">Teléfono</FieldLabel>
                  <Input
                    id="billing-phone"
                    value={form.billingPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        billingPhone: event.target.value,
                      }))
                    }
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="billing-rut">RUT</FieldLabel>
                  <Input
                    id="billing-rut"
                    value={form.billingRut}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        billingRut: event.target.value,
                      }))
                    }
                    disabled={isPending}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="billing-street">Dirección</FieldLabel>
                <Input
                  id="billing-street"
                  value={form.billingStreet}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      billingStreet: event.target.value,
                    }))
                  }
                  disabled={isPending}
                />
              </Field>
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kinguin" className="border-border/60">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            Kinguin
          </AccordionTrigger>
          <AccordionContent>
            <FieldGroup className="gap-3 pt-1">
              <Field>
                <FieldLabel htmlFor="kinguin-order-id">Order ID</FieldLabel>
                <Input
                  id="kinguin-order-id"
                  value={form.kinguinOrderId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      kinguinOrderId: event.target.value,
                    }))
                  }
                  className="font-mono text-sm"
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="kinguin-status">Estado</FieldLabel>
                <Textarea
                  id="kinguin-status"
                  value={form.kinguinStatus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      kinguinStatus: event.target.value,
                    }))
                  }
                  rows={2}
                  className="font-mono text-xs"
                  disabled={isPending}
                />
              </Field>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="is-preorder" className="text-sm font-normal">
                  Preventa
                </Label>
                <Switch
                  id="is-preorder"
                  checked={form.isPreorder}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, isPreorder: checked }))
                  }
                  disabled={isPending}
                />
              </div>
              {form.isPreorder ? (
                <Field>
                  <FieldLabel htmlFor="preorder-release-at">
                    Lanzamiento
                  </FieldLabel>
                  <Input
                    id="preorder-release-at"
                    type="datetime-local"
                    value={form.preorderReleaseAt}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        preorderReleaseAt: event.target.value,
                      }))
                    }
                    disabled={isPending}
                  />
                </Field>
              ) : null}
            </FieldGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );

  return formContent;
}
