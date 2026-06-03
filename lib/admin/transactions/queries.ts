import prisma from "@/lib/prisma";
import type {
  AdminTransactionListItem,
  AdminTransactionSummary,
} from "@/lib/admin/transactions/types";

const LIST_LIMIT = 150;

export async function getAdminTransactions(): Promise<
  AdminTransactionListItem[]
> {
  const rows = await prisma.transaction.findMany({
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return rows.map((tx) => ({
    id: tx.id,
    type: tx.type,
    status: tx.status,
    amount: tx.amount.toString(),
    currency: tx.currency,
    provider: tx.provider,
    providerReference: tx.providerReference,
    description: tx.description,
    orderId: tx.orderId,
    userId: tx.userId,
    customerName: tx.user.name,
    customerEmail: tx.user.email,
    processedAt: tx.processedAt?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
  }));
}

export async function getAdminTransactionSummary(): Promise<AdminTransactionSummary> {
  const [totalCount, succeededAgg, pendingCount, failedCount] =
    await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCEEDED", type: "CHARGE" },
      }),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.transaction.count({ where: { status: "FAILED" } }),
    ]);

  return {
    totalCount,
    succeededVolume: succeededAgg._sum.amount?.toString() ?? "0",
    pendingCount,
    failedCount,
  };
}

export async function getTransactionsForOrder(
  orderId: string,
): Promise<AdminTransactionListItem[]> {
  const rows = await prisma.transaction.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return rows.map((tx) => ({
    id: tx.id,
    type: tx.type,
    status: tx.status,
    amount: tx.amount.toString(),
    currency: tx.currency,
    provider: tx.provider,
    providerReference: tx.providerReference,
    description: tx.description,
    orderId: tx.orderId,
    userId: tx.userId,
    customerName: tx.user.name,
    customerEmail: tx.user.email,
    processedAt: tx.processedAt?.toISOString() ?? null,
    createdAt: tx.createdAt.toISOString(),
  }));
}
