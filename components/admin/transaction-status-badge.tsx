import { Badge } from "@/components/ui/badge";
import { formatTransactionStatus } from "@/lib/transactions/labels";
import type { TransactionStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  TransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SUCCEEDED: "default",
  PENDING: "outline",
  FAILED: "destructive",
  CANCELED: "secondary",
};

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
  className?: string;
};

export function TransactionStatusBadge({
  status,
  className,
}: TransactionStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={cn(className)}>
      {formatTransactionStatus(status)}
    </Badge>
  );
}
