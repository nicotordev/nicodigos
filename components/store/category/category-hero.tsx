import Image from "next/image";
import Link from "next/link";
import { IconBolt, IconCategory, IconChevronRight } from "@tabler/icons-react";

import type { StorefrontCategoryDetail } from "@/lib/store/categories/queries";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

type CategoryHeroProps = {
  category: StorefrontCategoryDetail;
  productTotal: number;
  className?: string;
};

function categorySubtitle(category: StorefrontCategoryDetail): string {
  if (category.descriptionPreview) {
    return category.descriptionPreview;
  }

  return `Keys y licencias de ${category.name.toLowerCase()} con entrega al tiro. Precio en pesos chilenos, sin vueltas.`;
}

export function CategoryHero({
  category,
  productTotal,
  className,
}: CategoryHeroProps) {
  const hasBanner = Boolean(category.bannerUrl);

  return (
    <div className={cn("space-y-4", className)}>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground/80 bg-muted/20 w-fit px-3.5 py-1.5 rounded-full border border-border/40 backdrop-blur-sm"
      >
        <Link
          href={storeRoutes.categories}
          className="hover:text-foreground transition-colors font-medium"
        >
          Categorías
        </Link>
        <IconChevronRight
          className="size-3.5 shrink-0 text-muted-foreground/50"
          aria-hidden
        />
        <span className="line-clamp-1 text-foreground font-semibold">
          {category.name}
        </span>
      </nav>

      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-card via-muted/20 to-card shadow-lg">
        {hasBanner ? (
          <div className="relative aspect-[21/7] min-h-[160px] sm:min-h-[200px] overflow-hidden bg-muted/20">
            <Image
              src={category.bannerUrl!}
              alt=""
              fill
              unoptimized
              priority
              sizes="(max-width:1280px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-indigo-500/5" />
        )}

        {!hasBanner ? (
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        ) : null}

        <div
          className={cn(
            "relative z-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-end md:justify-between",
            hasBanner && "-mt-2 sm:-mt-4",
          )}
        >
          <div className="flex items-start gap-4 min-w-0">
            {category.imageUrl ? (
              <div
                className={cn(
                  "relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-background shadow-md",
                  hasBanner && "-mt-10 sm:-mt-12",
                )}
              >
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-primary/10",
                  hasBanner && "-mt-10 sm:-mt-12",
                )}
              >
                <IconCategory className="size-7 text-primary/70" aria-hidden />
              </div>
            )}

            <div className="space-y-3 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <IconBolt className="size-3.5" aria-hidden />
                Te llega al tiro
              </div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {category.name}
              </h1>
              <p className="text-sm text-muted-foreground/90 max-w-xl leading-relaxed line-clamp-3">
                {categorySubtitle(category)}
              </p>
            </div>
          </div>

          {productTotal > 0 ? (
            <div className="flex flex-col items-start md:items-end justify-center shrink-0 bg-background/60 backdrop-blur-md border border-border/40 rounded-2xl p-4 shadow-sm min-w-[160px]">
              <span className="text-2xl font-black text-primary tabular-nums">
                {productTotal}
              </span>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {productTotal === 1 ? "Key disponible" : "Keys disponibles"}
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
