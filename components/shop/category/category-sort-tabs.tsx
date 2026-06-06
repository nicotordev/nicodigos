"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SortValue } from "./types";

interface CategorySortTabsProps {
  readonly currentSort: SortValue;
  readonly onSortChange: (value: SortValue) => void;
}

export function CategorySortTabs({
  currentSort,
  onSortChange,
}: CategorySortTabsProps) {
  return (
    <Tabs
      value={currentSort}
      onValueChange={(val) => onSortChange(val as SortValue)}
      className="w-full"
    >
      <TabsList className="flex w-full justify-start overflow-x-auto overflow-y-hidden bg-transparent border-b border-border rounded-none h-auto p-0 gap-6 scrollbar-none">
        <TabsTrigger
          value="featured"
          className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-200"
        >
          Destacados
        </TabsTrigger>
        <TabsTrigger
          value="newest"
          className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-200"
        >
          Más nuevos
        </TabsTrigger>
        <TabsTrigger
          value="price-asc"
          className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-200"
        >
          Precio menor a mayor
        </TabsTrigger>
        <TabsTrigger
          value="price-desc"
          className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-200"
        >
          Precio mayor a menor
        </TabsTrigger>
        <TabsTrigger
          value="offers"
          className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all duration-200"
        >
          Ofertas
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
