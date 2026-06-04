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
  "grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8";

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
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      {product.isOffer && product.discountPercent ? (
        <Badge className="absolute right-3 top-3 z-20 border-0 bg-rose-500 font-extrabold text-white shadow-md text-[10px] tracking-wider uppercase">
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
          className="aspect-3/4 w-full rounded-none transition-opacity duration-200 group-hover:opacity-75 sm:aspect-auto sm:h-80"
          sizes="(max-width:640px) 100vw, 360px"
        />
        <PlatformBadge
          platform={product.platform}
          overlay
          className="absolute left-3 top-3 z-20"
        />
        {isPreorder ? (
          <Badge
            variant="outline"
            className="absolute left-3 top-14 z-20 border-violet-500/30 bg-background text-violet-600 font-bold text-[10px] shadow-md backdrop-blur-sm dark:bg-zinc-950 dark:text-violet-400"
          >
            <IconClock className="size-3" aria-hidden />
            Preventa
          </Badge>
        ) : null}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-foreground">
          <Link
            href={storeRoutes.product(product.slug)}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </h3>

        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        ) : null}

        <div className="flex flex-1 flex-col justify-end gap-3 pt-1">
          {metaLine ? (
            <p className="text-sm text-muted-foreground italic line-clamp-1">
              {metaLine}
            </p>
          ) : null}

          <div className="flex items-end justify-between gap-2 border-t border-border/50 pt-3">
            <div className="min-w-0">
              {product.listPrice ? (
                <p className="text-xs text-muted-foreground line-through tabular-nums">
                  {formatMoney(product.listPrice)}
                </p>
              ) : null}
              <p className="text-base font-medium tabular-nums text-foreground">
                {formatMoney(displayPrice)}
              </p>
            </div>
            <p className="shrink-0 text-xs font-medium tabular-nums">
              {isPreorder ? (
                <span className="text-violet-500">Reserva</span>
              ) : qty > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {qty} en stock
                </span>
              ) : (
                <span className="text-muted-foreground">Agotado</span>
              )}
            </p>
          </div>

          {product.isOffer ? (
            <p className="flex items-center gap-0.5 text-xs font-semibold text-rose-500">
              <IconBolt className="size-3" aria-hidden />
              Oferta activa
            </p>
          ) : null}

          {isPreorder && product.releaseDate ? (
            <p className="flex items-center gap-1 text-xs font-medium text-violet-500">
              <IconCalendar className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{product.releaseDate}</span>
            </p>
          ) : null}

          <ProductStoreActions
            productId={product.id}
            compact
            disabled={!inStock}
            className="relative z-10 w-full flex-row gap-2 [&_button]:min-h-9 [&_button]:flex-1 [&_button]:text-xs"
          />
        </div>
      </div>
    </article>
  );
}
