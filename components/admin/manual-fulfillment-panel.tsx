"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconKey, IconTruckDelivery } from "@tabler/icons-react";
import { toast } from "sonner";

import { AdminRetryKinguinButton } from "@/components/admin/admin-retry-kinguin-button";
import type { AdminOrderDetail } from "@/lib/admin/orders/types";
import { deliverManualOrderKeyAction } from "@/lib/admin/orders/manual-fulfill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ManualFulfillmentPanelProps = {
  order: AdminOrderDetail;
};

export function ManualFulfillmentPanel({ order }: ManualFulfillmentPanelProps) {
  const router = useRouter();
  const [serials, setSerials] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  if (
    order.status !== "PROCESSING" ||
    (!order.needsManualFulfillment && order.pendingKeyCount === 0)
  ) {
    return null;
  }

  function handleDeliver(orderItemId: string) {
    const serial = serials[orderItemId]?.trim() ?? "";
    if (!serial) {
      toast.error("Pega la key antes de entregar.");
      return;
    }

    startTransition(async () => {
      const result = await deliverManualOrderKeyAction({
        orderId: order.id,
        orderItemId,
        serial,
      });

      if (!result.success) {
        toast.error(result.error ?? "No se pudo entregar la key.");
        return;
      }

      toast.success(result.message ?? "Key entregada.");
      setSerials((current) => {
        const next = { ...current };
        delete next[orderItemId];
        return next;
      });
      router.refresh();
    });
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconTruckDelivery className="size-4 text-amber-600" />
              Entrega manual
            </CardTitle>
            <CardDescription>
              Este pedido quedó en cola manual porque no se pudo comprar
              automáticamente en Kinguin. Entrega las keys aquí cuando las
              tengas.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-700"
          >
            {order.deliveredKeyCount}/{order.expectedKeyCount} keys
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {order.manualFulfillmentNote ? (
          <p className="rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
            {order.manualFulfillmentNote}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <AdminRetryKinguinButton orderId={order.id} />
          <p className="text-xs text-muted-foreground self-center">
            Si ya recargaste saldo en Kinguin, puedes reintentar la compra
            automática.
          </p>
        </div>

        <div className="space-y-4">
          {order.items
            .filter((item) => item.pendingKeyCount > 0)
            .map((item) => (
              <div
                key={item.id}
                className="space-y-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Pendientes: {item.pendingKeyCount} de {item.quantity}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <IconKey className="mr-1 size-3" />
                    Manual
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`manual-key-${item.id}`}>Key / serial</Label>
                  <Input
                    id={`manual-key-${item.id}`}
                    value={serials[item.id] ?? ""}
                    onChange={(event) =>
                      setSerials((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Pega la key de activación"
                    className="font-mono text-sm"
                    disabled={isPending}
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDeliver(item.id)}
                >
                  {isPending ? "Entregando…" : "Entregar key"}
                </Button>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
