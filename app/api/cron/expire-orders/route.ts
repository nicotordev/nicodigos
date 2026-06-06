import { isCronConfigured, verifyCronRequest } from "@/lib/cron/auth";
import { expirePendingOrders } from "@/lib/store/checkout/expire-pending-orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parseBatchParam(request: Request): number | undefined {
  const raw = new URL(request.url).searchParams.get("batch");
  if (!raw) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function handleExpire(request: Request) {
  if (!isCronConfigured()) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado." },
      { status: 503 },
    );
  }

  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const result = await expirePendingOrders({
    batchSize: parseBatchParam(request),
  });

  return NextResponse.json({
    ok: true,
    ...result,
    message:
      result.expiredCount === 0
        ? "Sin pedidos pendientes para expirar."
        : `${result.expiredCount} pedido${result.expiredCount === 1 ? "" : "s"} cancelado${result.expiredCount === 1 ? "" : "s"} por expiración.`,
  });
}

export async function GET(request: Request) {
  return handleExpire(request);
}

export async function POST(request: Request) {
  return handleExpire(request);
}
