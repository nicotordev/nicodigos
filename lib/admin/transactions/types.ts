import type {
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/client";

export type AdminTransactionListItem = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  provider: string;
  providerReference: string | null;
  description: string | null;
  orderId: string | null;
  userId: string;
  customerName: string;
  customerEmail: string;
  processedAt: string | null;
  createdAt: string;
};

export type AdminTransactionSummary = {
  totalCount: number;
  succeededVolume: string;
  pendingCount: number;
  failedCount: number;
};
