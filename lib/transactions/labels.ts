import type {
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/client";

const typeLabels: Record<TransactionType, string> = {
  CHARGE: "Cobro",
  REFUND: "Reembolso",
  PAYOUT: "Pago proveedor",
  ADJUSTMENT: "Ajuste",
};

const statusLabels: Record<TransactionStatus, string> = {
  PENDING: "Pendiente",
  SUCCEEDED: "Completada",
  FAILED: "Fallida",
  CANCELED: "Cancelada",
};

export function formatTransactionType(type: TransactionType): string {
  return typeLabels[type];
}

export function formatTransactionStatus(status: TransactionStatus): string {
  return statusLabels[status];
}
