import Link from "next/link";
import { IconBolt, IconCalendar, IconClock } from "@tabler/icons-react";

import { PlatformBadge } from "@/components/store/platform-badge";
import { ProductStoreActions } from "@/components/store/product-store-actions";
import { StoreProductCover } from "@/components/store/store-product-cover";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/currency/format";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

export const storefrontProductGridClassName =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4";

/** Altura acotada + ratio fijo: evita escalar thumbnails de Kinguin (~200px) a 320px. */
export const storefrontProductCoverClassName =
  "aspect-3/4 w-full max-h-44 rounded-none transition-opacity duration-200 group-hover:opacity-90 sm:max-h-48 lg:max-h-52";

export const storefrontProductCoverSizes =
  "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1536px) 22vw, 200px";

export type StorefrontCardProduct = {
  id: string;
  slug: string;
  name: string;
  platform: string;
  coverImageUrl: string | null;
  sellPrice: string;

  description?: string | null;
  genres?: string[];
  listPrice?: string | null;
  discountPercent?: number | null;
  qty?: number;
  isOffer?: boolean;
  isPreorder?: boolean;
  releaseDate?: string | null;
  regionName?: string | null;
  languages?: string[];
  developers?: string[];
  publishers?: string[];
  offer?: {
    sellPrice: string;
    qty: number;
    isPreorder: boolean;
  } | null;
};

type StorefrontProductCardProps = {
  product: StorefrontCardProduct;
  className?: string;
};

function plainDescription(
  html: string | null | undefined,
  maxLength = 100,
): string | null {
  if (!html) {
    return null;
  }

  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return null;
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function productMetaLine(product: StorefrontCardProduct): string | null {
  const parts: string[] = [];

  if (product.regionName) {
    parts.push(product.regionName === "Global" ? "Global" : product.regionName);
  } else if (product.genres && product.genres.length > 0) {
    parts.push(...product.genres.slice(0, 2));
  }

  if (product.isPreorder) {
    parts.push(
      product.releaseDate ? `Preventa · ${product.releaseDate}` : "Preventa",
    );
  } else if (product.isOffer) {
    parts.push("Oferta");
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function StorefrontProductCardView({
  product,
  className,
}: StorefrontProductCardProps) {
  const isPreorder = !!product.isPreorder;
  const qty = product.qty ?? 1;
  const inStock = qty > 0 || isPreorder;
  const displayPrice = product.offer?.sellPrice ?? product.sellPrice;
  const description = plainDescription(product.description);
  const metaLine = productMetaLine(product);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      {product.isOffer && product.discountPercent ? (
        <Badge className="absolute right-1.5 top-1.5 z-20 border-0 bg-rose-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md">
          -{product.discountPercent}%
        </Badge>
      ) : null}
      <Link
        href={storeRoutes.product(product.slug)}
        className="relative block overflow-hidden bg-muted"
        tabIndex={-1}
      >
        <StoreProductCover
          src={product.coverImageUrl}
          alt={product.name}
          className={storefrontProductCoverClassName}
          sizes={storefrontProductCoverSizes}
        />
        <PlatformBadge
          platform={product.platform}
          overlay
          size="xs"
          className="absolute left-1.5 top-1.5 z-20"
        />
        {isPreorder ? (
          <Badge
            variant="outline"
            className="absolute left-1.5 top-8 z-20 border-violet-500/30 bg-background px-1.5 py-0 text-[9px] font-bold text-violet-600 shadow-md backdrop-blur-sm dark:bg-zinc-950 dark:text-violet-400"
          >
            <IconClock className="size-2.5" aria-hidden />
            Preventa
          </Badge>
        ) : null}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-foreground sm:text-xs">
          <Link
            href={storeRoutes.product(product.slug)}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {description ? (
          <p className="hidden text-[11px] leading-snug text-muted-foreground line-clamp-2 xl:block">
            {description}
          </p>
        ) : null}

        <div className="flex flex-1 flex-col justify-end gap-1.5 pt-0.5">
          {metaLine ? (
            <p className="line-clamp-1 text-[10px] text-muted-foreground italic">
              {metaLine}
            </p>
          ) : null}

          <div className="flex items-end justify-between gap-2 border-t border-border/50 pt-2">
            <div className="min-w-0">
              {product.listPrice ? (
                <p className="mb-0.5 text-[10px] leading-none text-muted-foreground line-through tabular-nums">
                  {formatMoney(product.listPrice)}
                </p>
              ) : null}
              <p className="text-xs font-bold tabular-nums leading-none text-foreground sm:text-sm">
                {formatMoney(displayPrice)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {isPreorder ? (
                <span className="text-[9px] font-semibold text-violet-500 sm:text-[10px]">
                  Reserva
                </span>
              ) : qty > 0 ? (
                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 sm:text-[10px]">
                  {qty} stock
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-muted-foreground sm:text-[10px]">
                  Agotado
                </span>
              )}
            </div>
          </div>

          {product.isOffer ? (
            <p className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-500">
              <IconBolt className="size-3 shrink-0" aria-hidden />
              Oferta
            </p>
          ) : null}

          {isPreorder && product.releaseDate ? (
            <p className="flex items-center gap-1 text-[10px] font-medium text-violet-500">
              <IconCalendar className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{product.releaseDate}</span>
            </p>
          ) : null}

          <ProductStoreActions
            productId={product.id}
            compact
            disabled={!inStock}
            className="relative z-10 hidden w-full flex-row gap-1.5 md:flex [&_button]:min-h-8 [&_button]:flex-1 [&_button]:text-[11px]"
          />
        </div>
      </div>
    </article>
  );
}
