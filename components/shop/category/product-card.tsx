"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Heart,
  ImageIcon,
  ShoppingBag,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sounds";
import { addToCartAction } from "@/lib/store/cart/actions";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";
import type { CategoryProduct } from "./types";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const categoryProductImageSizes =
  "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, (max-width: 1536px) 22vw, 200px";

interface ProductCardProps {
  readonly product: CategoryProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const imageSrc =
    product.coverImageUrl ||
    product.images.find((img) => img.isCover)?.url ||
    product.images[0]?.url ||
    null;

  const isOutOfStock = product.qty <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isPending) return;

    startTransition(async () => {
      const result = await addToCartAction(product.id, 1);
      if (!result.success) {
        playSound("caution");
        toast.error(result.error);
        return;
      }
      playSound("notification");
      toast.success(result.message ?? `"${product.name}" agregado al carrito.`);
      router.refresh();
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toast.success(`¡"${product.name}" guardado en favoritos!`, {
      description: "Se ha añadido a tu lista de deseos.",
    });
  };

  return (
    <Link
      href={storeRoutes.product(product.slug)}
      className="group block h-full"
    >
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden bg-card transition-shadow duration-200",
          "rounded-md border border-border ring-1 ring-border/40 hover:shadow-md",
          "lg:glass-card lg:glass-card-hover lg:rounded-2xl lg:ring-0",
        )}
      >
        <div className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden bg-muted lg:aspect-4/3">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              unoptimized
              sizes={categoryProductImageSizes}
              className="object-cover object-center transition-transform duration-300 ease-out motion-safe:lg:group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-indigo-500/10">
              <ImageIcon className="size-10 text-primary/30" aria-hidden />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 motion-safe:lg:group-hover:opacity-100" />

          <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1 sm:top-3 sm:left-3 sm:gap-1.5">
            {product.isOffer ? (
              <Badge className="rounded-md border-none bg-red-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm hover:bg-red-600 sm:px-2 sm:text-[10px]">
                Oferta
              </Badge>
            ) : null}
            {product.isFeatured ? (
              <Badge className="rounded-md border-none bg-primary px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary-foreground uppercase shadow-sm hover:bg-primary/90 sm:px-2 sm:text-[10px]">
                Destacado
              </Badge>
            ) : null}
            {product.isPreorder ? (
              <Badge className="rounded-md border-none bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm hover:bg-blue-600 sm:px-2 sm:text-[10px]">
                Preventa
              </Badge>
            ) : null}
            {isOutOfStock ? (
              <Badge
                variant="secondary"
                className="rounded-md border-none bg-muted-foreground/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-foreground uppercase shadow-sm hover:bg-muted-foreground/30 sm:px-2 sm:text-[10px]"
              >
                Sin Stock
              </Badge>
            ) : null}
          </div>

          <div className="absolute right-2 bottom-2 z-10 hidden translate-y-2 gap-2 opacity-0 transition-all duration-300 motion-safe:lg:group-hover:translate-y-0 motion-safe:lg:group-hover:opacity-100 lg:flex">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl border border-border bg-background/90 text-foreground shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-background"
              onClick={handleAddToWishlist}
              aria-label="Agregar a la lista de deseos"
            >
              <Heart className="h-4.5 w-4.5 text-red-500" />
            </Button>
            <Button
              variant="default"
              size="icon"
              disabled={isOutOfStock || isPending}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-2.5 p-2.5 sm:gap-3 sm:p-3 lg:gap-4 lg:p-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground uppercase sm:gap-2 sm:text-[10px]">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px]">
                {product.platform}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Globe className="h-3 w-3" />
                {product.regionName || "Global"}
              </span>
            </div>

            <h3 className="font-heading text-[11px] leading-snug font-bold text-foreground transition-colors duration-200 line-clamp-2 group-hover:text-primary sm:text-sm">
              {product.name}
            </h3>
          </div>

          <div className="flex items-end justify-between border-t border-border/40 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] leading-none font-medium text-muted-foreground sm:text-xs">
                Precio final
              </span>
              <span className="mt-0.5 text-xs font-extrabold tracking-tight text-foreground tabular-nums sm:text-base">
                {clpFormatter.format(product.sellPrice)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              <ShieldCheck
                className={cn(
                  "h-3.5 w-3.5",
                  isOutOfStock ? "text-muted-foreground" : "text-emerald-500",
                )}
              />
              <span>{isOutOfStock ? "A pedido" : "Entrega digital"}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
