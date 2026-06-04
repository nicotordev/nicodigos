"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { retryKinguinFulfillmentAction } from "@/lib/admin/orders/retry-fulfillment";

type AdminRetryKinguinButtonProps = {
  orderId: string;
  disabled?: boolean;
};

export function AdminRetryKinguinButton({
  orderId,
  disabled,
}: AdminRetryKinguinButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await retryKinguinFulfillmentAction(orderId);
          if (result.status === "completed" || result.keysDelivered > 0) {
            toast.success(result.message);
            return;
          }
          if (result.status === "processing") {
            toast.message(result.message);
            return;
          }
          toast.error(result.message);
        })
      }
    >
      {isPending ? "Reintentando Kinguin…" : "Reintentar entrega Kinguin"}
    </Button>
  );
}
