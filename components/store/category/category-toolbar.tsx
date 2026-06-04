"use client";

import Link from "next/link";
import { IconAdjustments, IconFilter } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
} from "@/lib/store/catalog/types";
import type { CategoryProductsFilters } from "@/lib/store/category/types";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";

type CategoryToolbarProps = {
  categorySlug: string;
  categoryName: string;
  filters: CategoryProductsFilters;
  onChange: (patch: Partial<CategoryProductsFilters>) => void;
  isLoading?: boolean;
  className?: string;
};

export function CategoryToolbar({
  categorySlug,
  categoryName,
  filters,
  onChange,
  isLoading,
  className,
}: CategoryToolbarProps) {
  const catalogHref = `${storeRoutes.catalog}?category=${encodeURIComponent(categorySlug)}`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5",
        isLoading && "opacity-80",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IconFilter className="size-4 text-primary" aria-hidden />
          Ordenar keys en {categoryName}
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
          <Link href={catalogHref}>
            <IconAdjustments className="size-3.5" aria-hidden />
            Más filtros en catálogo
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="category-sort"
            className="text-xs text-muted-foreground"
          >
            Orden
          </Label>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              onChange({
                sort: value as CategoryProductsFilters["sort"],
                page: 1,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="category-sort" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATALOG_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="category-page-size"
            className="text-xs text-muted-foreground"
          >
            Por página
          </Label>
          <Select
            value={String(filters.pageSize)}
            onValueChange={(value) =>
              onChange({
                pageSize: Number(value) as CategoryProductsFilters["pageSize"],
                page: 1,
              })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="category-page-size" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATALOG_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} productos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
