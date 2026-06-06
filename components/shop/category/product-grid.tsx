"use client";

import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import type { CategoryProduct } from "./types";

interface ProductGridProps {
  readonly products: ReadonlyArray<CategoryProduct>;
  readonly onClearFilters: () => void;
}

export function ProductGrid({ products, onClearFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card/40 rounded-3xl border border-border/80 backdrop-blur-[4px] max-w-2xl mx-auto space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            No encontramos productos para estos filtros
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Prueba ajustando la plataforma, precio o disponibilidad.
          </p>
        </div>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="rounded-xl border-border hover:bg-muted font-semibold px-6"
        >
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
