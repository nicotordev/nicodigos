"use client";

import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import type { CategoryProduct } from "./types";

export const categoryProductGridClassName =
  "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4";

interface ProductGridProps {
  readonly products: ReadonlyArray<CategoryProduct>;
  readonly onClearFilters: () => void;
}

export function ProductGrid({ products, onClearFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-5 rounded-2xl border border-border/80 bg-card/40 px-4 py-14 text-center sm:space-y-6 sm:rounded-3xl sm:px-6 sm:py-20 lg:backdrop-blur-[4px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-16 sm:w-16">
          <IconDeviceGamepad2 className="size-7 sm:size-8" aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            No encontramos productos para estos filtros
          </h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Prueba ajustando la plataforma, precio o disponibilidad.
          </p>
        </div>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="min-h-11 rounded-xl border-border px-6 font-semibold hover:bg-muted"
        >
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className={categoryProductGridClassName}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
