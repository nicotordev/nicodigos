"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SortValue } from "./types";

interface CategorySortTabsProps {
  readonly currentSort: SortValue;
  readonly onSortChange: (value: SortValue) => void;
}

const sortTabs = [
  { value: "featured", label: "Destacados", mobileLabel: "Destacados" },
  { value: "newest", label: "Más nuevos", mobileLabel: "Nuevos" },
  {
    value: "price-asc",
    label: "Precio menor a mayor",
    mobileLabel: "Menor precio",
  },
  {
    value: "price-desc",
    label: "Precio mayor a menor",
    mobileLabel: "Mayor precio",
  },
  { value: "offers", label: "Ofertas", mobileLabel: "Ofertas" },
] as const;

const tabTriggerClassName =
  "rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 pt-2 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-sm";

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
      <TabsList
        className={cn(
          "flex h-auto w-full justify-start gap-4 overflow-x-auto overflow-y-hidden rounded-none border-b border-border bg-transparent p-0 scrollbar-none sm:gap-6",
          "-mx-4 px-4 sm:mx-0 sm:px-0",
        )}
      >
        {sortTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={tabTriggerClassName}
          >
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
