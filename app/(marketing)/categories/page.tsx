import type { Metadata } from "next";
import Link from "next/link";
import { IconCategory, IconArrowRight } from "@tabler/icons-react";

import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import CategoryCard, {
  categoryCardGridClassName,
} from "@/components/shop/category/category-card";
import { CategoryTrustBadges } from "@/components/shop/category/category-trust-badges";
import { getStorefrontCategories } from "@/lib/store/categories/queries";
import { storeRoutes } from "@/lib/store/navigation";

export const metadata: Metadata = {
  title: "Categorías | Nicodigos",
  description:
    "Explora keys de Steam, gift cards, licencias de software y suscripciones por tipo de producto digital.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title: "Categorías de Productos Digitales | Nicodigos",
    description:
      "Explora keys de Steam, gift cards, licencias de software y suscripciones por tipo de producto digital.",
    type: "website",
    url: "/categories",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categorías de Productos Digitales | Nicodigos",
    description:
      "Explora keys de Steam, gift cards, licencias de software y suscripciones por tipo de producto digital.",
  },
};

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await getStorefrontCategories();
  const categoryCountLabel =
    categories.length === 1 ? "Categoría" : "Categorías";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Compact header — mobile / tablet */}
      <header className="border-b border-border/80 bg-background px-4 pb-5 pt-6 sm:px-6 lg:hidden">
        <div className="mx-auto w-full max-w-7xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {categories.length} {categoryCountLabel}
          </p>
          <h1 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Categorías
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground line-clamp-2">
            Explora códigos digitales, licencias de software, gift cards y
            suscripciones con entrega inmediata.
          </p>
          <CategoryTrustBadges
            includeOffers={false}
            className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none sm:mx-0 sm:px-0"
          />
        </div>
      </header>

      {/* Cinematic hero — desktop */}
      <header className="relative hidden h-[50vh] max-h-[600px] min-h-[400px] w-full items-center justify-center overflow-hidden bg-black lg:flex">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-black to-indigo-950/80" />
          <div className="absolute inset-0 z-10 bg-black/55" />
        </div>

        <div className="relative z-20 mt-8 flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <span className="rounded-full border border-primary/30 bg-primary/25 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground/90 backdrop-blur-md md:text-sm">
            {categories.length} {categoryCountLabel}
          </span>
          <h1 className="font-heading text-4xl font-black uppercase tracking-wider text-white drop-shadow-md md:text-5xl lg:text-6xl">
            Categorías
          </h1>
          <p className="max-w-xl text-sm font-light text-gray-200 drop-shadow line-clamp-3 md:text-base">
            Explora códigos digitales, licencias de software, gift cards y
            suscripciones con entrega inmediata.
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 w-full overflow-hidden leading-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block h-[60px] w-full fill-background"
          >
            <path
              d="M0,0 C150,90 350,120 600,120 C850,120 1050,90 1200,0 L1200,120 L0,120 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:gap-8 lg:px-8 lg:py-10">
        {/* Section intro — desktop */}
        <div className="hidden flex-col justify-between gap-4 border-b border-border/80 pb-6 lg:flex lg:flex-row lg:items-center">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">
              Explorar por Categoría
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Elige un tipo de producto digital para filtrar el catálogo
            </p>
          </div>

          <CategoryTrustBadges
            includeOffers={false}
            className="flex flex-wrap gap-2"
          />
        </div>

        {/* Section intro — mobile */}
        <div className="space-y-1 lg:hidden">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Explorar por categoría
          </h2>
          <p className="text-sm text-muted-foreground">
            Elige un tipo de producto digital para filtrar el catálogo
          </p>
        </div>

        {categories.length === 0 ? (
          <Empty>
            <EmptyMedia>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <IconCategory className="size-6" />
              </div>
            </EmptyMedia>
            <EmptyTitle>Sin categorías disponibles</EmptyTitle>
            <EmptyDescription>
              Aún no hay categorías de productos publicadas. Mientras tanto,
              puedes revisar el catálogo completo de productos.
            </EmptyDescription>
            <EmptyContent>
              <Link
                href={storeRoutes.catalog}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/95 hover:shadow-primary/20"
              >
                <span>Ir al catálogo</span>
                <IconArrowRight className="size-4" />
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <div className={categoryCardGridClassName}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
