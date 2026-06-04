/**
 * Producción (Railway): POST /api/cron/sync-catalog con CRON_SECRET.
 * Local directo (sin Next): CRON_SYNC_MODE=local bun run cron:sync-catalog
 *
 *   bun --env-file=.env run cron:sync-catalog
 *   bun --env-file=.env run sync:catalog
 */

async function runCronSyncLocal() {
  const { syncCatalogBatchFromKinguin } = await import(
    "../lib/catalog/sync-catalog-batch"
  );
  const prisma = (await import("../lib/prisma")).default;

  const result = await syncCatalogBatchFromKinguin();
  console.log("[cron-sync:local]", JSON.stringify(result, null, 2));
  await prisma.$disconnect();

  if (!result.configured || (result.failed > 0 && result.succeeded === 0)) {
    process.exit(1);
  }
}

async function runCronSync() {
  if (process.env.CRON_SYNC_MODE?.trim().toLowerCase() === "local") {
    await runCronSyncLocal();
    return;
  }

  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.error("[cron-sync] Falta CRON_SECRET");
    process.exit(1);
  }

  const target =
    process.env.CRON_SYNC_URL?.trim() ??
    (process.env.BETTER_AUTH_URL?.trim()
      ? `${process.env.BETTER_AUTH_URL.replace(/\/$/, "")}/api/cron/sync-catalog`
      : null);

  if (!target) {
    console.error("[cron-sync] Falta CRON_SYNC_URL o BETTER_AUTH_URL");
    process.exit(1);
  }

  const batch = process.env.CRON_SYNC_BATCH_SIZE?.trim();
  const url = batch ? `${target}?batch=${encodeURIComponent(batch)}` : target;

  console.log(`[cron-sync] POST ${url}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
  });

  const body = await response.text();
  console.log(`[cron-sync] ${response.status}`, body);

  if (!response.ok) {
    process.exit(1);
  }
}

runCronSync();
