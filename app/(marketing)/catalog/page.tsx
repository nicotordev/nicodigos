import type { Metadata } from "next";
import { Suspense } from "react";

import {
  MarketingCompactHeader,
  MarketingHeroBanner,
  MarketingPageShell,
} from "@/components/marketing/marketing-page-shell";
import { CatalogExplorer } from "@/components/store/catalog-explorer";
import { CatalogPageShell } from "@/components/store/catalog-page-shell";
import {
  getCatalogFilterOptions,
  searchCatalogProducts,
} from "@/lib/store/catalog/queries";
import { parseCatalogSearchParams } from "@/lib/store/catalog/url";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const parts: string[] = ["Catálogo de juegos digitales"];

  if (filters.q) {
    parts.push(`Búsqueda: ${filters.q}`);
  }
  if (filters.category) {
    parts.push(filters.category);
  }
  if (filters.page > 1) {
    parts.push(`Página ${filters.page}`);
  }

  const title = parts.join(" — ");
  const description =
    "Compra keys Steam, gift cards PSN y Xbox, licencias de software y suscripciones en Chile. Filtra por plataforma, categoría y ofertas.";

  const queryParts: string[] = [];
  if (filters.page > 1) queryParts.push(`page=${filters.page}`);
  if (filters.category) {
    queryParts.push(`category=${encodeURIComponent(filters.category)}`);
  }
  if (filters.q) queryParts.push(`q=${encodeURIComponent(filters.q)}`);

  const path =
    queryParts.length > 0 ? `/catalog?${queryParts.join("&")}` : "/catalog";

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

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);

  const [initialData, filterOptions] = await Promise.all([
    searchCatalogProducts(filters),
    getCatalogFilterOptions(),
  ]);

  const catalogBadge = (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      Te llega al tiro
    </div>
  );

  const catalogStat =
    initialData.total > 0 ? (
      <div className="flex min-w-[160px] shrink-0 flex-col items-start justify-center rounded-2xl border border-border/40 bg-background/60 p-4 shadow-sm backdrop-blur-md md:items-end">
        <span className="text-2xl font-black text-primary tabular-nums">
          {initialData.total}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Productos
        </span>
      </div>
    ) : null;

  return (
    <MarketingPageShell contentClassName="space-y-6 md:space-y-8">
      <MarketingCompactHeader
        eyebrow="Catálogo"
        title="Keys y gift cards en Chile"
        description="Juegos digitales, licencias y suscripciones con precios en pesos y entrega al tiro."
      />

      <MarketingHeroBanner
        badge={catalogBadge}
        title="Catálogo de keys digitales en Chile"
        description="Keys Steam, gift cards PSN y Xbox, licencias de software y suscripciones. Filtra por plataforma, categoría y ofertas con precios en pesos chilenos."
        stat={catalogStat}
      />

      <Suspense fallback={<CatalogPageShell showGrid />}>
        <CatalogExplorer
          initialFilters={filters}
          initialData={initialData}
          filterOptions={filterOptions}
        />
      </Suspense>
    </MarketingPageShell>
  );
}
