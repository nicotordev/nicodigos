/**
 * Sincroniza un lote de productos con Kinguin (misma lógica que /api/cron/sync-catalog).
 * Uso directo en local, sin depender de Next.js ni CRON_SECRET.
 *
 *   bun --env-file=.env run sync:catalog
 *   bun --env-file=.env run sync:catalog -- --batch=30
 */

import "dotenv/config";

import { syncCatalogBatchFromKinguin } from "../lib/catalog/sync-catalog-batch";
import prisma from "../lib/prisma";

function parseBatchArg(): number | undefined {
  const flag = process.argv.find((arg) => arg.startsWith("--batch="));
  if (!flag) return undefined;
  const value = Number.parseInt(flag.split("=")[1] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function logResult(result: Awaited<ReturnType<typeof syncCatalogBatchFromKinguin>>) {
  if (!result.configured) {
    console.error(
      "[sync-catalog] Kinguin no configurado (KINGUIN_API_KEY / KINGUIN_API_BASE).",
    );
    return;
  }

  console.log(
    `[sync-catalog] Lote: ${result.succeeded}/${result.processed} OK` +
      ` · agotados: ${result.stockDepleted} · restaurados: ${result.stockRestored}` +
      ` · fallos: ${result.failed}`,
  );

  for (const err of result.errors.slice(0, 5)) {
    console.error(`  · ${err.productId}: ${err.error}`);
  }

  if (result.errors.length > 5) {
    console.error(`  · … y ${result.errors.length - 5} más`);
  }
}

async function main() {
  const batchSize = parseBatchArg();
  const result = await syncCatalogBatchFromKinguin(
    batchSize ? { batchSize } : undefined,
  );

  logResult(result);

  await prisma.$disconnect();

  if (!result.configured) {
    process.exit(1);
  }

  if (result.failed > 0 && result.succeeded === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[sync-catalog]", error instanceof Error ? error.message : error);
  process.exit(1);
});
