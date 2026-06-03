import "server-only";

import { syncProductFromKinguin } from "@/lib/catalog/sync-product-from-kinguin";
import { getEurToClpRate } from "@/lib/currency/exchange";
import { isKinguinConfigured } from "@/lib/kinguin/client";
import prisma from "@/lib/prisma";

const DEFAULT_BATCH_SIZE = 15;
const DEFAULT_DELAY_MS = 200;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type CatalogSyncBatchResult = {
  configured: boolean;
  batchSize: number;
  processed: number;
  succeeded: number;
  failed: number;
  stockDepleted: number;
  stockRestored: number;
  errors: { productId: string; error: string }[];
};

export async function syncCatalogBatchFromKinguin(options?: {
  batchSize?: number;
  delayMs?: number;
}): Promise<CatalogSyncBatchResult> {
  if (!isKinguinConfigured()) {
    return {
      configured: false,
      batchSize: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      stockDepleted: 0,
      stockRestored: 0,
      errors: [],
    };
  }

  const batchSize =
    options?.batchSize ??
    parsePositiveInt(process.env.CRON_SYNC_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  const delayMs =
    options?.delayMs ??
    parsePositiveInt(process.env.CRON_SYNC_DELAY_MS, DEFAULT_DELAY_MS);

  const products = await prisma.product.findMany({
    orderBy: [{ kinguinSyncedAt: "asc" }, { createdAt: "asc" }],
    take: batchSize,
    select: { id: true },
  });

  const fx = await getEurToClpRate();

  let succeeded = 0;
  let failed = 0;
  let stockDepleted = 0;
  let stockRestored = 0;
  const errors: { productId: string; error: string }[] = [];

  for (let index = 0; index < products.length; index += 1) {
    const { id } = products[index];
    const result = await syncProductFromKinguin(id, fx.rate);

    if (!result.ok) {
      failed += 1;
      errors.push({ productId: id, error: result.error });
    } else {
      succeeded += 1;
      const wasOut = result.previousQty <= 0;
      const isIn = result.qty > 0;
      if (wasOut && isIn) {
        stockRestored += 1;
      }
      if (!wasOut && !isIn) {
        stockDepleted += 1;
      }
    }

    if (index < products.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return {
    configured: true,
    batchSize,
    processed: products.length,
    succeeded,
    failed,
    stockDepleted,
    stockRestored,
    errors,
  };
}
