"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CategoryProduct } from "./types";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

interface ProductCardProps {
  readonly product: CategoryProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  // Resolve image source
  const imageSrc =
    product.coverImageUrl ||
    product.images.find((img) => img.isCover)?.url ||
    product.images[0]?.url ||
    "/images/shop/product-placeholder.webp";

  const isOutOfStock = product.qty <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    toast.success(`¡"${product.name}" agregado al carrito!`, {
      description: "Puedes revisar tu carrito para proceder con el pago.",
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
    <Link href={`/productos/${product.slug}`} className="block group">
      <Card className="glass-card glass-card-hover group overflow-hidden rounded-2xl border-border flex flex-col h-full bg-card">
        {/* Image Area */}
        <div className="aspect-[4/3] bg-muted relative w-full overflow-hidden flex items-center justify-center">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges container (top left) */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
            {product.isOffer && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border-none">
                Oferta
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border-none">
                Destacado
              </Badge>
            )}
            {product.isPreorder && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border-none">
                Preventa
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="bg-muted-foreground/20 hover:bg-muted-foreground/30 text-foreground font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border-none">
                Sin Stock
              </Badge>
            )}
          </div>

          {/* Floating Actions (bottom right / overlay on hover) */}
          <div className="absolute bottom-3 right-3 z-10 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-xl shadow-lg border border-border bg-background/90 text-foreground hover:bg-background transition-transform duration-200 hover:scale-105"
              onClick={handleAddToWishlist}
              aria-label="Agregar a la lista de deseos"
            >
              <Heart className="h-4.5 w-4.5 text-red-500" />
            </Button>
            <Button
              variant="default"
              size="icon"
              disabled={isOutOfStock}
              className="h-9 w-9 rounded-xl shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              aria-label="Agregar al carrito"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-1.5">
            {/* Metadata (Platform & Region) */}
            <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold">
                {product.platform}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Globe className="h-3 w-3" />
                {product.regionName || "Global"}
              </span>
            </div>

            {/* Product Name */}
            <h3 className="font-heading font-bold text-sm leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
          </div>

          {/* Pricing & Checkout summary */}
          <div className="flex items-end justify-between pt-2 border-t border-border/40">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium leading-none">Precio final</span>
              <span className="text-base font-extrabold text-foreground tracking-tight mt-0.5">
                {clpFormatter.format(product.sellPrice)}
              </span>
            </div>
            
            {/* Soft stock state indicator */}
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <ShieldCheck className={`h-3.5 w-3.5 ${isOutOfStock ? "text-muted-foreground" : "text-emerald-500"}`} />
              <span>{isOutOfStock ? "A pedido" : "Entrega digital"}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
