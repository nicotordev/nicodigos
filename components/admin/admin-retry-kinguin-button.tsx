"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

import { retryKinguinFulfillmentAction } from "@/lib/admin/orders/retry-fulfillment";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminRetryKinguinButtonProps = {
  orderId: string;
  disabled?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon-sm";
  className?: string;
  label?: string;
  pendingLabel?: string;
  iconOnly?: boolean;
};

export function AdminRetryKinguinButton({
  orderId,
  disabled,
  variant = "default",
  size = "sm",
  className,
  label = "Comprar en Kinguin",
  pendingLabel = "Comprando en Kinguin…",
  iconOnly = false,
}: AdminRetryKinguinButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(iconOnly && "px-0", "gap-1.5", className)}
      disabled={disabled || isPending}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      onClick={() =>
        startTransition(async () => {
          const result = await retryKinguinFulfillmentAction(orderId);
          if (result.status === "completed" || result.keysDelivered > 0) {
            toast.success(result.message);
            router.refresh();
            return;
          }
          if (result.status === "processing") {
            toast.message(result.message);
            router.refresh();
            return;
          }
          toast.error(result.message);
        })
      }
    >
      <IconRefresh
        className={cn("size-4", isPending && "animate-spin")}
        aria-hidden
      />
      {iconOnly ? (
        <span className="sr-only">{isPending ? pendingLabel : label}</span>
      ) : isPending ? (
        pendingLabel
      ) : (
        label
      )}
    </Button>
  );
}
