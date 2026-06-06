"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CategoryHero } from "./category-hero";
import { CategorySidebar } from "./category-sidebar";
import { CategoryFilters } from "./category-filters";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { CategorySortTabs } from "./category-sort-tabs";
import { ProductGrid } from "./product-grid";
import type { 
  CategoryViewModel, 
  CategoryProduct, 
  SortValue 
} from "./types";

interface CategoryPageProps {
  readonly category: CategoryViewModel;
  readonly products: ReadonlyArray<CategoryProduct>;
  readonly siblingCategories: ReadonlyArray<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  readonly productCount: number;
}

export function CategoryPage({
  category,
  products,
  siblingCategories,
  productCount,
}: CategoryPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filters and sort value from URL search params
  const sort = (searchParams.get("sort") as SortValue) || "featured";
  const platform = searchParams.get("platform") || "";
  const genre = searchParams.get("genre") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const availability = searchParams.get("availability") || "";
  const region = searchParams.get("region") || "";

  const activeFilters = {
    platform,
    genre,
    minPrice,
    maxPrice,
    availability,
    region,
  };

  const handleUpdateQuery = (updated: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updated).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: string, value: string) => {
    handleUpdateQuery({ [key]: value });
  };

  const handlePriceChange = (min: string, max: string) => {
    handleUpdateQuery({ minPrice: min, maxPrice: max });
  };

  const handleSortChange = (newSort: SortValue) => {
    handleUpdateQuery({ sort: newSort });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (sort !== "featured") {
      params.set("sort", sort);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Category Hero Section */}
      <CategoryHero category={category} productCount={productCount} />

      {/* Main Catalog Section */}
      <main 
        id="catalog-section" 
        className="max-w-8xl mx-auto w-full px-6 md:px-12 py-10 flex flex-col gap-8 scroll-mt-6"
      >
        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-heading font-black uppercase tracking-wide text-foreground">
              {category.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <span>{productCount} {productCount === 1 ? "producto digital" : "productos digitales"}</span>
            </div>
          </div>

          {/* Premium Storefront Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold text-xs py-1 px-3">
              Entrega digital rápida
            </Badge>
            <Badge variant="outline" className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold text-xs py-1 px-3">
              Stock disponible
            </Badge>
            <Badge variant="outline" className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold text-xs py-1 px-3">
              Keys globales/regionales
            </Badge>
            <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold text-xs py-1 px-3">
              Ofertas activas
            </Badge>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
          {/* Mobile Filter Button */}
          <MobileFilterSheet>
            <CategoryFilters
              siblingCategories={siblingCategories}
              activeCategorySlug={category.slug}
              filters={activeFilters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
            />
          </MobileFilterSheet>

          {/* Desktop Sticky Sidebar */}
          <CategorySidebar>
            <CategoryFilters
              siblingCategories={siblingCategories}
              activeCategorySlug={category.slug}
              filters={activeFilters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
            />
          </CategorySidebar>

          {/* Grid and Sort Controls */}
          <div className="flex-1 w-full space-y-6">
            <div className="w-full flex items-center justify-between pb-2 border-b border-border/40">
              <CategorySortTabs
                currentSort={sort}
                onSortChange={handleSortChange}
              />
            </div>

            <ProductGrid
              products={products}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
