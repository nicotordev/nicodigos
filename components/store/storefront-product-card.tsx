import Link from "next/link";
import { IconBolt, IconClock, IconCalendar } from "@tabler/icons-react";

import { ProductStoreActions } from "@/components/store/product-store-actions";
import { StoreProductCover } from "@/components/store/store-product-cover";
import { PlatformBadge } from "@/components/store/platform-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/currency/format";
import { storeRoutes } from "@/lib/store/navigation";
import type { StorefrontProductCard } from "@/lib/store/home/types";
import { cn } from "@/lib/utils";

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

export function StorefrontProductCardView({
  product,
  className,
}: StorefrontProductCardProps) {
  const isPreorder = !!product.isPreorder;
  const qty = product.qty ?? 1;
  const inStock = qty > 0 || isPreorder;
  const displayPrice = product.offer?.sellPrice ?? product.sellPrice;

  return (
    <Card
      size="sm"
      className={cn(
        "group relative h-full gap-0 overflow-hidden py-0 border border-border/80 bg-card rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 pt-0!",
        className,
      )}
    >
      {product.isOffer && product.discountPercent ? (
        <Badge className="absolute right-3 top-3 z-20 border-0 bg-rose-500 font-extrabold text-white shadow-md text-[10px] tracking-wider uppercase">
          -{product.discountPercent}% OFF
        </Badge>
      ) : null}
      {isPreorder ? (
        <Badge
          variant="outline"
          className="absolute left-3 top-3 z-20 border-violet-500/20 bg-violet-500/10 text-violet-400 font-bold text-[10px]"
        >
          <IconClock className="size-3" aria-hidden />
          Preventa
        </Badge>
      ) : null}

      <Link
        href={storeRoutes.product(product.slug)}
        className="relative block aspect-16/10 overflow-hidden bg-muted/40 border-b border-border/40"
      >
        <StoreProductCover
          src={product.coverImageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] rounded-none"
          sizes="(max-width:640px) 100vw, 280px"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      <CardHeader className="gap-2.5 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <PlatformBadge platform={product.platform} />
          {product.regionName ? (
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-muted-foreground/80 bg-muted/40 border border-border/40 px-1.5 py-0.5 rounded-xs">
              {product.regionName === "Global" ? "🔑 Global" : `🇨🇱 ${product.regionName}`}
            </span>
          ) : null}
        </div>
        
        <CardTitle className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-snug group-hover:text-primary transition-colors duration-200">
          <Link
            href={storeRoutes.product(product.slug)}
            className="hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
        </CardTitle>
        {isPreorder ? (
          product.releaseDate ? (
            <p className="flex items-center gap-1 text-[11px] text-violet-400 font-semibold">
              <IconCalendar className="size-3.5" aria-hidden />
              Lanzamiento: {product.releaseDate}
            </p>
          ) : (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <IconClock className="size-3.5" aria-hidden />
              Fecha por confirmar
            </p>
          )
        ) : product.genres && product.genres.length > 0 ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground/80">
            {product.genres.slice(0, 2).join(" · ")}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="px-4 pt-3 pb-0">
        <div className="flex items-end justify-between gap-2 border-t border-border/40 pt-3">
          <div className="min-w-0">
            {product.listPrice ? (
              <p className="text-[11px] text-muted-foreground/75 line-through decoration-muted-foreground/50 tabular-nums">
                {formatMoney(product.listPrice)}
              </p>
            ) : null}
            <p className="text-[17px] font-black tracking-tight tabular-nums text-foreground leading-none mt-1">
              {formatMoney(displayPrice)}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-0.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Stock real
            </p>
            <div className="flex items-center gap-1 text-xs font-bold tabular-nums">
              {isPreorder ? (
                <span className="text-violet-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Reserva
                </span>
              ) : qty > 0 ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {qty} disponible{qty > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-muted-foreground/80 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                  Sin stock
                </span>
              )}
            </div>
          </div>
        </div>
        {product.isOffer ? (
          <p className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-rose-500">
            <IconBolt className="size-3.5" aria-hidden />
            ¡Está filete!
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="px-4 pt-3.5 pb-4">
        <ProductStoreActions
          productId={product.id}
          compact
          disabled={!inStock}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
