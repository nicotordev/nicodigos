"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconKey, IconPackage } from "@tabler/icons-react";
import { toast } from "sonner";

import { buildKeyDeliveredEmailDraft } from "@/lib/admin/orders/email-draft";
import { sendOrderCustomerEmailAction } from "@/lib/admin/orders/actions";
import { deliverManualOrderKeyAction } from "@/lib/admin/orders/manual-fulfill";
import type {
  AdminOrderDetail,
  AdminOrderItemDetail,
} from "@/lib/admin/orders/types";
import { formatMoney } from "@/lib/admin/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type OrderItemCardProps = {
  order: AdminOrderDetail;
  item: AdminOrderItemDetail;
  canDeliver: boolean;
  notifyByEmail: boolean;
};

function KeyStatusBadge({ status }: { status: string }) {
  const variant =
    status === "DELIVERED"
      ? "default"
      : status === "PENDING" || status === "PROCESSING"
        ? "secondary"
        : "outline";

  return (
    <Badge variant={variant} className="text-[10px] font-medium uppercase">
      {status}
    </Badge>
  );
}

export function OrderItemCard({
  order,
  item,
  canDeliver,
  notifyByEmail,
}: OrderItemCardProps) {
  const router = useRouter();
  const [serial, setSerial] = useState("");
  const [isPending, startTransition] = useTransition();

  const isFulfilled = item.pendingKeyCount === 0;
  const extraCount = Math.max(item.deliveredKeyCount - item.quantity, 0);

  function handleDeliver() {
    const value = serial.trim();
    if (!value) {
      toast.error("Pega la key antes de entregar.");
      return;
    }

    startTransition(async () => {
      const result = await deliverManualOrderKeyAction({
        orderId: order.id,
        orderItemId: item.id,
        serial: value,
      });

      if (!result.success) {
        toast.error(result.error ?? "No se pudo entregar la key.");
        return;
      }

      toast.success(result.message ?? "Key entregada.");
      setSerial("");

      if (notifyByEmail) {
        const recipient =
          order.billing.email.trim() || order.customer.email.trim();
        const draft = buildKeyDeliveredEmailDraft(order, item.name);
        const emailResult = await sendOrderCustomerEmailAction({
          orderId: order.id,
          to: recipient,
          subject: isFulfilled
            ? `Key adicional de ${item.name} — nicodigos`
            : draft.subject,
          htmlBody: draft.htmlBody,
        });

        if (!emailResult.success) {
          toast.error(
            emailResult.error ??
              "Key entregada, pero no se pudo enviar el correo.",
          );
        }
      }

      router.refresh();
    });
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <IconPackage className="size-4 shrink-0 text-muted-foreground" />
            <h3 className="font-medium leading-snug">{item.name}</h3>
            {isFulfilled ? (
              <Badge variant="outline" className="text-xs">
                Completo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {item.pendingKeyCount} pendiente
                {item.pendingKeyCount === 1 ? "" : "s"}
              </Badge>
            )}
            {extraCount > 0 ? (
              <Badge variant="outline" className="text-xs">
                +{extraCount} extra
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Kinguin {item.kinguinProductId}
            {item.productId ? (
              <>
                {" · "}
                <Link
                  href={`/admin/products/${item.productId}/edit`}
                  className="text-primary hover:underline"
                >
                  Ver producto
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums">
            {formatMoney(item.lineTotal, order.currency)}
          </p>
          <p className="text-xs text-muted-foreground">× {item.quantity}</p>
        </div>
      </div>

      {item.keys.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">ID</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead>Serial</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {key.kinguinKeyId.slice(0, 24)}
                    {key.kinguinKeyId.length > 24 ? "…" : ""}
                  </TableCell>
                  <TableCell>
                    <KeyStatusBadge status={key.status} />
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate font-mono text-xs">
                    {key.serial || key.serialMasked}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          Sin keys entregadas aún.
        </p>
      )}

      {canDeliver ? (
        <div
          className={cn(
            "flex flex-col gap-2 border-t border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center",
            isFulfilled && "bg-muted/15",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <IconKey className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={serial}
              onChange={(event) => setSerial(event.target.value)}
              placeholder={
                isFulfilled ? "Key adicional…" : "Pegar key / serial…"
              }
              className="h-9 font-mono text-sm"
              disabled={isPending}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleDeliver();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant={isFulfilled ? "outline" : "default"}
            className="shrink-0"
            disabled={isPending}
            onClick={handleDeliver}
          >
            {isPending
              ? "Entregando…"
              : isFulfilled
                ? "Agregar extra"
                : "Entregar"}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
