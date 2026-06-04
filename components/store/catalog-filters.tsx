"use client";

import { useEffect, useState } from "react";
import { IconFilter, IconSearch, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getPlatformIconConfig } from "@/lib/store/platform-icons";
import {
  CATALOG_PAGE_SIZE_OPTIONS,
  CATALOG_SORT_OPTIONS,
  type CatalogFilterOptions,
  type CatalogFilters,
} from "@/lib/store/catalog/types";
import { cn } from "@/lib/utils";

type CatalogFiltersProps = {
  filters: CatalogFilters;
  options: CatalogFilterOptions;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  isLoading?: boolean;
  className?: string;
};

export function CatalogFiltersBar({
  filters,
  options,
  onChange,
  onReset,
  hasActiveFilters,
  isLoading,
  className,
}: CatalogFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.q);

  useEffect(() => {
    setSearchDraft(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchDraft !== filters.q) {
        onChange({ q: searchDraft, page: 1 });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchDraft, filters.q, onChange]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-5",
        isLoading && "opacity-90",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <IconFilter className="size-4 text-primary" aria-hidden />
          Filtra el catálogo
        </div>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-muted-foreground"
            onClick={onReset}
            disabled={isLoading}
          >
            <IconX className="size-3.5" aria-hidden />
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4 space-y-1.5">
          <Label htmlFor="catalog-search" className="text-xs font-semibold">
            Buscar
          </Label>
          <div className="relative">
            <IconSearch
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="catalog-search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Steam, gift card, FIFA…"
              className="pl-8"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoría</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                onChange({ category: value === "all" ? "" : value, page: 1 })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {options.categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name} ({category.productCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Plataforma</Label>
            <Select
              value={filters.platform || "all"}
              onValueChange={(value) =>
                onChange({ platform: value === "all" ? "" : value, page: 1 })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plataformas</SelectItem>
                {options.platforms.map((platform) => {
                  const { label } = getPlatformIconConfig(platform);
                  return (
                    <SelectItem key={platform} value={platform}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ordenar</Label>
            <Select
              value={filters.sort}
              onValueChange={(value) =>
                onChange({
                  sort: value as CatalogFilters["sort"],
                  page: 1,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Por página</Label>
            <Select
              value={String(filters.pageSize)}
              onValueChange={(value) =>
                onChange({
                  pageSize: Number(value) as CatalogFilters["pageSize"],
                  page: 1,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
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

      <div className="mt-4 flex flex-wrap gap-6 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2">
          <Switch
            id="catalog-offers"
            checked={filters.offersOnly}
            onCheckedChange={(checked) =>
              onChange({ offersOnly: checked, page: 1 })
            }
            disabled={isLoading}
          />
          <Label htmlFor="catalog-offers" className="text-sm font-medium">
            Solo ofertas
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="catalog-preorders"
            checked={filters.preordersOnly}
            onCheckedChange={(checked) =>
              onChange({ preordersOnly: checked, page: 1 })
            }
            disabled={isLoading}
          />
          <Label htmlFor="catalog-preorders" className="text-sm font-medium">
            Solo preventas
          </Label>
        </div>
      </div>
    </div>
  );
}
