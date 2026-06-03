import { syncCatalogBatchFromKinguin } from "@/lib/catalog/sync-catalog-batch";
import { isCronConfigured, verifyCronRequest } from "@/lib/cron/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function parseBatchParam(request: Request): number | undefined {
  const raw = new URL(request.url).searchParams.get("batch");
  if (!raw) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function handleSync(request: Request) {
  if (!isCronConfigured()) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado." },
      { status: 503 },
    );
  }

  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await syncCatalogBatchFromKinguin({
    batchSize: parseBatchParam(request),
  });

  if (!result.configured) {
    return NextResponse.json(
      { error: "Kinguin no configurado (KINGUIN_API_KEY / KINGUIN_API_BASE)." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...result,
    message:
      result.processed === 0
        ? "Sin productos en catálogo."
        : `Sincronizados ${result.succeeded}/${result.processed} productos.`,
  });
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
