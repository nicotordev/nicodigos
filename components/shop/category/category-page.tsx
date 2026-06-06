"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CategoryHero } from "./category-hero";
import { CategorySidebar } from "./category-sidebar";
import { CategoryFilters } from "./category-filters";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { CategorySortTabs } from "./category-sort-tabs";
import { ProductGrid } from "./product-grid";
import { CategoryTrustBadges } from "./category-trust-badges";
import type { CategoryViewModel, CategoryProduct, SortValue } from "./types";

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

  const productCountLabel = `${productCount} ${
    productCount === 1 ? "producto digital" : "productos digitales"
  }`;

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
    <div className="flex min-h-screen flex-col bg-background">
      <CategoryHero category={category} productCount={productCount} />

      <main
        id="catalog-section"
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 scroll-mt-6 px-4 py-6 sm:px-6 sm:py-8 lg:gap-8 lg:px-8 lg:py-10"
      >
        {/* Section intro — desktop */}
        <div className="hidden flex-col justify-between gap-4 border-b border-border/80 pb-6 lg:flex lg:flex-row lg:items-center">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">
              {category.name}
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {productCountLabel}
            </p>
          </div>

          <CategoryTrustBadges className="flex flex-wrap gap-2" />
        </div>

        {/* Section intro — mobile */}
        <div className="space-y-1 lg:hidden">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Catálogo de {category.name}
          </h2>
          <p className="text-sm text-muted-foreground">{productCountLabel}</p>
        </div>

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-12">
          <MobileFilterSheet>
            <CategoryFilters
              siblingCategories={siblingCategories}
              activeCategorySlug={category.slug}
              filters={activeFilters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
              showHeader={false}
            />
          </MobileFilterSheet>

          <CategorySidebar>
            <CategoryFilters
              siblingCategories={siblingCategories}
              activeCategorySlug={category.slug}
              filters={activeFilters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
            />
          </CategorySidebar>

          <div className="w-full flex-1 space-y-4 sm:space-y-6">
            <div className="w-full border-b border-border/40 pb-2">
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
