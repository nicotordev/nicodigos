/**
 * Ejecuta sync-catalog-local cada 15 minutos (mismo intervalo que railway.cron.toml).
 * Se lanza junto a `bun run dev` para mantener stock/ofertas al día en local.
 *
 *   bun --env-file=.env run sync:catalog:loop
 */

import "dotenv/config";

import { syncCatalogBatchFromKinguin } from "../lib/catalog/sync-catalog-batch";

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

function parseIntervalMs(): number {
  const raw = process.env.SYNC_CATALOG_INTERVAL_MS?.trim();
  if (!raw) return DEFAULT_INTERVAL_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 60_000
    ? parsed
    : DEFAULT_INTERVAL_MS;
}

function logResult(
  result: Awaited<ReturnType<typeof syncCatalogBatchFromKinguin>>,
) {
  const at = new Date().toISOString();
  if (!result.configured) {
    console.error(`[catalog-sync] ${at} Kinguin no configurado.`);
    return;
  }

  console.log(
    `[catalog-sync] ${at} ${result.succeeded}/${result.processed} OK` +
      ` · agotados ${result.stockDepleted} · restaurados ${result.stockRestored}` +
      ` · fallos ${result.failed}`,
  );

  if (result.errors.length > 0) {
    console.error(
      `[catalog-sync] errores:`,
      result.errors.map((e) => `${e.productId}: ${e.error}`).join("; "),
    );
  }
}

async function runBatch() {
  try {
    const result = await syncCatalogBatchFromKinguin();
    logResult(result);
  } catch (error) {
    console.error(
      "[catalog-sync]",
      error instanceof Error ? error.message : error,
    );
  }
}

const intervalMs = parseIntervalMs();
const minutes = Math.round(intervalMs / 60_000);

console.log(
  `[catalog-sync] Scheduler activo: cada ${minutes} min (SYNC_CATALOG_INTERVAL_MS=${intervalMs}).`,
);
console.log("[catalog-sync] Primera ejecución ahora…");

void runBatch();

const timer = setInterval(() => {
  void runBatch();
}, intervalMs);

process.on("SIGINT", () => {
  clearInterval(timer);
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(timer);
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("[catalog-sync] unhandledRejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[catalog-sync] uncaughtException:", error);
});
