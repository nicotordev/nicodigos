import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import type {
  TransactionStatus,
  TransactionType,
} from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

export type RecordTransactionInput = {
  userId: string;
  orderId?: string | null;
  type: TransactionType;
  status?: TransactionStatus;
  amount: number | string | Prisma.Decimal;
  currency?: string;
  provider?: string;
  providerReference?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  idempotencyKey?: string | null;
  processedAt?: Date | null;
};

export async function recordTransaction(
  input: RecordTransactionInput,
): Promise<{ id: string; created: boolean }> {
  if (input.idempotencyKey) {
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { id: true },
    });
    if (existing) {
      return { id: existing.id, created: false };
    }
  }

  const amount =
    input.amount instanceof Prisma.Decimal
      ? input.amount
      : new Prisma.Decimal(input.amount);

  const row = await prisma.transaction.create({
    data: {
      userId: input.userId,
      orderId: input.orderId ?? null,
      type: input.type,
      status: input.status ?? "PENDING",
      amount,
      currency: input.currency ?? "CLP",
      provider: input.provider ?? "internal",
      providerReference: input.providerReference ?? null,
      description: input.description ?? null,
      metadata: input.metadata ?? Prisma.DbNull,
      idempotencyKey: input.idempotencyKey ?? null,
      processedAt: input.processedAt ?? null,
    },
    select: { id: true },
  });

  return { id: row.id, created: true };
}
