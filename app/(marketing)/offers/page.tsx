import type { Metadata } from "next";
import Link from "next/link";
import { IconBolt } from "@tabler/icons-react";

import {
  MarketingCompactHeader,
  MarketingHeroBanner,
  MarketingPageShell,
} from "@/components/marketing/marketing-page-shell";
import { StorePagination } from "@/components/store/catalog-pagination";
import {
  StorefrontProductCardView,
  storefrontProductGridClassName,
} from "@/components/store/storefront-product-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getStorefrontOffersPage } from "@/lib/store/offers/queries";
import { storeRoutes } from "@/lib/store/navigation";
type OffersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function parsePageParam(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  searchParams,
}: OffersPageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);

  const title = page > 1 ? `Ofertas — Página ${page}` : "Ofertas";
  const description =
    "Ofertas en keys Steam, gift cards y licencias digitales en Chile. Precios en pesos y stock limitado.";
  const path = page > 1 ? `/offers?page=${page}` : "/offers";

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const { page: pageParam } = await searchParams;
  const requestedPage = parsePageParam(pageParam);
  const { products, page, total, totalPages, pageSize } =
    await getStorefrontOffersPage(requestedPage);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  const offersBadge = (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
      <IconBolt className="size-3.5 animate-pulse" aria-hidden />
      Descuentos activos
    </div>
  );

  const offersStat =
    total > 0 ? (
      <div className="flex min-w-[160px] shrink-0 flex-col items-start justify-center rounded-2xl border border-rose-500/20 bg-background/60 p-4 shadow-sm backdrop-blur-md md:items-end">
        <span className="text-2xl font-black text-rose-500 tabular-nums">
          {total}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          En promoción
        </span>
      </div>
    ) : null;

  return (
    <MarketingPageShell
      variant="warm"
      contentClassName="space-y-6 md:space-y-8"
    >
      <MarketingCompactHeader
        eyebrow="Promos"
        title="Ofertas del día"
        description="Keys y gift cards con precio especial en pesos chilenos."
      />

      <MarketingHeroBanner
        tone="warm"
        badge={offersBadge}
        title="Ofertas en juegos digitales Chile"
        description="Promociones por tiempo limitado en keys Steam, gift cards y licencias de software seleccionadas."
        stat={offersStat}
      />

      {total > 0 ? (
        <div className="flex items-center justify-between border-b border-border/10 pb-4">
          <p className="text-xs font-medium text-muted-foreground">
            Mostrando{" "}
            <span className="font-semibold text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            de <span className="font-semibold text-foreground">{total}</span>{" "}
            productos
          </p>
        </div>
      ) : null}

      {products.length === 0 ? (
        <Empty className="py-16 border-dashed bg-muted/5">
          <EmptyHeader>
            <EmptyTitle className="text-base font-bold">
              Sin ofertas por ahora
            </EmptyTitle>
            <EmptyDescription className="text-sm">
              No hay productos marcados como oferta con stock. Explora el
              catálogo completo mientras tanto.
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href={storeRoutes.catalog}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Ver catálogo
          </Link>
        </Empty>
      ) : (
        <>
          <ul className={storefrontProductGridClassName}>
            {products.map((product) => (
              <li key={product.id} className="h-full">
                <StorefrontProductCardView product={product} />
              </li>
            ))}
          </ul>

          <StorePagination
            page={page}
            totalPages={totalPages}
            basePath={storeRoutes.offers}
          />
        </>
      )}
    </MarketingPageShell>
  );
}
