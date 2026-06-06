"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { storeRoutes } from "@/lib/store/navigation";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PriceFilter } from "./price-filter";
import { PlatformFilter } from "./platform-filter";
import { AvailabilityFilter } from "./availability-filter";
import { RegionFilter } from "./region-filter";

const GENRES: readonly string[] = [
  "Action",
  "RPG",
  "Adventure",
  "Sports",
  "Racing",
  "Strategy",
  "Simulation",
];

export type CategoryFilterState = {
  platform: string;
  genre: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
  region: string;
};

interface CategoryFiltersProps {
  readonly siblingCategories: ReadonlyArray<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  readonly activeCategorySlug: string;
  readonly filters: CategoryFilterState;
  readonly onFilterChange: (
    key: keyof CategoryFilterState,
    value: string,
  ) => void;
  readonly onPriceChange: (min: string, max: string) => void;
  readonly showHeader?: boolean;
}

const filterRowClassName = "flex min-h-11 items-center space-x-2 py-1.5";

export function CategoryFilters({
  siblingCategories,
  activeCategorySlug,
  filters,
  onFilterChange,
  onPriceChange,
  showHeader = true,
}: CategoryFiltersProps) {
  const activeGenres = filters.genre
    ? filters.genre.split(",").map((g) => g.trim())
    : [];

  const handleGenreToggle = (genre: string, checked: boolean) => {
    let newList: string[];
    if (checked) {
      newList = [...activeGenres, genre];
    } else {
      newList = activeGenres.filter((g) => g !== genre);
    }
    onFilterChange("genre", newList.join(","));
  };

  const handleClearFilters = () => {
    onFilterChange("platform", "");
    onFilterChange("genre", "");
    onFilterChange("availability", "");
    onFilterChange("region", "");
    onPriceChange("", "");
  };

  return (
    <div className="w-full space-y-6">
      {showHeader ? (
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-lg font-semibold tracking-tight">Filtros</h3>
          <button
            type="button"
            onClick={handleClearFilters}
            className="min-h-11 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClearFilters}
          className="min-h-11 w-full text-left text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          Limpiar filtros
        </button>
      )}

      <Accordion
        type="multiple"
        defaultValue={[
          "categories",
          "platform",
          "genre",
          "price",
          "availability",
          "region",
        ]}
        className="w-full border-none"
      >
        {/* Categories Section */}
        {siblingCategories.length > 0 && (
          <AccordionItem
            value="categories"
            className="border-b border-border/60"
          >
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Categorías
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-3">
              <div className="space-y-1">
                {siblingCategories.map((cat) => {
                  const isActive = cat.slug === activeCategorySlug;
                  return (
                    <Link
                      key={cat.id}
                      href={storeRoutes.category(cat.slug)}
                      className={cn(
                        "flex min-h-11 items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted-foreground/10 px-1.5 py-0.5 rounded-md font-mono">
                        {cat.productCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Platform Section */}
        <AccordionItem value="platform" className="border-b border-border/60">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Plataforma
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <PlatformFilter
              selectedPlatforms={filters.platform}
              onChange={(val) => onFilterChange("platform", val)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Genre Section */}
        <AccordionItem value="genre" className="border-b border-border/60">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Género
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <div className="space-y-3">
              {GENRES.map((genre) => {
                const isChecked = activeGenres.includes(genre);
                const id = `genre-${genre.toLowerCase()}`;
                return (
                  <div key={genre} className={filterRowClassName}>
                    <Checkbox
                      id={id}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleGenreToggle(genre, !!checked)
                      }
                    />
                    <Label
                      htmlFor={id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {genre}
                    </Label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Section */}
        <AccordionItem value="price" className="border-b border-border/60">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Precio
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <PriceFilter
              currentMinPrice={filters.minPrice}
              currentMaxPrice={filters.maxPrice}
              onChange={onPriceChange}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Availability Section */}
        <AccordionItem
          value="availability"
          className="border-b border-border/60"
        >
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Disponibilidad
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <AvailabilityFilter
              selectedAvailability={filters.availability}
              onChange={(val) => onFilterChange("availability", val)}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Region Section */}
        <AccordionItem value="region" className="border-none">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
            Región de Activación
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <RegionFilter
              selectedRegions={filters.region}
              onChange={(val) => onFilterChange("region", val)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
