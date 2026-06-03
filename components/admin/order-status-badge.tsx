import { Badge } from "@/components/ui/badge";
import { formatOrderStatus } from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  COMPLETED: "default",
  PROCESSING: "secondary",
  PENDING: "outline",
  CANCELED: "destructive",
  REFUNDED: "destructive",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={cn(className)}>
      {formatOrderStatus(status)}
    </Badge>
  );
}
